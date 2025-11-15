"""
Test validation helpers in image_editor module.
"""
import sys
from image_editor import (
    _validate_image_input,
    _validate_positive_integer,
    _validate_range,
    _validate_string_input
)


def test_validation_helpers():
    """Test all validation helper functions."""
    print("\n" + "="*60)
    print("VALIDATION HELPER TESTS")
    print("="*60)

    passed = 0
    failed = 0

    # Test 1: Valid image input
    print("\n--- Test 1: Valid image input ---")
    try:
        _validate_image_input("https://example.com/image.jpg", "test_image")
        print("✓ Valid URL accepted")
        passed += 1
    except ValueError as e:
        print(f"✗ Unexpected error: {e}")
        failed += 1

    # Test 2: Empty image input
    print("\n--- Test 2: Empty image input ---")
    try:
        _validate_image_input("", "test_image")
        print("✗ Empty string should have been rejected")
        failed += 1
    except ValueError as e:
        print(f"✓ Correctly rejected: {e}")
        passed += 1

    # Test 3: None image input
    print("\n--- Test 3: None image input ---")
    try:
        _validate_image_input(None, "test_image")
        print("✗ None should have been rejected")
        failed += 1
    except (ValueError, AttributeError) as e:
        print(f"✓ Correctly rejected: {e}")
        passed += 1

    # Test 4: Whitespace-only image input
    print("\n--- Test 4: Whitespace-only image input ---")
    try:
        _validate_image_input("   ", "test_image")
        print("✗ Whitespace should have been rejected")
        failed += 1
    except ValueError as e:
        print(f"✓ Correctly rejected: {e}")
        passed += 1

    # Test 5: Valid positive integer
    print("\n--- Test 5: Valid positive integer ---")
    try:
        _validate_positive_integer(100, "test_value")
        print("✓ Valid positive integer accepted")
        passed += 1
    except ValueError as e:
        print(f"✗ Unexpected error: {e}")
        failed += 1

    # Test 6: Zero value (should fail with min_value=1)
    print("\n--- Test 6: Zero value ---")
    try:
        _validate_positive_integer(0, "test_value", min_value=1)
        print("✗ Zero should have been rejected")
        failed += 1
    except ValueError as e:
        print(f"✓ Correctly rejected: {e}")
        passed += 1

    # Test 7: Negative value
    print("\n--- Test 7: Negative value ---")
    try:
        _validate_positive_integer(-5, "test_value")
        print("✗ Negative value should have been rejected")
        failed += 1
    except ValueError as e:
        print(f"✓ Correctly rejected: {e}")
        passed += 1

    # Test 8: Valid range
    print("\n--- Test 8: Valid range (50 in 0-100) ---")
    try:
        _validate_range(50, "blur_strength", 0, 100)
        print("✓ Valid range value accepted")
        passed += 1
    except ValueError as e:
        print(f"✗ Unexpected error: {e}")
        failed += 1

    # Test 9: Out of range (low)
    print("\n--- Test 9: Out of range (low) ---")
    try:
        _validate_range(-1, "blur_strength", 0, 100)
        print("✗ Out of range value should have been rejected")
        failed += 1
    except ValueError as e:
        print(f"✓ Correctly rejected: {e}")
        passed += 1

    # Test 10: Out of range (high)
    print("\n--- Test 10: Out of range (high) ---")
    try:
        _validate_range(101, "blur_strength", 0, 100)
        print("✗ Out of range value should have been rejected")
        failed += 1
    except ValueError as e:
        print(f"✓ Correctly rejected: {e}")
        passed += 1

    # Test 11: Valid string
    print("\n--- Test 11: Valid string ---")
    try:
        _validate_string_input("valid prompt", "prompt")
        print("✓ Valid string accepted")
        passed += 1
    except ValueError as e:
        print(f"✗ Unexpected error: {e}")
        failed += 1

    # Test 12: Empty string (not allowed)
    print("\n--- Test 12: Empty string (not allowed) ---")
    try:
        _validate_string_input("", "prompt", allow_empty=False)
        print("✗ Empty string should have been rejected")
        failed += 1
    except ValueError as e:
        print(f"✓ Correctly rejected: {e}")
        passed += 1

    # Test 13: Empty string (allowed)
    print("\n--- Test 13: Empty string (allowed) ---")
    try:
        _validate_string_input("", "prompt", allow_empty=True)
        print("✓ Empty string accepted when allowed")
        passed += 1
    except ValueError as e:
        print(f"✗ Unexpected error: {e}")
        failed += 1

    # Test 14: None string
    print("\n--- Test 14: None string ---")
    try:
        _validate_string_input(None, "prompt")
        print("✗ None should have been rejected")
        failed += 1
    except ValueError as e:
        print(f"✓ Correctly rejected: {e}")
        passed += 1

    # Test 15: Wrong type (integer instead of string)
    print("\n--- Test 15: Wrong type for string ---")
    try:
        _validate_string_input(123, "prompt")
        print("✗ Integer should have been rejected")
        failed += 1
    except ValueError as e:
        print(f"✓ Correctly rejected: {e}")
        passed += 1

    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"✓ Passed: {passed}/15")
    print(f"✗ Failed: {failed}/15")
    print("="*60)

    return failed == 0


if __name__ == "__main__":
    success = test_validation_helpers()
    sys.exit(0 if success else 1)
