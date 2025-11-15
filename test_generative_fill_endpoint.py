"""
Test for /api/edit/generative-fill endpoint.
Tests the generative fill API endpoint with various inputs.
"""
import requests
import sys
import base64
import os

# API endpoint
API_BASE_URL = "http://localhost:5000"
ENDPOINT = f"{API_BASE_URL}/api/edit/generative-fill"


def test_generative_fill_with_url():
    """Test generative-fill endpoint with image and mask URLs."""
    print("\n" + "="*60)
    print("TEST: Generative Fill with URLs")
    print("="*60)

    # Test data
    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    # For testing, we'll use a simple white mask (in real usage, this would be a proper mask)
    test_mask_url = "https://via.placeholder.com/500x500/FFFFFF/000000"
    test_prompt = "add colorful flowers around the product"
    test_negative_prompt = "blurry, distorted, low quality"

    payload = {
        "image": test_image_url,
        "mask": test_mask_url,
        "prompt": test_prompt,
        "negative_prompt": test_negative_prompt,
        "version": 2
    }

    print(f"Image URL: {test_image_url}")
    print(f"Mask URL: {test_mask_url}")
    print(f"Prompt: {test_prompt}")
    print(f"Negative Prompt: {test_negative_prompt}")
    print(f"Version: 2")
    print("\nSending POST request to endpoint...")

    try:
        response = requests.post(ENDPOINT, json=payload, timeout=120)

        print(f"Response Status Code: {response.status_code}")
        print(f"Response Body: {response.json()}")

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✓ Generative fill successful!")
                print(f"  Result URL: {result.get('result_url')}")
                if 'refined_prompt' in result:
                    print(f"  Refined Prompt: {result.get('refined_prompt')}")
                return True
            else:
                print("✗ Generative fill failed")
                print(f"  Error: {result.get('error')}")
                return False
        else:
            print(f"✗ Request failed with status code {response.status_code}")
            return False

    except requests.exceptions.Timeout:
        print("✗ Request timed out")
        return False
    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_generative_fill_missing_fields():
    """Test generative-fill endpoint with missing required fields."""
    print("\n" + "="*60)
    print("TEST: Generative Fill with Missing Fields")
    print("="*60)

    # Test missing image field
    print("\n[1/3] Testing with missing 'image' field...")
    payload = {
        "mask": "https://via.placeholder.com/500x500",
        "prompt": "test prompt"
    }

    try:
        response = requests.post(ENDPOINT, json=payload, timeout=30)
        if response.status_code == 400:
            print("✓ Correctly rejected missing 'image' field")
            print(f"  Error: {response.json().get('error')}")
            result1 = True
        else:
            print(f"✗ Should have returned 400, got {response.status_code}")
            result1 = False
    except Exception as e:
        print(f"✗ Exception: {str(e)}")
        result1 = False

    # Test missing mask field
    print("\n[2/3] Testing with missing 'mask' field...")
    payload = {
        "image": "https://via.placeholder.com/500x500",
        "prompt": "test prompt"
    }

    try:
        response = requests.post(ENDPOINT, json=payload, timeout=30)
        if response.status_code == 400:
            print("✓ Correctly rejected missing 'mask' field")
            print(f"  Error: {response.json().get('error')}")
            result2 = True
        else:
            print(f"✗ Should have returned 400, got {response.status_code}")
            result2 = False
    except Exception as e:
        print(f"✗ Exception: {str(e)}")
        result2 = False

    # Test missing prompt field
    print("\n[3/3] Testing with missing 'prompt' field...")
    payload = {
        "image": "https://via.placeholder.com/500x500",
        "mask": "https://via.placeholder.com/500x500"
    }

    try:
        response = requests.post(ENDPOINT, json=payload, timeout=30)
        if response.status_code == 400:
            print("✓ Correctly rejected missing 'prompt' field")
            print(f"  Error: {response.json().get('error')}")
            result3 = True
        else:
            print(f"✗ Should have returned 400, got {response.status_code}")
            result3 = False
    except Exception as e:
        print(f"✗ Exception: {str(e)}")
        result3 = False

    return result1 and result2 and result3


