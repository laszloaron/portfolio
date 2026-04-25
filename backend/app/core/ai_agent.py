"""
Pydantic AI agent definition for the portfolio chatbot.

The agent uses tool-calling to fetch real data from the database
and always cites its sources in the response text.

The result_type is `str` (plain text with Markdown) to enable SSE streaming.
Source citations are embedded inline in the response via the system prompt.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from pydantic_ai import Agent, RunContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.about import AboutProfile
from app.models.models import Project

logger = logging.getLogger(__name__)

# ─── Dependencies injected into every tool call ──────────────────────────────

@dataclass
class ChatDeps:
    """Runtime dependencies available to every tool via RunContext."""
    db: AsyncSession
    language: str  # "hu" | "en"


# ─── System Prompt ────────────────────────────────────────────────────────────

_SYSTEM_PROMPT_TEMPLATE = """\
Te egy professzionális portfólió asszisztens vagy, aki a portfólió tulajdonosát mutatja be \
a látogatóknak.

## SZABÁLYOK
1. MINDIG használd a rendelkezésre álló tool-okat az információ összegyűjtéséhez, \
   MIELŐTT válaszolsz. SOHA ne találj ki adatokat!
2. Minden állításodhoz add meg a forrást a válaszod végén zárójelben, pl.: \
   *(Forrás: Rólam szekció)* vagy *(Forrás: Projektek lista)*.
3. Ha nincs releváns információd egy kérdésre, mondd el őszintén, hogy nem rendelkezel \
   azzal az adattal.
4. Légy barátságos, professzionális és tömör.
5. Válaszolj a felhasználó nyelvén: **{language_name}**.
6. Ha projektekről kérdeznek, említsd meg a GitHub linkeket is, ha elérhetők.
7. NE válaszolj olyan kérdésekre, amelyek nem kapcsolódnak a portfólió tulajdonosához, \
   annak projektjeihez vagy szakmai hátteréhez. Ilyen esetben udvariasan tereld \
   vissza a beszélgetést.
8. Markdown formázást használhatsz a válaszaidban (félkövér, lista, stb.).
9. MINDIG a tool-okból kapott adatokat használd, saját háttértudásodra NE támaszkodj \
   a tulajdonosról.
10. Rövid, tömör válaszokat adj — max 3-4 bekezdés, kivéve ha a felhasználó \
    kifejezetten részletesebb választ kér.
"""

_LANGUAGE_MAP = {"hu": "Magyar", "en": "English"}


def _build_system_prompt(language: str) -> str:
    lang_name = _LANGUAGE_MAP.get(language, "Magyar")
    return _SYSTEM_PROMPT_TEMPLATE.format(language_name=lang_name)


# ─── Agent ────────────────────────────────────────────────────────────────────
# output_type=str enables stream_text() for SSE streaming.
# Source citations are embedded inline by the system prompt.

agent = Agent(
    f"openai:{settings.CHAT_MODEL}",
    output_type=str,
    deps_type=ChatDeps,
    system_prompt=_build_system_prompt("hu"),  # default; overridden per-request
    output_retries=2,
)


# ─── Dynamic system prompt (per-request language) ────────────────────────────

@agent.system_prompt
async def dynamic_system_prompt(ctx: RunContext[ChatDeps]) -> str:
    return _build_system_prompt(ctx.deps.language)


# ─── Tools ────────────────────────────────────────────────────────────────────

@agent.tool
async def get_about_me(ctx: RunContext[ChatDeps]) -> str:
    """Fetch the portfolio owner's biography, name, and profile information from the About section."""
    result = await ctx.deps.db.execute(select(AboutProfile).where(AboutProfile.id == 1))
    profile = result.scalar_one_or_none()
    if profile is None:
        return "Nincs elérhető 'Rólam' információ az adatbázisban."
    parts = [
        f"Név: {profile.name}",
        f"Bio: {profile.bio}" if profile.bio else "Bio: (üres)",
        f"Profilkép: {'Van feltöltve' if profile.photo_url else 'Nincs feltöltve'}",
    ]
    return "\n".join(parts)


@agent.tool
async def get_all_projects(ctx: RunContext[ChatDeps]) -> str:
    """Fetch the list of all portfolio projects with their names, descriptions, and GitHub links."""
    result = await ctx.deps.db.execute(
        select(Project).order_by(Project.created_at.desc())
    )
    projects = list(result.scalars().all())
    if not projects:
        return "Jelenleg nincsenek projektek az adatbázisban."
    lines: list[str] = []
    for p in projects:
        desc_preview = p.description[:300] if p.description else "(nincs leírás)"
        lines.append(f"- **{p.name}**: {desc_preview}")
        if p.github_link:
            lines.append(f"  GitHub: {p.github_link}")
    return "\n".join(lines)


@agent.tool
async def get_project_detail(ctx: RunContext[ChatDeps], project_name: str) -> str:
    """Get detailed information about a specific project by searching for its name. Includes the full documentation if available."""
    result = await ctx.deps.db.execute(
        select(Project).where(Project.name.ilike(f"%{project_name}%"))
    )
    project = result.scalars().first()
    if project is None:
        return f"Nem találtam '{project_name}' nevű projektet az adatbázisban."
    parts = [
        f"Projekt neve: {project.name}",
        f"Leírás: {project.description}",
    ]
    if project.github_link:
        parts.append(f"GitHub: {project.github_link}")
    if project.documentation:
        parts.append(f"Dokumentáció:\n{project.documentation}")
    return "\n".join(parts)


@agent.tool
async def get_skills(ctx: RunContext[ChatDeps]) -> str:
    """Fetch the list of the portfolio owner's skills categorized by type (e.g., languages, frameworks, tools)."""
    from app.models.models import Skill
    result = await ctx.deps.db.execute(select(Skill).order_by(Skill.category))
    skills = result.scalars().all()
    if not skills:
        return "Jelenleg nincsenek specifikus készségek rögzítve az adatbázisban."
    
    categories: dict[str, list[str]] = {}
    for s in skills:
        categories.setdefault(s.category, []).append(s.name)
    
    lines = []
    for cat, items in categories.items():
        lines.append(f"### {cat.capitalize()}\n- " + ", ".join(items))
    return "\n\n".join(lines)
