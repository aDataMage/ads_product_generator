"""
Test script to verify the expand_image fix
"""
from math import gcd

# Test dimensions from the error
target_width = 1365
target_height = 1024

# Calculate simplified aspect ratio using GCD
ratio_gcd = gcd(target_width, target_height)
simplified_width = target_width // ratio_gcd
simplified_height = target_height // ratio_gcd

print(f"Original dimensions: {target_width}x{target_height}")
print(f"GCD: {ratio_gcd}")
print(f"Simplified ratio: {simplified_width}:{simplified_height}")

# Map to standard aspect ratios
standard_ratios = {
    (1, 1): "1:1",
    (4, 3): "4:3",
    (3, 4): "3:4",
    (16, 9): "16:9",
    (9, 16): "9:16",
    (3, 2): "3:2",
    (2, 3): "2:3",
    (21, 9): "21:9",
    (9, 21): "9:21"
}

# Try to find exact match first
aspect_ratio = standard_ratios.get((simplified_width, simplified_height))

# If no exact match, find the closest standard aspect ratio
if not aspect_ratio:
    target_ratio = target_width / target_height
    closest_ratio = None
    min_diff = float('inf')

    print(f"\nTarget ratio value: {target_ratio:.4f}")
    print("\nComparing with standard ratios:")

    for (w, h), ratio_str in standard_ratios.items():
        standard_ratio_value = w / h
        diff = abs(standard_ratio_value - target_ratio)
        print(f"  {ratio_str} ({standard_ratio_value:.4f}): diff = {diff:.4f}")
        if diff < min_diff:
            min_diff = diff
            closest_ratio = ratio_str

    aspect_ratio = closest_ratio
    print(f"\nClosest match: {aspect_ratio} (diff: {min_diff:.4f})")
else:
    print(f"\nExact match found: {aspect_ratio}")

print(f"\nFinal aspect_ratio to send: {aspect_ratio}")
