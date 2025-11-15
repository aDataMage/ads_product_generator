"""Test script for Image Analysis feature."""

import base64
import json
from pathlib import Path
from image_analyzer import analyze_image_file


def test_image_analysis():
    """Test image analysis with a sample product image."""

    # Check if we have a sample image in inputs folder
    inputs_dir = Path('inputs')

    if not inputs_dir.exists():
        print("❌ No inputs directory found")
        return

    # Find first image file
    image_files = list(inputs_dir.glob(
        '*.png')) + list(inputs_dir.glob('*.jpg')) + list(inputs_dir.glob('*.jpeg'))

    if not image_files:
        print("❌ No image files found in inputs directory")
        print("Please add a product image to the inputs/ folder")
        return

    image_path = image_files[0]
    print(f"📸 Testing with image: {image_path}")
    print("=" * 60)

    try:
        # Analyze the image
        print("🔍 Analyzing image with Gemini Vision API...")
        structured_prompt = analyze_image_file(str(image_path))

        print("\n✅ Analysis completed successfully!")
        print("=" * 60)
        print("\n📋 Generated Structured Prompt:\n")
        print(json.dumps(structured_prompt, indent=2))

        # Validate structure
        print("\n" + "=" * 60)
        print("✅ Validation:")
        required_fields = [
            'short_description', 'background_setting', 'style_medium',
            'artistic_style', 'context', 'lighting', 'aesthetics',
            'photographic_characteristics', 'objects'
        ]

        for field in required_fields:
            if field in structured_prompt:
                print(f"  ✓ {field}")
            else:
                print(f"  ✗ {field} - MISSING")

        print("\n" + "=" * 60)
        print("🎉 Test completed successfully!")

    except Exception as e:
        print(f"\n❌ Error during analysis: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_image_analysis()