def test_generative_fill_invalid_version():
    """Test generative-fill endpoint with invalid version."""
    print("\n" + "="*60)
    print("TEST: Generative Fill with Invalid Version")
    print("="*60)

    payload = {
        "image": "https://via.placeholder.com/500x500",
        "mask": "https://via.placeholder.com/500x500",
        "prompt": "test prompt",
        "version": 3  # Invalid version (should be 1 or 2)
    }

    print("Testing with version=3 (invalid)...")

    try:
        response = requests.post(ENDPOINT, json=payload, timeout=30)
        if response.status_code == 400:
            print("✓ Correctly rejected invalid version")
            print(f"  Error: {response.json().get('error')}")
            return True
        else:
            print(f"✗ Should have returned 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Exception: {str(e)}")
        return False


def test_generative_fill_version_1():
    """Test generative-fill endpoint with version 1."""
    print("\n" + "="*60)
    print("TEST: Generative Fill with Version 1")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    test_mask_url = "https://via.placeholder.com/500x500/FFFFFF/000000"
    test_prompt = "add decorative elements"

    payload = {
        "image": test_image_url,
        "mask": test_mask_url,
        "prompt": test_prompt,
        "version": 1
    }

    print(f"Testing with version=1...")
    print(f"Prompt: {test_prompt}")

    try:
        response = requests.post(ENDPOINT, json=payload, timeout=120)

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✓ Generative fill (v1) successful!")
                print(f"  Result URL: {result.get('result_url')}")
                # Version 1 should not have refined_prompt
                if 'refined_prompt' not in result:
                    print("  ✓ Correctly omitted refined_prompt for v1")
                return True
            else:
                print("✗ Generative fill failed")
                print(f"  Error: {result.get('error')}")
                return False
        else:
            print(f"✗ Request failed with status code {response.status_code}")
            return False

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def check_server_health():
    """Check if the API server is running."""
    print("\n" + "="*60)
    print("Checking API Server Health")
    print("="*60)

    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print("✓ API server is healthy")
            print(f"  Status: {health_data.get('status')}")
            print(f"  Version: {health_data.get('version')}")
            endpoints = health_data.get('endpoints', {})
            if 'edit_generative_fill' in endpoints:
                print(
                    f"  ✓ Generative fill endpoint registered: {endpoints['edit_generative_fill']}")
            else:
                print("  ✗ Generative fill endpoint not found in health check")
            return True
        else:
            print(f"✗ Health check failed with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to API server")
        print(f"  Make sure the server is running at {API_BASE_URL}")
        return False
    except Exception as e:
        print(f"✗ Health check failed: {str(e)}")
        return False


if __name__ == "__main__":
    print("\n" + "="*60)
    print("GENERATIVE FILL ENDPOINT TESTS")
    print("="*60)

    # Check server health first
    if not check_server_health():
        print("\n✗ API server is not available. Please start the server with:")
        print("  python api_server.py")
        sys.exit(1)

    # Run tests
    test_results = []

    print("\n--- VALIDATION TESTS ---")
    test_results.append(
        ("Missing Fields", test_generative_fill_missing_fields()))
    test_results.append(
        ("Invalid Version", test_generative_fill_invalid_version()))

    print("\n--- FUNCTIONAL TESTS ---")
    print("\nNote: These tests require a valid Bria API key and may take time to complete.")
    test_results.append(
        ("Generative Fill - URLs", test_generative_fill_with_url()))
    test_results.append(
        ("Generative Fill - Version 1", test_generative_fill_version_1()))

    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)

    for test_name, result in test_results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")

    print(f"\nTotal: {passed}/{total} tests passed")
    print("="*60)

    # Exit with appropriate code
    sys.exit(0 if passed == total else 1)
