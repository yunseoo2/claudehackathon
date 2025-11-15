#!/usr/bin/env python3
"""Quick test script to verify API endpoints are working."""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint."""
    print("=" * 60)
    print("Testing /health endpoint...")
    print("=" * 60)
    resp = requests.get(f"{BASE_URL}/health", timeout=5)
    print(f"Status: {resp.status_code}")
    print(f"Response: {json.dumps(resp.json(), indent=2)}")
    print()
    return resp.status_code == 200

def test_at_risk_documents():
    """Test at-risk documents endpoint."""
    print("=" * 60)
    print("Testing /api/documents/at-risk endpoint...")
    print("=" * 60)
    resp = requests.get(f"{BASE_URL}/api/documents/at-risk", timeout=10)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print(f"Team Resilience Score: {data.get('team_resilience_score')}")
    print(f"Number of documents: {len(data.get('documents', []))}")
    print(f"Number of topics: {len(data.get('topic_stats', []))}")

    # Show top 5 riskiest documents
    docs = sorted(data.get('documents', []), key=lambda x: x['risk_score'], reverse=True)[:5]
    print("\nTop 5 Riskiest Documents:")
    for doc in docs:
        print(f"  - {doc['title']}: Risk Score = {doc['risk_score']}")
    print()
    return resp.status_code == 200

def test_simulate_departure():
    """Test bus factor simulation endpoint."""
    print("=" * 60)
    print("Testing /api/simulate-departure endpoint (person_id=1)...")
    print("=" * 60)
    resp = requests.post(
        f"{BASE_URL}/api/simulate-departure",
        json={"person_id": 1},
        timeout=30
    )
    print(f"Status: {resp.status_code}")
    data = resp.json()

    print(f"Person: {data.get('person', {}).get('name')}")
    print(f"Orphaned docs: {len(data.get('orphaned_docs', []))}")
    print(f"Impacted topics: {len(data.get('impacted_topics', []))}")
    print(f"Under-documented systems: {len(data.get('under_documented_systems', []))}")

    claude_response = data.get('claude_handoff', '')
    print(f"\nClaude Handoff Response (first 500 chars):")
    print(claude_response[:500])
    print(f"... (total length: {len(claude_response)} chars)")

    # Check if it's a mocked response
    if claude_response.startswith("(mocked Claude response)"):
        print("\n⚠️  USING MOCKED RESPONSE - API Key may not be set or loaded")
    else:
        print("\n✅ REAL CLAUDE API RESPONSE DETECTED")

    print()
    return resp.status_code == 200

def test_rag_query():
    """Test RAG query endpoint."""
    print("=" * 60)
    print("Testing /api/query endpoint (RAG)...")
    print("=" * 60)
    resp = requests.post(
        f"{BASE_URL}/api/query",
        json={"question": "How do I deploy to production?"},
        timeout=30
    )
    print(f"Status: {resp.status_code}")
    data = resp.json()

    answer = data.get('answer', '')
    print(f"Answer (first 500 chars):")
    print(answer[:500])
    print(f"... (total length: {len(answer)} chars)")

    print(f"\nReferenced docs: {len(data.get('referenced_docs', []))}")
    for doc in data.get('referenced_docs', []):
        print(f"  - {doc['title']}")

    print(f"People to contact: {data.get('people_to_contact', [])}")

    # Check if it's a mocked response
    if answer.startswith("(mocked Claude response)"):
        print("\n⚠️  USING MOCKED RESPONSE - API Key may not be set or loaded")
    else:
        print("\n✅ REAL CLAUDE API RESPONSE DETECTED")

    print()
    return resp.status_code == 200

def main():
    print("\n" + "=" * 60)
    print("🧪 Continuum API Test Suite")
    print("=" * 60 + "\n")

    results = {}

    try:
        results['health'] = test_health()
    except Exception as e:
        print(f"❌ Health check failed: {e}\n")
        results['health'] = False

    try:
        results['at_risk'] = test_at_risk_documents()
    except Exception as e:
        print(f"❌ At-risk documents failed: {e}\n")
        results['at_risk'] = False

    try:
        results['simulate'] = test_simulate_departure()
    except Exception as e:
        print(f"❌ Simulate departure failed: {e}\n")
        results['simulate'] = False

    try:
        results['rag'] = test_rag_query()
    except Exception as e:
        print(f"❌ RAG query failed: {e}\n")
        results['rag'] = False

    # Summary
    print("=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    print()

    all_passed = all(results.values())
    if all_passed:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
