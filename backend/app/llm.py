from typing import Dict, Any
import logging

from app.config import settings

logger = logging.getLogger(__name__)

async def call_llm(prompt: str, model: str = None) -> Dict[str, Any]:
    """
    Call LLM provider based on settings.LLM_PROVIDER.
    Currently supports 'anthropic' and 'openai'.

    Args:
        prompt: The prompt to send to the LLM
        model: Optional model override

    Returns:
        Dict containing the LLM response
    """
    provider = settings.LLM_PROVIDER
    logger.info(f"Calling LLM with provider: {provider}")

    if provider == "anthropic":
        return await _call_anthropic(prompt, model)
    elif provider == "openai":
        return await _call_openai(prompt, model)
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")

async def _call_anthropic(prompt: str, model: str = None) -> Dict[str, Any]:
    """
    Stub implementation for Anthropic API calls.
    Will be implemented when connecting to Claude API.
    """
    return {
        "provider": "anthropic",
        "status": "stub",
        "message": "Anthropic integration not yet implemented"
    }

async def _call_openai(prompt: str, model: str = None) -> Dict[str, Any]:
    """
    Stub implementation for OpenAI API calls.
    Will be implemented when connecting to OpenAI API.
    """
    return {
        "provider": "openai",
        "status": "stub",
        "message": "OpenAI integration not yet implemented"
    }
