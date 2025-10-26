from pydantic_settings import BaseSettings
from typing import Literal

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@database:5432/marketing_ai"
    LLM_PROVIDER: Literal["anthropic", "openai"] = "anthropic"
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    MCP_TRANSPORT: Literal["sse", "stdio"] = "sse"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
