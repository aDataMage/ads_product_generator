"""
Quick test script to verify the workflow module works correctly.
"""
from workflow import run_generation_workflow

# Test 1: Valid request without reference image
print("Test 1: Valid request (text-only)")
result = run_generation_workflow(
    user_prompt="a smartphone on a white background",
    preset_name="preset_bright_clean.json"
)
print(f"Result: {result}")
print()

# Test 2: Invalid preset name
print("Test 2: Invalid preset name")
result = run_generation_workflow(
    user_prompt="a smartphone",
    preset_name="invalid_preset.json"
)
print(f"Result: {result}")
print()

# Test 3: Empty user prompt
print("Test 3: Empty user prompt")
result = run_generation_workflow(
    user_prompt="",
    preset_name="preset_bright_clean.json"
)
print(f"Result: {result}")
