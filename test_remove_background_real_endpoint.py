"""
Test script for the /api/edit/remove-background endpoint with a real image.

This script tests the endpoint using a base64-encoded image from the inputs directory.
"""
import requests
import json
import base64
from pathlib import Path

# Test configuration
API_URL = "http://localhost:5000/api/edit/remove-background"
TEST_IMAGE_PATH = "inputs/product_image.png"


def encode_image_to_base64(image_path):
    """Encode an image file to base64 string."""
    with open(image_path, 'rb') as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


def test_remove_background_with_real_image():
    """Test the remove background endpoint with a real image."""
    print("Testing /api/edit/remove-background endpoint with real image...")
    print(f"API URL: {API_URL}")
    print(f"Test Image: {TEST_IMAGE_PATH}")
    print()

    # Check if image exists
    if not Path(TEST_IMAGE_PATH).exists():
        print(f"✗ Test image not found: {TEST_IMAGE_PATH}")
        return

    try:
        # Encode image to base64
        print("Encoding image to base64...")
        image_base64 = encode_image_to_base64(TEST_IMAGE_PATH)
        print(f"Image encoded ({len(image_base64)} characters)")
        print()

        # Prepare request payload
        payload = {
            "image": image_base64
        }

        # Send POST request
        print("Sending POST request to API...")
        print("This may take 30-60 seconds for Bria to process...")
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
                print()
                print("You can download the result image from the URL above.")
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
        print("  The Bria API may be taking longer than expected")

    except Exception as e:
        print(f"✗ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("=" * 70)
    print("Remove Background Endpoint Test - Real Image")
    print("=" * 70)
    print()

    test_remove_background_with_real_image()

    print()
    print("=" * 70)
    print("Test completed")
    print("=" * 70)
