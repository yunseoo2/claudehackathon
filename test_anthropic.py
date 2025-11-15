#!/usr/bin/env python3
"""Test Anthropic API directly to diagnose the 404 error."""

import os
from dotenv import load_dotenv
import httpx

load_dotenv('.env')

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
print(f"API Key loaded: {'YES' if ANTHROPIC_API_KEY else 'NO'}")
print(f"API Key starts with: {ANTHROPIC_API_KEY[:15] if ANTHROPIC_API_KEY else '(empty)'}...")

if not ANTHROPIC_API_KEY:
    print("ERROR: No API key found!")
    exit(1)

print("\nTesting Anthropic API...")

headers = {
    "x-api-key": ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json",
}

url = "https://api.anthropic.com/v1/messages"

# Try different models to see which one works
models_to_try = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-20240620",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "claude-2.1",
    "claude-2.0",
]

print("Testing multiple models to find which ones work...\n")

for model_name in models_to_try:
    payload = {
        "model": model_name,
        "max_tokens": 50,
        "messages": [
            {
                "role": "user",
                "content": "Say hello in exactly 3 words"
            }
        ]
    }

    try:
        print(f"Testing: {model_name}")
        resp = httpx.post(url, json=payload, headers=headers, timeout=10)

        if resp.status_code == 200:
            data = resp.json()
            text = data["content"][0].get("text", "")
            print(f"  ✅ SUCCESS! Response: {text}")
            print(f"\n🎯 WORKING MODEL FOUND: {model_name}\n")
            break
        else:
            error_data = resp.json()
            error_msg = error_data.get("error", {}).get("message", "unknown")
            print(f"  ❌ {resp.status_code}: {error_msg}")
    except Exception as e:
        print(f"  ❌ Exception: {e}")
    print()

print("\nDone testing models.")
exit(0)

payload = {
    "model": "claude-3-opus-20240229",
    "max_tokens": 50,
    "messages": [
        {
            "role": "user",
            "content": "Say hello in exactly 3 words"
        }
    ]
}

url = "https://api.anthropic.com/v1/messages"

try:
    print(f"POST {url}")
    resp = httpx.post(url, json=payload, headers=headers, timeout=30)
    print(f"Status Code: {resp.status_code}")
    print(f"Response Headers: {dict(resp.headers)}")
    print(f"\nResponse Body:")
    print(resp.text[:1000])

    if resp.status_code == 200:
        data = resp.json()
        if "content" in data and len(data["content"]) > 0:
            print(f"\n✅ SUCCESS! Claude says: {data['content'][0].get('text', '')}")
    else:
        print(f"\n❌ API Error: {resp.status_code}")

except Exception as e:
    print(f"\n❌ Exception: {e}")
    import traceback
    traceback.print_exc()
