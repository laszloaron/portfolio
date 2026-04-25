from __future__ import annotations

from pydantic import PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://portfolio:changeme@db:5432/portfolio_db"

    # JWT
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""

    # SMTP (Email)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@example.com"
    CONTACT_EMAIL: str = "" # The email address that will receive the contact form submissions

    # AI Chatbot
    OPENAI_API_KEY: str = ""
    CHAT_MODEL: str = "gpt-4o-mini"
    CHAT_MAX_HISTORY: int = 20
    CHAT_RATE_LIMIT_PER_MIN: int = 20

    # App
    ENVIRONMENT: str = "development"
    APP_NAME: str = "Portfolio API"
    API_V1_PREFIX: str = "/api/v1"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


settings = Settings()
