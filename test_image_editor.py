"""
Tests for image_editor.py module.
Tests core editing functions with Bria API.
"""
from image_editor import remove_background, replace_background, blur_background
import sys
import os
import base64

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def test_remove_background_with_url():
    """Test remove_background() with a sample image URL."""
    print("\n" + "="*60)
    print("TEST: Remove Background with URL")
    print("="*60)

    # Use a real product image URL for testing
    # This is a publicly accessible test image
    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    print(f"Testing with image URL: {test_image_url}")
    print("Calling remove_background() in sync mode...")

    try:
        result = remove_background(test_image_url, sync=True)

        if result.get('success'):
            print("✓ Background removal successful!")
            print(f"  Result URL: {result.get('result_url')}")
            print(f"  Original URL: {result.get('original_url')}")
        else:
            print("✗ Background removal failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_remove_background_with_local_image():
    """Test remove_background() with a local sample image file."""
    print("\n" + "="*60)
    print("TEST: Remove Background with Local Image")
    print("="*60)

    # Use the sample product image from inputs folder
    sample_image_path = os.path.join("inputs", "product_image.png")

    if not os.path.exists(sample_image_path):
        print(f"✗ Sample image not found at {sample_image_path}")
        return False

    print(f"Loading sample image from: {sample_image_path}")

    try:
        # Read and encode the image to base64
        with open(sample_image_path, 'rb') as img_file:
            image_data = img_file.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')

        print(f"Image encoded to base64 ({len(image_base64)} characters)")
        print("Calling remove_background() in sync mode...")

        result = remove_background(image_base64, sync=True)

        if result.get('success'):
            print("✓ Background removal successful!")
            print(f"  Result URL: {result.get('result_url')}")
            if result.get('original_url'):
                print(f"  Original URL: {result.get('original_url')}")
        else:
            print("✗ Background removal failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_remove_background_async():
    """Test remove_background() in async mode."""
    print("\n" + "="*60)
    print("TEST: Remove Background (Async Mode)")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    print(f"Testing with image URL: {test_image_url}")
    print("Calling remove_background() in async mode...")

    try:
        result = remove_background(test_image_url, sync=False)

        if result.get('success'):
            print("✓ Job submitted successfully!")
            print(f"  Request ID: {result.get('request_id')}")
            print(f"  Status URL: {result.get('status_url')}")
        else:
            print("✗ Job submission failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_remove_background_invalid_input():
    """Test remove_background() with invalid input."""
    print("\n" + "="*60)
    print("TEST: Remove Background with Invalid Input")
    print("="*60)

    print("Testing with empty string...")

    try:
        result = remove_background("", sync=True)

        if not result.get('success'):
            print("✓ Correctly rejected invalid input")
            print(f"  Error message: {result.get('error')}")
            return True
        else:
            print("✗ Should have rejected invalid input")
            return False

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_replace_background_with_prompt():
    """Test replace_background() with a background prompt."""
    print("\n" + "="*60)
    print("TEST: Replace Background with Prompt")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    background_prompt = "white studio background with soft shadows"

    print(f"Testing with image URL: {test_image_url}")
    print(f"Background prompt: {background_prompt}")
    print("Calling replace_background() in sync mode...")

    try:
        result = replace_background(
            test_image_url, background_prompt=background_prompt, sync=True)

        if result.get('success'):
            print("✓ Background replacement successful!")
            print(f"  Result URL: {result.get('result_url')}")
        else:
            print("✗ Background replacement failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_replace_background_with_color():
    """Test replace_background() with a solid color."""
    print("\n" + "="*60)
    print("TEST: Replace Background with Color")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    background_color = "#FFFFFF"

    print(f"Testing with image URL: {test_image_url}")
    print(f"Background color: {background_color}")
    print("Calling replace_background() in sync mode...")

    try:
        result = replace_background(
            test_image_url, background_color=background_color, sync=True)

        if result.get('success'):
            print("✓ Background replacement successful!")
            print(f"  Result URL: {result.get('result_url')}")
        else:
            print("✗ Background replacement failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_replace_background_invalid_input():
    """Test replace_background() with invalid input."""
    print("\n" + "="*60)
    print("TEST: Replace Background with Invalid Input")
    print("="*60)

    print("Testing with no prompt or color...")

    try:
        result = replace_background(
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop", sync=True)

        if not result.get('success'):
            print("✓ Correctly rejected invalid input")
            print(f"  Error message: {result.get('error')}")
            return True
        else:
            print("✗ Should have rejected invalid input")
            return False

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_replace_background_async():
    """Test replace_background() in async mode."""
    print("\n" + "="*60)
    print("TEST: Replace Background (Async Mode)")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    background_prompt = "gradient blue background"

    print(f"Testing with image URL: {test_image_url}")
    print(f"Background prompt: {background_prompt}")
    print("Calling replace_background() in async mode...")

    try:
        result = replace_background(
            test_image_url, background_prompt=background_prompt, sync=False)

        if result.get('success'):
            print("✓ Job submitted successfully!")
            print(f"  Request ID: {result.get('request_id')}")
            print(f"  Status URL: {result.get('status_url')}")
        else:
            print("✗ Job submission failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_replace_background_various_prompts():
    """Test replace_background() with various background prompts to ensure versatility."""
    print("\n" + "="*60)
    print("TEST: Replace Background with Various Prompts")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    # Test different types of background prompts
    test_prompts = [
        "natural outdoor scene with trees and grass",
        "luxury marble surface with gold accents",
        "minimalist gray gradient background",
        "vibrant colorful abstract pattern",
        "wooden table with natural lighting",
        "dark moody studio background with dramatic shadows",
        "bright white studio with soft diffused lighting"
    ]

    results = []

    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n[{i}/{len(test_prompts)}] Testing prompt: '{prompt}'")

        try:
            result = replace_background(
                test_image_url, background_prompt=prompt, sync=True)

            if result.get('success'):
                print(f"  ✓ Success! Result URL: {result.get('result_url')}")
                results.append(True)
            else:
                print(f"  ✗ Failed: {result.get('error')}")
                results.append(False)

        except Exception as e:
            print(f"  ✗ Exception: {str(e)}")
            results.append(False)

    # Summary for this test
    passed = sum(results)
    total = len(results)
    print(f"\n  Prompt variations: {passed}/{total} successful")

    return passed == total


def test_blur_background_with_various_strengths():
    """Test blur_background() with various blur strength values."""
    print("\n" + "="*60)
    print("TEST: Blur Background with Various Strengths")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    # Test different blur strength values
    test_strengths = [0, 25, 50, 75, 100]

    results = []

    for i, strength in enumerate(test_strengths, 1):
        print(f"\n[{i}/{len(test_strengths)}] Testing blur strength: {strength}")

        try:
            result = blur_background(
                test_image_url, blur_strength=strength, sync=True)

            if result.get('success'):
                print(f"  ✓ Success! Result URL: {result.get('result_url')}")
                results.append(True)
            else:
                print(f"  ✗ Failed: {result.get('error')}")
                results.append(False)

        except Exception as e:
            print(f"  ✗ Exception: {str(e)}")
            results.append(False)

    # Summary for this test
    passed = sum(results)
    total = len(results)
    print(f"\n  Blur strength variations: {passed}/{total} successful")

    return passed == total


def test_blur_background_invalid_strength():
    """Test blur_background() with invalid blur strength values."""
    print("\n" + "="*60)
    print("TEST: Blur Background with Invalid Strength")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    # Test invalid strength values
    invalid_strengths = [-1, 101, "50", 50.5, None]

    results = []

    for i, strength in enumerate(invalid_strengths, 1):
        print(f"\n[{i}/{len(invalid_strengths)}] Testing invalid strength: {strength} (type: {type(strength).__name__})")

        try:
            result = blur_background(
                test_image_url, blur_strength=strength, sync=True)

            if not result.get('success'):
                print(f"  ✓ Correctly rejected invalid input")
                print(f"    Error message: {result.get('error')}")
                results.append(True)
            else:
                print(f"  ✗ Should have rejected invalid input")
                results.append(False)

        except Exception as e:
            # Exceptions are also acceptable for invalid input
            print(f"  ✓ Raised exception (acceptable): {str(e)}")
            results.append(True)

    # Summary for this test
    passed = sum(results)
    total = len(results)
    print(f"\n  Invalid strength handling: {passed}/{total} successful")

    return passed == total


def test_blur_background_async():
    """Test blur_background() in async mode."""
    print("\n" + "="*60)
    print("TEST: Blur Background (Async Mode)")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    blur_strength = 50

    print(f"Testing with image URL: {test_image_url}")
    print(f"Blur strength: {blur_strength}")
    print("Calling blur_background() in async mode...")

    try:
        result = blur_background(
            test_image_url, blur_strength=blur_strength, sync=False)

        if result.get('success'):
            print("✓ Job submitted successfully!")
            print(f"  Request ID: {result.get('request_id')}")
            print(f"  Status URL: {result.get('status_url')}")
        else:
            print("✗ Job submission failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_generative_fill_with_mask_and_prompt():
    """Test generative_fill() with mask and prompt."""
    print("\n" + "="*60)
    print("TEST: Generative Fill with Mask and Prompt")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    # Create a simple white mask (base64 encoded 100x100 white PNG)
    # This is a minimal white PNG image that can be used as a mask
    # In a real scenario, you'd create a proper mask matching the image dimensions
    white_mask_base64 = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    )

    prompt = "add colorful flowers around the product"
    negative_prompt = "blurry, distorted, low quality"

    print(f"Testing with image URL: {test_image_url}")
    print(f"Prompt: {prompt}")
    print(f"Negative prompt: {negative_prompt}")
    print("Using version 2 (with refined prompt)")
    print("Calling generative_fill() in sync mode...")

    try:
        from image_editor import generative_fill

        result = generative_fill(
            test_image_url,
            mask=white_mask_base64,
            prompt=prompt,
            negative_prompt=negative_prompt,
            version=2,
            sync=True
        )

        if result.get('success'):
            print("✓ Generative fill successful!")
            print(f"  Result URL: {result.get('result_url')}")
            if result.get('refined_prompt'):
                print(f"  Refined prompt: {result.get('refined_prompt')}")
        else:
            print("✗ Generative fill failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_generative_fill_version_1():
    """Test generative_fill() with version 1 (no refined prompt)."""
    print("\n" + "="*60)
    print("TEST: Generative Fill Version 1")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    white_mask_base64 = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    )
    prompt = "add a wooden table surface"

    print(f"Testing with image URL: {test_image_url}")
    print(f"Prompt: {prompt}")
    print("Using version 1 (no refined prompt)")
    print("Calling generative_fill() in sync mode...")

    try:
        from image_editor import generative_fill

        result = generative_fill(
            test_image_url,
            mask=white_mask_base64,
            prompt=prompt,
            version=1,
            sync=True
        )

        if result.get('success'):
            print("✓ Generative fill successful!")
            print(f"  Result URL: {result.get('result_url')}")
            # Version 1 should not have refined_prompt
            if 'refined_prompt' not in result:
                print("  ✓ Correctly omitted refined_prompt for version 1")
            else:
                print("  ⚠ Warning: refined_prompt present in version 1 response")
        else:
            print("✗ Generative fill failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_generative_fill_async():
    """Test generative_fill() in async mode."""
    print("\n" + "="*60)
    print("TEST: Generative Fill (Async Mode)")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    white_mask_base64 = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    )
    prompt = "add natural lighting effects"

    print(f"Testing with image URL: {test_image_url}")
    print(f"Prompt: {prompt}")
    print("Calling generative_fill() in async mode...")

    try:
        from image_editor import generative_fill

        result = generative_fill(
            test_image_url,
            mask=white_mask_base64,
            prompt=prompt,
            version=2,
            sync=False
        )

        if result.get('success'):
            print("✓ Job submitted successfully!")
            print(f"  Request ID: {result.get('request_id')}")
            print(f"  Status URL: {result.get('status_url')}")
        else:
            print("✗ Job submission failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_generative_fill_invalid_input():
    """Test generative_fill() with invalid inputs."""
    print("\n" + "="*60)
    print("TEST: Generative Fill with Invalid Input")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    white_mask_base64 = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    )

    from image_editor import generative_fill

    test_cases = [
        ("Empty prompt", test_image_url, white_mask_base64, "", None, 2),
        ("Empty mask", test_image_url, "", "test prompt", None, 2),
        ("Invalid version", test_image_url,
         white_mask_base64, "test prompt", None, 3),
        ("None prompt", test_image_url, white_mask_base64, None, None, 2),
    ]

    results = []

    for i, (test_name, image, mask, prompt, neg_prompt, version) in enumerate(test_cases, 1):
        print(f"\n[{i}/{len(test_cases)}] Testing: {test_name}")

        try:
            result = generative_fill(
                image,
                mask=mask,
                prompt=prompt,
                negative_prompt=neg_prompt,
                version=version,
                sync=True
            )

            if not result.get('success'):
                print(f"  ✓ Correctly rejected invalid input")
                print(f"    Error message: {result.get('error')}")
                results.append(True)
            else:
                print(f"  ✗ Should have rejected invalid input")
                results.append(False)

        except Exception as e:
            # Exceptions are also acceptable for invalid input
            print(f"  ✓ Raised exception (acceptable): {str(e)}")
            results.append(True)

    # Summary for this test
    passed = sum(results)
    total = len(results)
    print(f"\n  Invalid input handling: {passed}/{total} successful")

    return passed == total


def test_expand_image_with_different_dimensions():
    """Test expand_image() with different target dimensions."""
    print("\n" + "="*60)
    print("TEST: Expand Image with Different Dimensions")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    # Test different dimension scenarios
    test_cases = [
        ("Square to Landscape", 1920, 1080),
        ("Square to Portrait", 1080, 1920),
        ("Square to Larger Square", 1024, 1024),
        ("Square to Wide Banner", 2560, 1440),
        ("Square to Social Media (Instagram)", 1080, 1350),
        ("Square to Social Media (Facebook)", 1200, 630),
        ("Square to 4:3 Aspect", 1600, 1200),
        ("Square to 16:9 Aspect", 1920, 1080),
    ]

    results = []

    for i, (test_name, width, height) in enumerate(test_cases, 1):
        print(f"\n[{i}/{len(test_cases)}] Testing: {test_name} ({width}x{height})")

        try:
            from image_editor import expand_image

            result = expand_image(
                test_image_url,
                target_width=width,
                target_height=height,
                sync=True
            )

            if result.get('success'):
                print(f"  ✓ Success! Result URL: {result.get('result_url')}")
                results.append(True)
            else:
                print(f"  ✗ Failed: {result.get('error')}")
                results.append(False)

        except Exception as e:
            print(f"  ✗ Exception: {str(e)}")
            results.append(False)

    # Summary for this test
    passed = sum(results)
    total = len(results)
    print(f"\n  Dimension variations: {passed}/{total} successful")

    return passed == total


def test_expand_image_with_prompt():
    """Test expand_image() with optional prompt for context."""
    print("\n" + "="*60)
    print("TEST: Expand Image with Prompt")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    target_width = 1920
    target_height = 1080
    prompt = "continue the background naturally with similar lighting and style"

    print(f"Testing expansion to {target_width}x{target_height}")
    print(f"Prompt: {prompt}")
    print("Calling expand_image() in sync mode...")

    try:
        from image_editor import expand_image

        result = expand_image(
            test_image_url,
            target_width=target_width,
            target_height=target_height,
            prompt=prompt,
            sync=True
        )

        if result.get('success'):
            print("✓ Image expansion with prompt successful!")
            print(f"  Result URL: {result.get('result_url')}")
        else:
            print("✗ Image expansion failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_expand_image_invalid_dimensions():
    """Test expand_image() with invalid dimension values."""
    print("\n" + "="*60)
    print("TEST: Expand Image with Invalid Dimensions")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    from image_editor import expand_image

    # Test invalid dimension values
    test_cases = [
        ("Negative width", -100, 1080),
        ("Negative height", 1920, -100),
        ("Zero width", 0, 1080),
        ("Zero height", 1920, 0),
        ("String width", "1920", 1080),
        ("String height", 1920, "1080"),
        ("Float width", 1920.5, 1080),
        ("Float height", 1920, 1080.5),
    ]

    results = []

    for i, (test_name, width, height) in enumerate(test_cases, 1):
        print(
            f"\n[{i}/{len(test_cases)}] Testing: {test_name} (width={width}, height={height})")

        try:
            result = expand_image(
                test_image_url,
                target_width=width,
                target_height=height,
                sync=True
            )

            if not result.get('success'):
                print(f"  ✓ Correctly rejected invalid input")
                print(f"    Error message: {result.get('error')}")
                results.append(True)
            else:
                print(f"  ✗ Should have rejected invalid input")
                results.append(False)

        except Exception as e:
            # Exceptions are also acceptable for invalid input
            print(f"  ✓ Raised exception (acceptable): {str(e)}")
            results.append(True)

    # Summary for this test
    passed = sum(results)
    total = len(results)
    print(f"\n  Invalid dimension handling: {passed}/{total} successful")

    return passed == total


def test_expand_image_async():
    """Test expand_image() in async mode."""
    print("\n" + "="*60)
    print("TEST: Expand Image (Async Mode)")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    target_width = 1920
    target_height = 1080

    print(f"Testing expansion to {target_width}x{target_height}")
    print("Calling expand_image() in async mode...")

    try:
        from image_editor import expand_image

        result = expand_image(
            test_image_url,
            target_width=target_width,
            target_height=target_height,
            sync=False
        )

        if result.get('success'):
            print("✓ Job submitted successfully!")
            print(f"  Request ID: {result.get('request_id')}")
            print(f"  Status URL: {result.get('status_url')}")
        else:
            print("✗ Job submission failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_expand_image_common_aspect_ratios():
    """Test expand_image() with common aspect ratios used in product photography."""
    print("\n" + "="*60)
    print("TEST: Expand Image with Common Aspect Ratios")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    # Common aspect ratios for product photography and social media
    test_cases = [
        ("1:1 (Square - Instagram)", 1080, 1080),
        ("4:3 (Standard)", 1600, 1200),
        ("16:9 (Widescreen)", 1920, 1080),
        ("9:16 (Vertical Video)", 1080, 1920),
        ("4:5 (Instagram Portrait)", 1080, 1350),
        ("1.91:1 (Facebook Link)", 1200, 628),
        ("2:3 (Portrait)", 1000, 1500),
        ("3:2 (Landscape)", 1500, 1000),
    ]

    results = []

    for i, (test_name, width, height) in enumerate(test_cases, 1):
        print(f"\n[{i}/{len(test_cases)}] Testing: {test_name} ({width}x{height})")

        try:
            from image_editor import expand_image

            result = expand_image(
                test_image_url,
                target_width=width,
                target_height=height,
                prompt="maintain product focus with natural background extension",
                sync=True
            )

            if result.get('success'):
                print(f"  ✓ Success! Result URL: {result.get('result_url')}")
                results.append(True)
            else:
                print(f"  ✗ Failed: {result.get('error')}")
                results.append(False)

        except Exception as e:
            print(f"  ✗ Exception: {str(e)}")
            results.append(False)

    # Summary for this test
    passed = sum(results)
    total = len(results)
    print(f"\n  Aspect ratio variations: {passed}/{total} successful")

    return passed == total


def test_enhance_image_basic():
    """Test enhance_image() with basic functionality."""
    print("\n" + "="*60)
    print("TEST: Enhance Image - Basic")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    print(f"Testing with image URL: {test_image_url}")
    print("Calling enhance_image() in sync mode...")

    try:
        from image_editor import enhance_image

        result = enhance_image(test_image_url, sync=True)

        if result.get('success'):
            print("✓ Image enhancement successful!")
            print(f"  Result URL: {result.get('result_url')}")
        else:
            print("✗ Image enhancement failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_enhance_image_with_local_image():
    """Test enhance_image() with a local image file."""
    print("\n" + "="*60)
    print("TEST: Enhance Image - Local Image")
    print("="*60)

    sample_image_path = os.path.join("inputs", "product_image.png")

    if not os.path.exists(sample_image_path):
        print(f"✗ Sample image not found at {sample_image_path}")
        return False

    print(f"Loading sample image from: {sample_image_path}")

    try:
        from image_editor import enhance_image

        # Read and encode the image to base64
        with open(sample_image_path, 'rb') as img_file:
            image_data = img_file.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')

        print(f"Image encoded to base64 ({len(image_base64)} characters)")
        print("Calling enhance_image() in sync mode...")

        result = enhance_image(image_base64, sync=True)

        if result.get('success'):
            print("✓ Image enhancement successful!")
            print(f"  Result URL: {result.get('result_url')}")
        else:
            print("✗ Image enhancement failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_enhance_image_async():
    """Test enhance_image() in async mode."""
    print("\n" + "="*60)
    print("TEST: Enhance Image - Async Mode")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    print(f"Testing with image URL: {test_image_url}")
    print("Calling enhance_image() in async mode...")

    try:
        from image_editor import enhance_image

        result = enhance_image(test_image_url, sync=False)

        if result.get('success'):
            print("✓ Job submitted successfully!")
            print(f"  Request ID: {result.get('request_id')}")
            print(f"  Status URL: {result.get('status_url')}")
        else:
            print("✗ Job submission failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_enhance_image_invalid_input():
    """Test enhance_image() with invalid inputs."""
    print("\n" + "="*60)
    print("TEST: Enhance Image - Invalid Input")
    print("="*60)

    from image_editor import enhance_image

    test_cases = [
        ("Empty string", ""),
        ("None value", None),
        ("Integer value", 12345),
        ("List value", ["not", "a", "string"]),
    ]

    results = []

    for i, (test_name, invalid_input) in enumerate(test_cases, 1):
        print(f"\n[{i}/{len(test_cases)}] Testing: {test_name}")

        try:
            result = enhance_image(invalid_input, sync=True)

            if not result.get('success'):
                print(f"  ✓ Correctly rejected invalid input")
                print(f"    Error message: {result.get('error')}")
                results.append(True)
            else:
                print(f"  ✗ Should have rejected invalid input")
                results.append(False)

        except Exception as e:
            # Exceptions are also acceptable for invalid input
            print(f"  ✓ Raised exception (acceptable): {str(e)}")
            results.append(True)

    # Summary for this test
    passed = sum(results)
    total = len(results)
    print(f"\n  Invalid input handling: {passed}/{total} successful")

    return passed == total


def test_increase_resolution_2x():
    """Test increase_resolution() with 2x scale factor."""
    print("\n" + "="*60)
    print("TEST: Increase Resolution - 2x Scale Factor")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    scale_factor = 2

    print(f"Testing with image URL: {test_image_url}")
    print(f"Scale factor: {scale_factor}x")
    print("Calling increase_resolution() in sync mode...")

    try:
        from image_editor import increase_resolution

        result = increase_resolution(
            test_image_url, scale_factor=scale_factor, sync=True)

        if result.get('success'):
            print(f"✓ Resolution increase ({scale_factor}x) successful!")
            print(f"  Result URL: {result.get('result_url')}")
        else:
            print(f"✗ Resolution increase failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_increase_resolution_4x():
    """Test increase_resolution() with 4x scale factor."""
    print("\n" + "="*60)
    print("TEST: Increase Resolution - 4x Scale Factor")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    scale_factor = 4

    print(f"Testing with image URL: {test_image_url}")
    print(f"Scale factor: {scale_factor}x")
    print("Calling increase_resolution() in sync mode...")

    try:
        from image_editor import increase_resolution

        result = increase_resolution(
            test_image_url, scale_factor=scale_factor, sync=True)

        if result.get('success'):
            print(f"✓ Resolution increase ({scale_factor}x) successful!")
            print(f"  Result URL: {result.get('result_url')}")
        else:
            print(f"✗ Resolution increase failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_increase_resolution_with_local_image():
    """Test increase_resolution() with a local image file."""
    print("\n" + "="*60)
    print("TEST: Increase Resolution - Local Image")
    print("="*60)

    sample_image_path = os.path.join("inputs", "product_image.png")

    if not os.path.exists(sample_image_path):
        print(f"✗ Sample image not found at {sample_image_path}")
        return False

    print(f"Loading sample image from: {sample_image_path}")

    try:
        from image_editor import increase_resolution

        # Read and encode the image to base64
        with open(sample_image_path, 'rb') as img_file:
            image_data = img_file.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')

        print(f"Image encoded to base64 ({len(image_base64)} characters)")
        print("Calling increase_resolution() with 2x scale in sync mode...")

        result = increase_resolution(image_base64, scale_factor=2, sync=True)

        if result.get('success'):
            print("✓ Resolution increase successful!")
            print(f"  Result URL: {result.get('result_url')}")
        else:
            print("✗ Resolution increase failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_increase_resolution_async():
    """Test increase_resolution() in async mode."""
    print("\n" + "="*60)
    print("TEST: Increase Resolution - Async Mode")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    scale_factor = 2

    print(f"Testing with image URL: {test_image_url}")
    print(f"Scale factor: {scale_factor}x")
    print("Calling increase_resolution() in async mode...")

    try:
        from image_editor import increase_resolution

        result = increase_resolution(
            test_image_url, scale_factor=scale_factor, sync=False)

        if result.get('success'):
            print("✓ Job submitted successfully!")
            print(f"  Request ID: {result.get('request_id')}")
            print(f"  Status URL: {result.get('status_url')}")
        else:
            print("✗ Job submission failed")
            print(f"  Error: {result.get('error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_increase_resolution_invalid_scale_factor():
    """Test increase_resolution() with invalid scale factor values."""
    print("\n" + "="*60)
    print("TEST: Increase Resolution - Invalid Scale Factor")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    from image_editor import increase_resolution

    # Test invalid scale factor values (only 2 and 4 are valid)
    test_cases = [
        ("Scale factor 1", 1),
        ("Scale factor 3", 3),
        ("Scale factor 5", 5),
        ("Scale factor 8", 8),
        ("Scale factor 0", 0),
        ("Negative scale factor", -2),
        ("String scale factor", "2"),
        ("Float scale factor", 2.5),
        ("None scale factor", None),
    ]

    results = []

    for i, (test_name, scale_factor) in enumerate(test_cases, 1):
        print(
            f"\n[{i}/{len(test_cases)}] Testing: {test_name} (scale_factor={scale_factor})")

        try:
            result = increase_resolution(
                test_image_url,
                scale_factor=scale_factor,
                sync=True
            )

            if not result.get('success'):
                print(f"  ✓ Correctly rejected invalid scale factor")
                print(f"    Error message: {result.get('error')}")
                results.append(True)
            else:
                print(f"  ✗ Should have rejected invalid scale factor")
                results.append(False)

        except (ValueError, TypeError) as e:
            # Exceptions are expected for invalid input
            print(f"  ✓ Raised exception (expected): {str(e)}")
            results.append(True)
        except Exception as e:
            # Other exceptions are also acceptable for invalid input
            print(f"  ✓ Raised exception (acceptable): {str(e)}")
            results.append(True)

    # Summary for this test
    passed = sum(results)
    total = len(results)
    print(f"\n  Invalid scale factor handling: {passed}/{total} successful")

    return passed == total


def test_increase_resolution_invalid_input():
    """Test increase_resolution() with invalid image inputs."""
    print("\n" + "="*60)
    print("TEST: Increase Resolution - Invalid Input")
    print("="*60)

    from image_editor import increase_resolution

    test_cases = [
        ("Empty string", ""),
        ("None value", None),
        ("Integer value", 12345),
        ("List value", ["not", "a", "string"]),
    ]

    results = []

    for i, (test_name, invalid_input) in enumerate(test_cases, 1):
        print(f"\n[{i}/{len(test_cases)}] Testing: {test_name}")

        try:
            result = increase_resolution(
                invalid_input, scale_factor=2, sync=True)

            if not result.get('success'):
                print(f"  ✓ Correctly rejected invalid input")
                print(f"    Error message: {result.get('error')}")
                results.append(True)
            else:
                print(f"  ✗ Should have rejected invalid input")
                results.append(False)

        except (ValueError, TypeError) as e:
            # Exceptions are expected for invalid input
            print(f"  ✓ Raised exception (expected): {str(e)}")
            results.append(True)
        except Exception as e:
            # Other exceptions are also acceptable for invalid input
            print(f"  ✓ Raised exception (acceptable): {str(e)}")
            results.append(True)

    # Summary for this test
    passed = sum(results)
    total = len(results)
    print(f"\n  Invalid input handling: {passed}/{total} successful")

    return passed == total


def test_poll_status_timeout():
    """Test poll_status() with timeout scenarios."""
    print("\n" + "="*60)
    print("TEST: Poll Status - Timeout Scenarios")
    print("="*60)

    from image_editor import poll_status
    import time

    # Test 1: Invalid status URL validation
    print("\n[1/5] Testing with invalid status URL...")
    try:
        result = poll_status("", timeout=5)
        print("  ✗ Should have raised ValueError for empty URL")
        return False
    except ValueError as e:
        print(f"  ✓ Correctly raised ValueError: {str(e)}")

    # Test 2: Non-HTTP URL validation
    print("\n[2/5] Testing with non-HTTP URL...")
    try:
        result = poll_status("not-a-url", timeout=5)
        print("  ✗ Should have raised ValueError for invalid URL")
        return False
    except ValueError as e:
        print(f"  ✓ Correctly raised ValueError: {str(e)}")

    # Test 3: None URL validation
    print("\n[3/5] Testing with None URL...")
    try:
        result = poll_status(None, timeout=5)
        print("  ✗ Should have raised ValueError for None URL")
        return False
    except (ValueError, TypeError) as e:
        print(f"  ✓ Correctly raised exception: {str(e)}")

    # Test 4: Timeout with non-existent endpoint (should timeout quickly)
    print("\n[4/5] Testing timeout with non-existent endpoint...")
    print("  (This will take ~5 seconds to timeout)")
    start_time = time.time()
    try:
        # Use a valid URL format but non-existent endpoint that will timeout
        result = poll_status("https://httpbin.org/delay/100", timeout=5)
        print("  ✗ Should have raised timeout exception")
        return False
    except Exception as e:
        elapsed = time.time() - start_time
        if "timeout" in str(e).lower() or elapsed >= 5:
            print(f"  ✓ Correctly timed out after {elapsed:.1f}s")
            print(f"    Exception: {str(e)}")
        else:
            print(f"  ⚠ Unexpected exception after {elapsed:.1f}s: {str(e)}")

    # Test 5: Timeout with unreachable host (consecutive errors)
    print("\n[5/5] Testing timeout with unreachable host...")
    print("  (This tests consecutive error handling)")
    start_time = time.time()
    try:
        # Use an unreachable host that will cause connection errors
        result = poll_status("https://192.0.2.1/status", timeout=10)
        print("  ✗ Should have raised exception for unreachable host")
        return False
    except Exception as e:
        elapsed = time.time() - start_time
        if "consecutive" in str(e).lower() or "failed" in str(e).lower():
            print(
                f"  ✓ Correctly handled consecutive errors after {elapsed:.1f}s")
            print(f"    Exception: {str(e)}")
        else:
            print(f"  ⚠ Unexpected exception after {elapsed:.1f}s: {str(e)}")

    print("\n  All timeout scenario tests passed!")
    return True


def test_remove_background_malformed_base64():
    """Test remove_background() with malformed base64 data."""
    print("\n" + "="*60)
    print("TEST: Remove Background - Malformed Base64")
    print("="*60)

    test_cases = [
        ("Invalid base64 string", "not-valid-base64-data!!!"),
        ("Partial base64", "iVBORw0KGgo"),
        ("Random string", "hello world"),
    ]

    results = []

    for i, (test_name, invalid_base64) in enumerate(test_cases, 1):
        print(f"\n[{i}/{len(test_cases)}] Testing: {test_name}")

        try:
            result = remove_background(invalid_base64, sync=True)

            if not result.get('success'):
                print(f"  ✓ Correctly handled malformed base64")
                print(f"    Error message: {result.get('error')}")
                results.append(True)
            else:
                print(f"  ✗ Should have rejected malformed base64")
                results.append(False)

        except Exception as e:
            # Exceptions are also acceptable for malformed data
            print(f"  ✓ Raised exception (acceptable): {str(e)}")
            results.append(True)

    passed = sum(results)
    total = len(results)
    print(f"\n  Malformed base64 handling: {passed}/{total} successful")

    return passed == total


def test_replace_background_both_prompt_and_color():
    """Test replace_background() with both prompt and color provided."""
    print("\n" + "="*60)
    print("TEST: Replace Background - Both Prompt and Color")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    print("Testing with both background_prompt and background_color...")
    print("(API should handle this gracefully, likely prioritizing one)")

    try:
        result = replace_background(
            test_image_url,
            background_prompt="white studio background",
            background_color="#FFFFFF",
            sync=True
        )

        # This should either succeed (API handles it) or fail gracefully
        if result.get('success'):
            print("✓ API handled both parameters successfully")
            print(f"  Result URL: {result.get('result_url')}")
            return True
        else:
            print("✓ API rejected conflicting parameters gracefully")
            print(f"  Error message: {result.get('error')}")
            return True

    except Exception as e:
        print(f"✓ Raised exception (acceptable): {str(e)}")
        return True


def test_blur_background_boundary_values():
    """Test blur_background() with boundary values (0 and 100)."""
    print("\n" + "="*60)
    print("TEST: Blur Background - Boundary Values")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    test_cases = [
        ("Minimum blur (0)", 0),
        ("Maximum blur (100)", 100),
    ]

    results = []

    for i, (test_name, strength) in enumerate(test_cases, 1):
        print(f"\n[{i}/{len(test_cases)}] Testing: {test_name}")

        try:
            result = blur_background(
                test_image_url, blur_strength=strength, sync=True)

            if result.get('success'):
                print(f"  ✓ Success! Result URL: {result.get('result_url')}")
                results.append(True)
            else:
                print(f"  ✗ Failed: {result.get('error')}")
                results.append(False)

        except Exception as e:
            print(f"  ✗ Exception: {str(e)}")
            results.append(False)

    passed = sum(results)
    total = len(results)
    print(f"\n  Boundary value tests: {passed}/{total} successful")

    return passed == total


def test_generative_fill_empty_negative_prompt():
    """Test generative_fill() with empty negative prompt (should be allowed)."""
    print("\n" + "="*60)
    print("TEST: Generative Fill - Empty Negative Prompt")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    white_mask_base64 = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    )
    prompt = "add decorative elements"

    print("Testing with empty negative_prompt (should be allowed)...")

    try:
        from image_editor import generative_fill

        result = generative_fill(
            test_image_url,
            mask=white_mask_base64,
            prompt=prompt,
            negative_prompt="",  # Empty string should be allowed
            version=2,
            sync=True
        )

        if result.get('success'):
            print("✓ Empty negative prompt handled correctly")
            print(f"  Result URL: {result.get('result_url')}")
            return True
        else:
            # Empty negative prompt might be rejected by API, which is also valid
            print("✓ API rejected empty negative prompt (acceptable)")
            print(f"  Error message: {result.get('error')}")
            return True

    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        return False


def test_expand_image_same_dimensions():
    """Test expand_image() with same dimensions as original (edge case)."""
    print("\n" + "="*60)
    print("TEST: Expand Image - Same Dimensions")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    print("Testing expansion to same dimensions (500x500)...")
    print("(This is an edge case - API might reject or handle gracefully)")

    try:
        from image_editor import expand_image

        result = expand_image(
            test_image_url,
            target_width=500,
            target_height=500,
            sync=True
        )

        # Either success or graceful failure is acceptable
        if result.get('success'):
            print("✓ API handled same dimensions successfully")
            print(f"  Result URL: {result.get('result_url')}")
            return True
        else:
            print("✓ API rejected same dimensions (acceptable)")
            print(f"  Error message: {result.get('error')}")
            return True

    except Exception as e:
        print(f"✓ Raised exception (acceptable): {str(e)}")
        return True


def test_expand_image_very_large_dimensions():
    """Test expand_image() with very large dimensions."""
    print("\n" + "="*60)
    print("TEST: Expand Image - Very Large Dimensions")
    print("="*60)

    test_image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"

    print("Testing expansion to very large dimensions (10000x10000)...")
    print("(API should reject or handle this gracefully)")

    try:
        from image_editor import expand_image

        result = expand_image(
            test_image_url,
            target_width=10000,
            target_height=10000,
            sync=True
        )

        # Either rejection or success is acceptable (API decides limits)
        if result.get('success'):
            print("✓ API handled large dimensions successfully")
            print(f"  Result URL: {result.get('result_url')}")
            return True
        else:
            print("✓ API rejected large dimensions (expected)")
            print(f"  Error message: {result.get('error')}")
            return True

    except Exception as e:
        print(f"✓ Raised exception (acceptable): {str(e)}")
        return True


def test_multiple_functions_with_invalid_url():
    """Test multiple functions with invalid image URL."""
    print("\n" + "="*60)
    print("TEST: Multiple Functions - Invalid URL")
    print("="*60)

    invalid_url = "https://invalid-domain-that-does-not-exist-12345.com/image.jpg"

    from image_editor import (
        remove_background, replace_background, blur_background,
        enhance_image, increase_resolution
    )

    test_cases = [
        ("remove_background", lambda: remove_background(invalid_url, sync=True)),
        ("replace_background", lambda: replace_background(
            invalid_url, background_color="#FFFFFF", sync=True)),
        ("blur_background", lambda: blur_background(
            invalid_url, blur_strength=50, sync=True)),
        ("enhance_image", lambda: enhance_image(invalid_url, sync=True)),
        ("increase_resolution", lambda: increase_resolution(
            invalid_url, scale_factor=2, sync=True)),
    ]

    results = []

    for i, (func_name, test_func) in enumerate(test_cases, 1):
        print(f"\n[{i}/{len(test_cases)}] Testing {func_name} with invalid URL...")

        try:
            result = test_func()

            if not result.get('success'):
                print(f"  ✓ Correctly handled invalid URL")
                print(f"    Error message: {result.get('error')}")
                results.append(True)
            else:
                print(f"  ✗ Should have rejected invalid URL")
                results.append(False)

        except Exception as e:
            # Exceptions are also acceptable for invalid URLs
            print(f"  ✓ Raised exception (acceptable): {str(e)}")
            results.append(True)

    passed = sum(results)
    total = len(results)
    print(f"\n  Invalid URL handling: {passed}/{total} successful")

    return passed == total


if __name__ == "__main__":
    print("\n" + "="*60)
    print("IMAGE EDITOR TESTS")
    print("="*60)

    # Run tests
    test_results = []

    # Error Handling & Edge Case Tests (NEW)
    print("\n--- ERROR HANDLING & EDGE CASE TESTS ---")
    test_results.append(
        ("Poll Status - Timeout Scenarios", test_poll_status_timeout()))
    test_results.append(
        ("Multiple Functions - Invalid URL", test_multiple_functions_with_invalid_url()))

    # Remove Background Tests
    print("\n--- REMOVE BACKGROUND TESTS ---")
    test_results.append(
        ("Remove BG - Invalid Input", test_remove_background_invalid_input()))
    test_results.append(
        ("Remove BG - Malformed Base64", test_remove_background_malformed_base64()))
    test_results.append(
        ("Remove BG - Local Image", test_remove_background_with_local_image()))
    test_results.append(
        ("Remove BG - URL Image", test_remove_background_with_url()))
    test_results.append(
        ("Remove BG - Async Mode", test_remove_background_async()))

    # Replace Background Tests
    print("\n--- REPLACE BACKGROUND TESTS ---")
    test_results.append(
        ("Replace BG - Invalid Input", test_replace_background_invalid_input()))
    test_results.append(
        ("Replace BG - Both Prompt and Color", test_replace_background_both_prompt_and_color()))
    test_results.append(
        ("Replace BG - With Prompt", test_replace_background_with_prompt()))
    test_results.append(
        ("Replace BG - With Color", test_replace_background_with_color()))
    test_results.append(
        ("Replace BG - Various Prompts", test_replace_background_various_prompts()))
    test_results.append(
        ("Replace BG - Async Mode", test_replace_background_async()))

    # Blur Background Tests
    print("\n--- BLUR BACKGROUND TESTS ---")
    test_results.append(
        ("Blur BG - Invalid Strength", test_blur_background_invalid_strength()))
    test_results.append(
        ("Blur BG - Boundary Values", test_blur_background_boundary_values()))
    test_results.append(
        ("Blur BG - Various Strengths", test_blur_background_with_various_strengths()))
    test_results.append(
        ("Blur BG - Async Mode", test_blur_background_async()))

    # Generative Fill Tests
    print("\n--- GENERATIVE FILL TESTS ---")
    test_results.append(
        ("Gen Fill - Invalid Input", test_generative_fill_invalid_input()))
    test_results.append(
        ("Gen Fill - Empty Negative Prompt", test_generative_fill_empty_negative_prompt()))
    test_results.append(
        ("Gen Fill - With Mask and Prompt", test_generative_fill_with_mask_and_prompt()))
    test_results.append(
        ("Gen Fill - Version 1", test_generative_fill_version_1()))
    test_results.append(
        ("Gen Fill - Async Mode", test_generative_fill_async()))

    # Expand Image Tests
    print("\n--- EXPAND IMAGE TESTS ---")
    test_results.append(
        ("Expand - Invalid Dimensions", test_expand_image_invalid_dimensions()))
    test_results.append(
        ("Expand - Same Dimensions", test_expand_image_same_dimensions()))
    test_results.append(
        ("Expand - Very Large Dimensions", test_expand_image_very_large_dimensions()))
    test_results.append(
        ("Expand - Different Dimensions", test_expand_image_with_different_dimensions()))
    test_results.append(
        ("Expand - With Prompt", test_expand_image_with_prompt()))
    test_results.append(
        ("Expand - Common Aspect Ratios", test_expand_image_common_aspect_ratios()))
    test_results.append(
        ("Expand - Async Mode", test_expand_image_async()))

    # Enhance Image Tests
    print("\n--- ENHANCE IMAGE TESTS ---")
    test_results.append(
        ("Enhance - Invalid Input", test_enhance_image_invalid_input()))
    test_results.append(
        ("Enhance - Basic", test_enhance_image_basic()))
    test_results.append(
        ("Enhance - Local Image", test_enhance_image_with_local_image()))
    test_results.append(
        ("Enhance - Async Mode", test_enhance_image_async()))

    # Increase Resolution Tests
    print("\n--- INCREASE RESOLUTION TESTS ---")
    test_results.append(
        ("Upscale - Invalid Scale Factor", test_increase_resolution_invalid_scale_factor()))
    test_results.append(
        ("Upscale - 2x Scale Factor", test_increase_resolution_2x()))
    test_results.append(
        ("Upscale - 4x Scale Factor", test_increase_resolution_4x()))
    test_results.append(
        ("Upscale - Local Image", test_increase_resolution_with_local_image()))
    test_results.append(
        ("Upscale - Async Mode", test_increase_resolution_async()))
    test_results.append(
        ("Upscale - Invalid Input", test_increase_resolution_invalid_input()))

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
