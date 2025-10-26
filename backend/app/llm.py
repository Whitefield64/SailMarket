from typing import Dict, Any, Optional, AsyncGenerator
import logging
from anthropic import AsyncAnthropic, APIError, RateLimitError
from openai import AsyncOpenAI, APIError as OpenAIAPIError, RateLimitError as OpenAIRateLimitError
import asyncio

from app.config import settings

logger = logging.getLogger(__name__)

class LLMError(Exception):
    """Base exception for LLM-related errors"""
    pass

class LLMRateLimitError(LLMError):
    """Raised when rate limit is hit"""
    pass

class LLMAPIError(LLMError):
    """Raised when API call fails"""
    pass

async def call_llm(
    prompt: str,
    model: Optional[str] = None,
    max_tokens: int = 2048,
    temperature: float = 0.7,
    system_prompt: Optional[str] = None,
    stream: bool = False
) -> Dict[str, Any]:
    """
    Call LLM provider based on settings.LLM_PROVIDER.
    Currently supports 'anthropic' and 'openai'.

    Args:
        prompt: The user prompt to send to the LLM
        model: Optional model override
        max_tokens: Maximum tokens to generate
        temperature: Sampling temperature (0.0-1.0)
        system_prompt: Optional system prompt for context
        stream: Whether to stream the response

    Returns:
        Dict containing the LLM response with keys:
            - provider: str
            - content: str
            - model: str
            - tokens_used: int (if available)

    Raises:
        LLMError: If the API call fails
        LLMRateLimitError: If rate limit is exceeded
    """
    provider = settings.LLM_PROVIDER
    logger.info(f"Calling LLM with provider: {provider}, model: {model}, stream: {stream}")

    try:
        if provider == "anthropic":
            return await _call_anthropic(prompt, model, max_tokens, temperature, system_prompt, stream)
        elif provider == "openai":
            return await _call_openai(prompt, model, max_tokens, temperature, system_prompt, stream)
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
    except Exception as e:
        logger.error(f"LLM call failed: {str(e)}")
        raise

async def call_llm_stream(
    prompt: str,
    model: Optional[str] = None,
    max_tokens: int = 2048,
    temperature: float = 0.7,
    system_prompt: Optional[str] = None
) -> AsyncGenerator[str, None]:
    """
    Call LLM provider with streaming enabled.

    Args:
        prompt: The user prompt to send to the LLM
        model: Optional model override
        max_tokens: Maximum tokens to generate
        temperature: Sampling temperature (0.0-1.0)
        system_prompt: Optional system prompt for context

    Yields:
        str: Chunks of generated text
    """
    provider = settings.LLM_PROVIDER
    logger.info(f"Streaming LLM call with provider: {provider}")

    try:
        if provider == "anthropic":
            async for chunk in _stream_anthropic(prompt, model, max_tokens, temperature, system_prompt):
                yield chunk
        elif provider == "openai":
            async for chunk in _stream_openai(prompt, model, max_tokens, temperature, system_prompt):
                yield chunk
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
    except Exception as e:
        logger.error(f"LLM streaming failed: {str(e)}")
        raise

async def _call_anthropic(
    prompt: str,
    model: Optional[str] = None,
    max_tokens: int = 2048,
    temperature: float = 0.7,
    system_prompt: Optional[str] = None,
    stream: bool = False
) -> Dict[str, Any]:
    """
    Call Anthropic Claude API with retry logic.

    Args:
        prompt: The user prompt
        model: Model name (defaults to claude-3-sonnet-20240229)
        max_tokens: Maximum tokens to generate
        temperature: Sampling temperature
        system_prompt: System prompt for context
        stream: Whether to stream (not used in non-streaming call)

    Returns:
        Dict with response data
    """
    if not settings.ANTHROPIC_API_KEY:
        raise LLMAPIError("ANTHROPIC_API_KEY not configured")

    client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    model = model or "claude-3-5-sonnet-20241022"

    messages = [{"role": "user", "content": prompt}]

    retry_count = 0
    max_retries = 3

    while retry_count < max_retries:
        try:
            logger.info(f"Anthropic API call attempt {retry_count + 1}")

            kwargs = {
                "model": model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": messages
            }

            if system_prompt:
                kwargs["system"] = system_prompt

            response = await client.messages.create(**kwargs)

            content = response.content[0].text if response.content else ""

            result = {
                "provider": "anthropic",
                "content": content,
                "model": model,
                "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens
            }

            logger.info(f"Anthropic API call successful. Tokens used: {result['tokens_used']}")
            return result

        except RateLimitError as e:
            retry_count += 1
            if retry_count >= max_retries:
                logger.error(f"Rate limit exceeded after {max_retries} retries")
                raise LLMRateLimitError(f"Rate limit exceeded: {str(e)}")

            wait_time = 2 ** retry_count
            logger.warning(f"Rate limit hit, waiting {wait_time}s before retry")
            await asyncio.sleep(wait_time)

        except APIError as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise LLMAPIError(f"Anthropic API error: {str(e)}")

