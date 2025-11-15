import os
from typing import Optional
import httpx

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"


def call_claude(prompt: str, max_tokens: int = 1024, model: str = "claude-3-haiku-20240307") -> str:
    """Call Anthropic Claude Messages API.

    Uses the modern Messages API (v1/messages) with Claude 3 models.

    If `ANTHROPIC_API_KEY` is not set, this returns a short mocked response so
    the server can be run without credentials during development.

    Args:
        prompt: The user prompt/question to send to Claude
        max_tokens: Maximum tokens in the response (default: 1024)
        model: Claude model to use (default: claude-3-haiku-20240307)

    Returns:
        The text content from Claude's response
    """
    # Read the API key at call time so changes to environment or .env are picked up
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return "(mocked Claude response) " + prompt[:200]

    headers = {
        "x-api-key": api_key,
        "anthropic-version": ANTHROPIC_VERSION,
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "temperature": 0.2,
        "messages": [
            {"role": "user", "content": prompt}
        ],
    }

    # Simple retry/backoff for transient errors (5xx, 429).
    retries = 3
    backoff = 1.0
    last_exc = None
    for attempt in range(1, retries + 1):
        try:
            resp = httpx.post(ANTHROPIC_API_URL, json=payload, headers=headers, timeout=30)
            # If status indicates transient issue, raise to trigger retry
            if resp.status_code >= 500 or resp.status_code == 429:
                resp.raise_for_status()

            resp.raise_for_status()
            data = resp.json()

            # Response expected to have a "content" list with text fragments
            if isinstance(data, dict) and "content" in data and len(data["content"]) > 0:
                # Many responses use 'text' inside the content item
                first = data["content"][0]
                if isinstance(first, dict):
                    return first.get("text") or first.get("content") or str(data)
                return str(first)

            return str(data)
        except Exception as e:
            last_exc = e
            # If last attempt, return a helpful error string
            if attempt == retries:
                return f"(anthropic call failed: {e})"
            # Otherwise wait and retry
            try:
                import time

                time.sleep(backoff)
                backoff *= 2
            except Exception:
                pass

    # Fallback
    return f"(anthropic call failed: {last_exc})"
