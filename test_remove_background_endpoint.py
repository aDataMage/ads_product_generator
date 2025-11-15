"""
Test script for the /api/edit/remove-background endpoint.

This script tests the new endpoint by sending a request with a test image URL.
"""
import requests
import json

# Test configuration
API_URL = "http://localhost:5000/api/edit/remove-background"
TEST_IMAGE_URL = "https://engine.prod.bria-api.com/v1/get-result/d0b1e5e8-8b0a-4c0a-9b1a-1e5e8b0a4c0a"


def test_remove_background_endpoint():
    """Test the remove background endpoint with a sample image URL."""
    print("Testing /api/edit/remove-background endpoint...")
    print(f"API URL: {API_URL}")
    print(f"Test Image URL: {TEST_IMAGE_URL}")
    print()

    # Prepare request payload
    payload = {
        "image": TEST_IMAGE_URL
    }

    try:
        # Send POST request
        print("Sending POST request...")
        response = requests.post(
            API_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=90  # Allow time for processing
        )

        print(f"Response Status Code: {response.status_code}")
        print()

        # Parse response
        try:
            response_data = response.json()
            print("Response JSON:")
            print(json.dumps(response_data, indent=2))
            print()

            # Check if successful
            if response_data.get('success'):
                print("✓ Test PASSED: Background removal successful!")
                print(f"  Result URL: {response_data.get('result_url')}")
                if response_data.get('original_url'):
                    print(
                        f"  Original URL: {response_data.get('original_url')}")
            else:
                print("✗ Test FAILED: Background removal failed")
                print(f"  Error: {response_data.get('error')}")

        except json.JSONDecodeError as e:
            print(f"✗ Failed to parse JSON response: {str(e)}")
            print(f"Raw response: {response.text}")

    except requests.exceptions.ConnectionError:
        print("✗ Connection Error: Could not connect to API server")
        print("  Make sure the Flask server is running on localhost:5000")
        print("  Run: python api_server.py")

    except requests.exceptions.Timeout:
        print("✗ Request timed out after 90 seconds")

    except Exception as e:
        print(f"✗ Unexpected error: {str(e)}")


def test_missing_image_field():
    """Test endpoint validation with missing image field."""
    print("\nTesting validation: missing 'image' field...")

    payload = {}  # Missing required field

    try:
        response = requests.post(
            API_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        response_data = response.json()

        if response.status_code == 400 and not response_data.get('success'):
            print("✓ Validation test PASSED: Correctly rejected missing field")
            print(f"  Error message: {response_data.get('error')}")
        else:
            print("✗ Validation test FAILED: Should have rejected missing field")

    except Exception as e:
        print(f"✗ Validation test error: {str(e)}")


def test_empty_image_field():
    """Test endpoint validation with empty image field."""
    print("\nTesting validation: empty 'image' field...")

    payload = {"image": ""}  # Empty string

    try:
        response = requests.post(
            API_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        response_data = response.json()

        if response.status_code == 400 and not response_data.get('success'):
            print("✓ Validation test PASSED: Correctly rejected empty field")
            print(f"  Error message: {response_data.get('error')}")
        else:
            print("✗ Validation test FAILED: Should have rejected empty field")

    except Exception as e:
        print(f"✗ Validation test error: {str(e)}")


if __name__ == "__main__":
    print("=" * 70)
    print("Remove Background Endpoint Test Suite")
    print("=" * 70)
    print()

    # Run tests
    test_remove_background_endpoint()
    test_missing_image_field()
    test_empty_image_field()

    print()
    print("=" * 70)
    print("Test suite completed")
    print("=" * 70)
