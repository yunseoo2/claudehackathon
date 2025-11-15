import os
from typing import Optional
import httpx

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"


def call_claude(prompt: str, max_tokens: int = 1024, model: str = "claude-3-5-sonnet-20241022") -> str:
    """Call Anthropic Claude Messages API.

    Uses the modern Messages API (v1/messages) with the latest Claude models.

    If `ANTHROPIC_API_KEY` is not set, this returns a short mocked response so
    the server can be run without credentials during development.

    Args:
        prompt: The user prompt/question to send to Claude
        max_tokens: Maximum tokens in the response (default: 1024)
        model: Claude model to use (default: claude-3-5-sonnet-20241022)

    Returns:
        The text content from Claude's response
    """
    if not ANTHROPIC_API_KEY:
        return "(mocked Claude response) " + prompt[:200]

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "temperature": 0.2,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    try:
        resp = httpx.post(ANTHROPIC_API_URL, json=payload, headers=headers, timeout=60)
        resp.raise_for_status()
        data = resp.json()

        # Extract text from the Messages API response format
        # Response format: {"content": [{"type": "text", "text": "..."}], ...}
        if "content" in data and len(data["content"]) > 0:
            return data["content"][0].get("text", str(data))

        return str(data)
    except Exception as e:
        return f"(anthropic call failed: {e})"
