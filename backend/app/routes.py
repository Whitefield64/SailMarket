from datetime import datetime
from fastapi import APIRouter

from app.schemas import HealthResponse, DebugConfigResponse
from app.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        timestamp=datetime.now().isoformat()
    )

@router.get("/debug/config", response_model=DebugConfigResponse)
async def debug_config() -> DebugConfigResponse:
    return DebugConfigResponse(
        llm_provider=settings.LLM_PROVIDER,
        mcp_transport=settings.MCP_TRANSPORT
    )
