"""
Chat router — provides streaming (SSE) and non-streaming endpoints for the
AI portfolio chatbot.

Includes basic in-memory rate limiting per IP address.
"""

from __future__ import annotations

import json
import logging
import time
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from pydantic_ai import ModelMessage, ModelRequest, ModelResponse, UserPromptPart, TextPart
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ai_agent import ChatDeps, agent
from app.core.config import settings
from app.core.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


# ─── Simple in-memory rate limiter ────────────────────────────────────────────

_rate_store: dict[str, list[float]] = defaultdict(list)
_WINDOW_SECONDS = 60


def _check_rate_limit(client_ip: str) -> None:
    """Raise HTTP 429 if the client exceeded the rate limit."""
    now = time.time()
    window_start = now - _WINDOW_SECONDS
    # Prune old timestamps
    _rate_store[client_ip] = [
        ts for ts in _rate_store[client_ip] if ts > window_start
    ]
    if len(_rate_store[client_ip]) >= settings.CHAT_RATE_LIMIT_PER_MIN:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many messages. Please wait a moment.",
        )
    _rate_store[client_ip].append(now)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _build_message_history(history: list) -> list[ModelMessage]:
    """Convert the frontend chat history into pydantic-ai ModelMessage objects."""
    messages: list[ModelMessage] = []
    for msg in history:
        if msg.role == "user":
            messages.append(
                ModelRequest(parts=[UserPromptPart(content=msg.content)])
            )
        elif msg.role == "assistant":
            messages.append(
                ModelResponse(parts=[TextPart(content=msg.content)])
            )
    return messages


# ─── Non-streaming endpoint ───────────────────────────────────────────────────

@router.post("/", response_model=ChatResponse, summary="Send a chat message")
async def chat(
    req: ChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    """
    Send a message to the AI chatbot and receive a complete JSON response.

    The bot will use tool calls to fetch data from the database and cite sources
    inline in its answer text.
    """
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    deps = ChatDeps(db=db, language=req.language)
    message_history = _build_message_history(req.history)

    try:
        result = await agent.run(
            req.message,
            deps=deps,
            message_history=message_history,
        )
        return ChatResponse(answer=result.output, sources=[])
    except Exception:
        logger.exception("Chat agent error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your message.",
        )


# ─── SSE streaming endpoint ──────────────────────────────────────────────────

@router.post("/stream", summary="Send a chat message (streaming SSE)")
async def chat_stream(
    req: ChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Send a message to the AI chatbot and receive a streaming SSE response.

    Events:
    - `{"type": "delta", "content": "..."}` — incremental text chunk
    - `[DONE]` — stream sentinel
    """
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    deps = ChatDeps(db=db, language=req.language)
    message_history = _build_message_history(req.history)

    async def event_generator():
        try:
            async with agent.run_stream(
                req.message,
                deps=deps,
                message_history=message_history,
            ) as result:
                async for chunk in result.stream_text(delta=True):
                    payload = json.dumps(
                        {"type": "delta", "content": chunk},
                        ensure_ascii=False,
                    )
                    yield f"data: {payload}\n\n"

        except Exception:
            logger.exception("Chat stream error")
            error_payload = json.dumps(
                {
                    "type": "error",
                    "content": "An error occurred while processing your message.",
                },
                ensure_ascii=False,
            )
            yield f"data: {error_payload}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )
