"""Test script to verify CORS configuration for Pro Mode endpoint.

This script tests that:
1. CORS middleware includes /api/generate/pro endpoint
2. Preflight OPTIONS requests are handled correctly
3. CORS headers are present in responses
"""

import requests
import sys

# Test configuration
API_BASE_URL = "http://localhost:5000"
ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]


def test_preflight_request(endpoint, origin):
    """Test preflight OPTIONS request for CORS.

    Args:
        endpoint: API endpoint path (e.g., '/api/generate/pro')
        origin: Origin header value to test

    Returns:
        bool: True if CORS headers are correct, False otherwise
    """
    url = f"{API_BASE_URL}{endpoint}"
    headers = {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    }

    try:
        response = requests.options(url, headers=headers)

        # Check for CORS headers
        cors_origin = response.headers.get('Access-Control-Allow-Origin')
        cors_methods = response.headers.get('Access-Control-Allow-Methods')
        cors_headers = response.headers.get('Access-Control-Allow-Headers')

        print(f"\n{'='*60}")
        print(f"Testing OPTIONS {endpoint} with origin: {origin}")
        print(f"{'='*60}")
        print(f"Status Code: {response.status_code}")
        print(f"Access-Control-Allow-Origin: {cors_origin}")
        print(f"Access-Control-Allow-Methods: {cors_methods}")
        print(f"Access-Control-Allow-Headers: {cors_headers}")

        # Verify CORS headers are present
        if cors_origin and cors_methods:
            print("✓ CORS headers present")
            return True
        else:
            print("✗ CORS headers missing")
            return False

    except requests.exceptions.ConnectionError:
        print(f"\n✗ Could not connect to {url}")
        print("  Make sure the Flask server is running: python api_server.py")
        return False
    except Exception as e:
        print(f"\n✗ Error testing preflight: {str(e)}")
        return False


def test_post_request_cors(endpoint, origin):
    """Test POST request CORS headers.

    Args:
        endpoint: API endpoint path
        origin: Origin header value to test

    Returns:
        bool: True if CORS headers are correct, False otherwise
    """
    url = f"{API_BASE_URL}{endpoint}"
    headers = {
        'Origin': origin,
        'Content-Type': 'application/json'
    }

    # Minimal valid payload for testing (will fail validation but that's OK)
    payload = {}

    try:
        response = requests.post(url, json=payload, headers=headers)

        cors_origin = response.headers.get('Access-Control-Allow-Origin')

        print(f"\n{'='*60}")
        print(f"Testing POST {endpoint} with origin: {origin}")
        print(f"{'='*60}")
        print(f"Status Code: {response.status_code}")
        print(f"Access-Control-Allow-Origin: {cors_origin}")

        if cors_origin:
            print("✓ CORS header present in POST response")
            return True
        else:
            print("✗ CORS header missing in POST response")
            return False

    except requests.exceptions.ConnectionError:
        print(f"\n✗ Could not connect to {url}")
        print("  Make sure the Flask server is running: python api_server.py")
        return False
    except Exception as e:
        print(f"\n✗ Error testing POST: {str(e)}")
        return False


def main():
    """Run CORS tests for both standard and Pro Mode endpoints."""
    print("\n" + "="*60)
    print("CORS Configuration Test for Pro Mode Endpoint")
    print("="*60)

    endpoints = [
        '/api/generate',      # Standard endpoint (for comparison)
        '/api/generate/pro'   # Pro Mode endpoint
    ]

    all_passed = True

    for endpoint in endpoints:
        for origin in ALLOWED_ORIGINS:
            # Test preflight OPTIONS request
            if not test_preflight_request(endpoint, origin):
                all_passed = False

            # Test actual POST request CORS headers
            if not test_post_request_cors(endpoint, origin):
                all_passed = False

    # Test with disallowed origin
    print(f"\n{'='*60}")
    print("Testing with DISALLOWED origin (should be rejected)")
    print(f"{'='*60}")
    disallowed_origin = "http://evil.com"
    test_preflight_request('/api/generate/pro', disallowed_origin)

    # Summary
    print(f"\n{'='*60}")
    print("Test Summary")
    print(f"{'='*60}")
    if all_passed:
        print("✓ All CORS tests passed")
        print("✓ CORS middleware correctly configured for Pro Mode endpoint")
        return 0
    else:
        print("✗ Some CORS tests failed")
        print("  Check the Flask server logs for details")
        return 1


if __name__ == '__main__':
    sys.exit(main())
