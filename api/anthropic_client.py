import os
from typing import Optional
import httpx

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_API_URL = os.getenv("ANTHROPIC_API_URL", "https://api.anthropic.com/v1/complete")


def call_claude(prompt: str, max_tokens: int = 512) -> str:
    """Call Anthropic Claude Messages-like API.

    This is a minimal wrapper using the /v1/complete endpoint. If you have a
    different Messages API endpoint adjust `ANTHROPIC_API_URL` accordingly.

    If `ANTHROPIC_API_KEY` is not set, this returns a short mocked response so
    the server can be run without credentials during development.
    """
    if not ANTHROPIC_API_KEY:
        return "(mocked Claude response) " + prompt[:200]

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "Content-Type": "application/json",
    }

    payload = {
        "model": "claude-2.1",  # adjust to your available model
        "prompt": prompt,
        "max_tokens": max_tokens,
        "temperature": 0.2,
    }

    try:
        resp = httpx.post(ANTHROPIC_API_URL, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        # Many older endpoints return `completion` or `text` — adapt as needed
        return data.get("completion") or data.get("text") or str(data)
    except Exception as e:
        return f"(anthropic call failed: {e})"
