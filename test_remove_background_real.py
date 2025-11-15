"""
Test remove_background() with a real product image.
"""
from image_editor import remove_background
import sys
import os
import base64

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def encode_image_to_base64(image_path: str) -> str:
    """Encode an image file to base64 string."""
    with open(image_path, 'rb') as f:
        image_bytes = f.read()
    return base64.b64encode(image_bytes).decode('utf-8')


def test_remove_background_with_real_image():
    """Test remove_background() with a real product image."""
    print("\n" + "="*60)
    print("TEST: Remove Background with Real Product Image")
    print("="*60)

    # Use the product image from inputs folder
    image_path = "inputs/product_image.png"

    if not os.path.exists(image_path):
        print(f"✗ Test image not found: {image_path}")
        return False

    print(f"Loading image from: {image_path}")

    try:
        # Encode image to base64
        image_base64 = encode_image_to_base64(image_path)
        print(f"Image encoded to base64 ({len(image_base64)} chars)")

        # Call remove_background in sync mode
        print("Calling remove_background() in sync mode...")
        print("(This may take 30-60 seconds...)")

        result = remove_background(image_base64, sync=True)

        if result.get('success'):
            print("\n✓ Background removal successful!")
            print(f"  Result URL: {result.get('result_url')}")

            # Optionally download the result
            result_url = result.get('result_url')
            if result_url:
                print(f"\nYou can view the result at: {result_url}")

            return True
        else:
            print("\n✗ Background removal failed")
            print(f"  Error: {result.get('error')}")
            return False

    except Exception as e:
        print(f"\n✗ Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n" + "="*60)
    print("REAL IMAGE TEST - remove_background()")
    print("="*60)

    success = test_remove_background_with_real_image()

    print("\n" + "="*60)
    print("TEST RESULT")
    print("="*60)

    if success:
        print("✓ PASS: Background removal works with real images")
    else:
        print("✗ FAIL: Background removal failed")
        print("\nNote: This test requires:")
        print("  1. Valid BRIA_API_KEY in config.py")
        print("  2. Product image at inputs/product_image.png")
        print("  3. Internet connection to Bria API")

    print("="*60)

    sys.exit(0 if success else 1)
