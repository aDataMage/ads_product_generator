"""
Test script for /api/edit/replace-background endpoint.

This script tests the replace-background endpoint with both prompt and color options.
"""
import requests
import json
import base64
from pathlib import Path


def encode_image_to_base64(image_path: str) -> str:
    """Encode an image file to base64 string.

    Args:
        image_path: Path to the image file

    Returns:
        Base64-encoded image string
    """
    with open(image_path, 'rb') as f:
        image_data = f.read()
    return base64.b64encode(image_data).decode('utf-8')


def test_replace_background_with_prompt():
    """Test replace-background endpoint with a text prompt."""
    print("\n=== Testing Replace Background with Prompt ===")

    # Use a test image
    image_path = Path('inputs/product_image.png')
    if not image_path.exists():
        print(f"Error: Test image not found at {image_path}")
        return False

    # Encode image to base64
    image_base64 = encode_image_to_base64(str(image_path))

    # Prepare request
    url = 'http://localhost:5000/api/edit/replace-background'
    payload = {
        'image': image_base64,
        'background_prompt': 'white studio background with soft shadows'
    }

    print(f"Sending request to {url}")
    print(f"Image size: {len(image_base64)} characters")
    print(f"Background prompt: {payload['background_prompt']}")

    try:
        response = requests.post(url, json=payload, timeout=120)

        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Body: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"\n✓ Success! Result URL: {result.get('result_url')}")
                return True
            else:
                print(f"\n✗ Failed: {result.get('error')}")
                return False
        else:
            print(f"\n✗ HTTP Error: {response.status_code}")
            return False

    except requests.exceptions.Timeout:
        print("\n✗ Request timed out")
        return False
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        return False


def test_replace_background_with_color():
    """Test replace-background endpoint with a solid color."""
    print("\n=== Testing Replace Background with Color ===")

    # Use a test image
    image_path = Path('inputs/product_image.png')
    if not image_path.exists():
        print(f"Error: Test image not found at {image_path}")
        return False

    # Encode image to base64
    image_base64 = encode_image_to_base64(str(image_path))

    # Prepare request
    url = 'http://localhost:5000/api/edit/replace-background'
    payload = {
        'image': image_base64,
        'background_color': '#FFFFFF'
    }

    print(f"Sending request to {url}")
    print(f"Image size: {len(image_base64)} characters")
    print(f"Background color: {payload['background_color']}")

    try:
        response = requests.post(url, json=payload, timeout=120)

        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Body: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"\n✓ Success! Result URL: {result.get('result_url')}")
                return True
            else:
                print(f"\n✗ Failed: {result.get('error')}")
                return False
        else:
            print(f"\n✗ HTTP Error: {response.status_code}")
            return False

    except requests.exceptions.Timeout:
        print("\n✗ Request timed out")
        return False
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        return False


def test_replace_background_validation():
    """Test replace-background endpoint validation."""
    print("\n=== Testing Replace Background Validation ===")

    url = 'http://localhost:5000/api/edit/replace-background'

    # Test 1: Missing image field
    print("\nTest 1: Missing image field")
    payload = {
        'background_prompt': 'white background'
    }
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}, Expected: 400")
    assert response.status_code == 400, "Should return 400 for missing image"
    print("✓ Passed")

    # Test 2: Missing both prompt and color
    print("\nTest 2: Missing both background_prompt and background_color")
    payload = {
        'image': 'test_image_data'
    }
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}, Expected: 400")
    assert response.status_code == 400, "Should return 400 for missing prompt and color"
    print("✓ Passed")

    # Test 3: Empty image field
    print("\nTest 3: Empty image field")
    payload = {
        'image': '',
        'background_prompt': 'white background'
    }
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}, Expected: 400")
    assert response.status_code == 400, "Should return 400 for empty image"
    print("✓ Passed")

    # Test 4: Empty background_prompt
    print("\nTest 4: Empty background_prompt")
    payload = {
        'image': 'test_image_data',
        'background_prompt': ''
    }
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}, Expected: 400")
    assert response.status_code == 400, "Should return 400 for empty prompt"
    print("✓ Passed")

    print("\n✓ All validation tests passed!")
    return True


if __name__ == '__main__':
    print("=" * 60)
    print("Replace Background Endpoint Test Suite")
    print("=" * 60)
    print("\nMake sure the Flask server is running on localhost:5000")
    print("Run: python api_server.py")

    input("\nPress Enter to start tests...")

    # Run validation tests first
    validation_passed = test_replace_background_validation()

    # Run functional tests
    prompt_test_passed = test_replace_background_with_prompt()
    color_test_passed = test_replace_background_with_color()

    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(
        f"Validation Tests: {'✓ PASSED' if validation_passed else '✗ FAILED'}")
    print(f"Prompt Test: {'✓ PASSED' if prompt_test_passed else '✗ FAILED'}")
    print(f"Color Test: {'✓ PASSED' if color_test_passed else '✗ FAILED'}")

    if validation_passed and prompt_test_passed and color_test_passed:
        print("\n✓ All tests passed!")
    else:
        print("\n✗ Some tests failed")