async def _stream_anthropic(
    prompt: str,
    model: Optional[str] = None,
    max_tokens: int = 2048,
    temperature: float = 0.7,
    system_prompt: Optional[str] = None
) -> AsyncGenerator[str, None]:
    """
    Stream response from Anthropic Claude API.
    """
    if not settings.ANTHROPIC_API_KEY:
        raise LLMAPIError("ANTHROPIC_API_KEY not configured")

    client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    model = model or "claude-3-5-sonnet-20241022"

    messages = [{"role": "user", "content": prompt}]

    try:
        kwargs = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": messages
        }

        if system_prompt:
            kwargs["system"] = system_prompt

        async with client.messages.stream(**kwargs) as stream:
            async for text in stream.text_stream:
                yield text

    except RateLimitError as e:
        logger.error(f"Anthropic rate limit: {str(e)}")
        raise LLMRateLimitError(f"Rate limit exceeded: {str(e)}")
    except APIError as e:
        logger.error(f"Anthropic API error: {str(e)}")
        raise LLMAPIError(f"Anthropic API error: {str(e)}")

async def _call_openai(
    prompt: str,
    model: Optional[str] = None,
    max_tokens: int = 2048,
    temperature: float = 0.7,
    system_prompt: Optional[str] = None,
    stream: bool = False
) -> Dict[str, Any]:
    """
    Call OpenAI API with retry logic.

    Args:
        prompt: The user prompt
        model: Model name (defaults to gpt-4-turbo-preview)
        max_tokens: Maximum tokens to generate
        temperature: Sampling temperature
        system_prompt: System prompt for context
        stream: Whether to stream (not used in non-streaming call)

    Returns:
        Dict with response data
    """
    if not settings.OPENAI_API_KEY:
        raise LLMAPIError("OPENAI_API_KEY not configured")

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    model = model or "gpt-4-turbo-preview"

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    retry_count = 0
    max_retries = 3

    while retry_count < max_retries:
        try:
            logger.info(f"OpenAI API call attempt {retry_count + 1}")

            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )

            content = response.choices[0].message.content or ""

            result = {
                "provider": "openai",
                "content": content,
                "model": model,
                "tokens_used": response.usage.total_tokens,
                "input_tokens": response.usage.prompt_tokens,
                "output_tokens": response.usage.completion_tokens
            }

            logger.info(f"OpenAI API call successful. Tokens used: {result['tokens_used']}")
            return result

        except OpenAIRateLimitError as e:
            retry_count += 1
            if retry_count >= max_retries:
                logger.error(f"Rate limit exceeded after {max_retries} retries")
                raise LLMRateLimitError(f"Rate limit exceeded: {str(e)}")

            wait_time = 2 ** retry_count
            logger.warning(f"Rate limit hit, waiting {wait_time}s before retry")
            await asyncio.sleep(wait_time)

        except OpenAIAPIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise LLMAPIError(f"OpenAI API error: {str(e)}")

async def _stream_openai(
    prompt: str,
    model: Optional[str] = None,
    max_tokens: int = 2048,
    temperature: float = 0.7,
    system_prompt: Optional[str] = None
) -> AsyncGenerator[str, None]:
    """
    Stream response from OpenAI API.
    """
    if not settings.OPENAI_API_KEY:
        raise LLMAPIError("OPENAI_API_KEY not configured")

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    model = model or "gpt-4-turbo-preview"

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    try:
        stream = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            stream=True
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    except OpenAIRateLimitError as e:
        logger.error(f"OpenAI rate limit: {str(e)}")
        raise LLMRateLimitError(f"Rate limit exceeded: {str(e)}")
    except OpenAIAPIError as e:
        logger.error(f"OpenAI API error: {str(e)}")
        raise LLMAPIError(f"OpenAI API error: {str(e)}")
