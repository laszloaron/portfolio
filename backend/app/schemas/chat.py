"""Pydantic schemas for the AI chatbot endpoints."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# ─── Request ──────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    """A single message in the conversation history."""
    role: Literal["user", "assistant"] = Field(..., description="Who sent this message")
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    """Incoming chat request from the frontend."""
    message: str = Field(..., min_length=1, max_length=2000, description="The user's question")
    history: list[ChatMessage] = Field(
        default_factory=list,
        max_length=20,
        description="Previous messages for context (max 20)",
    )
    language: str = Field(default="hu", pattern=r"^(hu|en)$", description="UI language code")


# ─── Response ─────────────────────────────────────────────────────────────────

class Source(BaseModel):
    """A citation / source reference for a claim made by the bot."""
    type: str = Field(..., description="Source category: about | project | skills")
    label: str = Field(..., description="Human-readable source name")
    detail: str | None = Field(None, description="Optional extra context")


class ChatResponse(BaseModel):
    """Complete chat response returned by the AI agent."""
    answer: str = Field(..., description="Markdown-formatted answer")
    sources: list[Source] = Field(default_factory=list, description="Sources cited")


# ─── SSE chunk types ──────────────────────────────────────────────────────────

class StreamDelta(BaseModel):
    """A single streaming text chunk."""
    type: Literal["delta"] = "delta"
    content: str


class StreamSources(BaseModel):
    """Sources sent at the end of a streaming response."""
    type: Literal["sources"] = "sources"
    sources: list[Source]


class StreamDone(BaseModel):
    """Sentinel indicating end of stream."""
    type: Literal["done"] = "done"
