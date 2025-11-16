# Migration Plan: Gemini → OpenAI GPT-4 for Prompt Engineering

**Date:** November 16, 2025  
**Objective:** Replace Gemini with OpenAI GPT-4 (with Vision) for prompt engineering

---

## 📊 Comparison: Gemini vs OpenAI GPT-4

| Feature | Gemini Pro | GPT-4 Turbo | GPT-4 Vision | Winner |
|---------|-----------|-------------|--------------|--------|
| **Text Generation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Tie |
| **Image Understanding** | ⭐⭐⭐⭐ | N/A | ⭐⭐⭐⭐⭐ | GPT-4V |
| **Prompt Engineering** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | GPT-4 |
| **Context Window** | 32K tokens | 128K tokens | 128K tokens | GPT-4 |
| **Speed** | Fast | Medium | Medium | Gemini |
| **Cost per 1K tokens** | $0.00025 | $0.01 | $0.01 | Gemini |
| **Reliability** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | GPT-4 |
| **JSON Mode** | ✅ | ✅ | ✅ | Tie |
| **Function Calling** | ✅ | ✅ | ✅ | Tie |

---

## 🎯 Why Switch to OpenAI GPT-4?

### Advantages

1. **Superior Image Understanding** 🖼️
   - GPT-4 Vision can analyze reference images
   - Better understanding of product details
   - Can extract style, lighting, composition from images
   - More accurate prompt generation from visual input

2. **Better Prompt Engineering** ✍️
   - More creative and detailed prompts
   - Better understanding of photography terminology
   - Stronger reasoning about visual concepts
   - More consistent output quality

3. **Larger Context Window** 📚
   - 128K tokens vs 32K tokens
   - Can handle more complex presets
   - Better for Pro Mode with detailed specifications

4. **Industry Standard** 🏆
   - More widely used and tested
   - Better documentation and community support
   - More examples and best practices available

5. **Better Structured Output** 📋
   - More reliable JSON formatting
   - Better adherence to instructions
   - Fewer parsing errors

### Disadvantages

1. **Higher Cost** 💰
   - ~40x more expensive than Gemini
   - $0.01 per 1K input tokens vs $0.00025
   - Need to optimize token usage

2. **Slightly Slower** ⏱️
   - Response time: 2-5 seconds vs 1-2 seconds
   - May need loading indicators

3. **API Key Management** 🔑
   - Need OpenAI account and API key
   - Different billing system

---

## 💡 Recommendation: Hybrid Approach

**Best Solution:** Use both, with intelligent routing!

```python
def generate_master_prompt(user_prompt, preset, reference_image=None):
    """
    Intelligent routing:
    - Use GPT-4 Vision if reference image provided
    - Use GPT-4 Turbo for complex Pro Mode prompts
    - Use Gemini for simple Standard Mode (cost optimization)
    """
    if reference_image:
        # GPT-4 Vision for image analysis
        return openai_vision_prompt_engineering(user_prompt, preset, reference_image)
    elif is_pro_mode and len(preset) > 1000:
        # GPT-4 Turbo for complex prompts
        return openai_prompt_engineering(user_prompt, preset)
    else:
        # Gemini for simple, cost-effective generation
        return gemini_prompt_engineering(user_prompt, preset)
```

---

## 🛠️ Implementation Plan

### Phase 1: Add OpenAI Support (Keep Gemini)

**Goal:** Add OpenAI as an option, keep Gemini as default

#### Step 1.1: Install OpenAI SDK

```bash
pip install openai
```

Update `pyproject.toml`:

```toml
[project]
dependencies = [
    "google-generativeai>=0.8.5",
    "openai>=1.0.0",  # Add this
    "requests>=2.32.5",
    # ... rest
]
```

#### Step 1.2: Add OpenAI API Key to Config

```python
# config.py
import os

# Existing
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', 'your-google-api-key-here')
BRIA_API_KEY = "your-bria-api-key-here"

# Add OpenAI
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', 'your-openai-api-key-here')
```

#### Step 1.3: Create OpenAI Prompt Engineering Module

```python
# openai_prompt_engineer.py
from openai import OpenAI
import json
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_master_prompt_openai(user_prompt: str, preset_data: dict, reference_image_base64: str = None) -> str:
    """
    Generate master prompt using OpenAI GPT-4
    
    Args:
        user_prompt: User's simple description
        preset_data: Style preset JSON
        reference_image_base64: Optional reference image
    
    Returns:
        Detailed master prompt for image generation
    """
    
    # Read merger prompt template
    with open('merger_prompt.txt', 'r') as f:
        merger_template = f.read()
    
    # Prepare messages
    messages = [
        {
            "role": "system",
            "content": "You are an expert prompt engineer for AI image generation. Create detailed, professional prompts for product photography."
        },
        {
            "role": "user",
            "content": merger_template.format(
                user_prompt=user_prompt,
                preset_json=json.dumps(preset_data, indent=2)
            )
        }
    ]
    
    # Add image if provided (GPT-4 Vision)
    if reference_image_base64:
        messages[1]["content"] = [
            {
                "type": "text",
                "text": merger_template.format(
                    user_prompt=user_prompt,
                    preset_json=json.dumps(preset_data, indent=2)
                )
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{reference_image_base64}",
                    "detail": "high"
                }
            }
        ]
    
    # Call OpenAI API
    response = client.chat.completions.create(
        model="gpt-4-turbo-preview" if not reference_image_base64 else "gpt-4-vision-preview",
        messages=messages,
        max_tokens=1000,
        temperature=0.7
    )
    
    master_prompt = response.choices[0].message.content.strip()
    
    print(f"[OpenAI] Generated master prompt: {master_prompt[:100]}...")
    
    return master_prompt
```

#### Step 1.4: Update Workflow with Provider Selection

```python
# workflow.py
from openai_prompt_engineer import generate_master_prompt_openai
# Keep existing Gemini import

def run_generation_workflow(
    user_prompt, 
    preset_name, 
    reference_image_base64=None,
    prompt_provider='gemini'  # Add this parameter
):
    """
    Run the 2-call generation workflow
    
    Args:
        prompt_provider: 'gemini' or 'openai' or 'auto'
    """
    
    # Load preset
    preset_data = load_preset(preset_name)
    
    # Step 1: Generate master prompt (with provider selection)
    if prompt_provider == 'auto':
        # Intelligent routing
        if reference_image_base64:
            prompt_provider = 'openai'  # Use GPT-4 Vision for images
        else:
            prompt_provider = 'gemini'  # Use Gemini for cost optimization
    
    if prompt_provider == 'openai':
        master_prompt = generate_master_prompt_openai(
            user_prompt, 
            preset_data, 
            reference_image_base64
        )
    else:
        master_prompt = generate_master_prompt_gemini(
            user_prompt, 
            preset_data
        )
    
    # Step 2: Generate image with Bria (unchanged)
    final_image_url = generate_with_bria(master_prompt, reference_image_base64)
    
    return {
        'success': True,
        'final_image_url': final_image_url,
        'master_prompt': master_prompt,
        'prompt_provider': prompt_provider
    }
```

#### Step 1.5: Update API Server

```python
# api_server.py
@app.route('/api/generate', methods=['POST'])
def generate_image():
    data = request.json
    user_prompt = data.get('user_prompt')
    preset_name = data.get('preset_name')
    reference_image_base64 = data.get('reference_image_base64')
    prompt_provider = data.get('prompt_provider', 'auto')  # Add this
    
    result = run_generation_workflow(
        user_prompt,
        preset_name,
        reference_image_base64,
        prompt_provider  # Pass through
    )
    
    return jsonify(result)
```

#### Step 1.6: Update Frontend to Allow Provider Selection

```typescript
// elegant-flow-ui/src/lib/api.ts
export interface GenerateImageRequest {
  user_prompt: string;
  preset_name: string;
  reference_image_base64?: string;
  prompt_provider?: 'gemini' | 'openai' | 'auto';  // Add this
}

export async function generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  return response.json();
}
```

---

### Phase 2: Testing & Comparison

#### Test Script

```python
# test_prompt_providers.py
import asyncio
from workflow import run_generation_workflow

async def compare_providers():
    """Compare Gemini vs OpenAI prompt quality"""
    
    test_cases = [
        {
            "user_prompt": "Modern wireless headphones",
            "preset_name": "preset_luxury_reflection.json"
        },
        {
            "user_prompt": "Smartphone with metallic finish",
            "preset_name": "preset_bright_clean.json"
        }
    ]
    
    for test in test_cases:
        print(f"\n{'='*60}")
        print(f"Test: {test['user_prompt']}")
        print(f"{'='*60}\n")
        
        # Test with Gemini
        result_gemini = run_generation_workflow(
            test['user_prompt'],
            test['preset_name'],
            prompt_provider='gemini'
        )
        print(f"Gemini Prompt:\n{result_gemini['master_prompt']}\n")
        
        # Test with OpenAI
        result_openai = run_generation_workflow(
            test['user_prompt'],
            test['preset_name'],
            prompt_provider='openai'
        )
        print(f"OpenAI Prompt:\n{result_openai['master_prompt']}\n")
        
        # Compare
        print(f"Gemini length: {len(result_gemini['master_prompt'])} chars")
        print(f"OpenAI length: {len(result_openai['master_prompt'])} chars")

if __name__ == "__main__":
    asyncio.run(compare_providers())
```

---

### Phase 3: Gradual Migration

#### Week 1: A/B Testing

- 50% Gemini, 50% OpenAI
- Collect user feedback
- Monitor costs

#### Week 2: Analysis

- Compare image quality
- Analyze cost impact
- Review user satisfaction

#### Week 3: Decision

- If OpenAI is better: Increase to 80% OpenAI
- If similar: Keep hybrid approach
- If worse: Revert to Gemini

---

## 💰 Cost Analysis

### Current (Gemini Only)

```
Average prompt: 500 tokens input, 200 tokens output
Cost per generation: $0.000125 + $0.00005 = $0.000175
1000 generations: $0.175
```

### With OpenAI GPT-4

```
Average prompt: 500 tokens input, 200 tokens output
Cost per generation: $0.005 + $0.006 = $0.011
1000 generations: $11.00
```

### Hybrid Approach (Recommended)

```
70% Gemini (simple): 700 × $0.000175 = $0.12
30% OpenAI (complex): 300 × $0.011 = $3.30
Total for 1000: $3.42

Cost increase: ~20x, but only for complex cases
```

---

## 🎯 Recommended Strategy

### Option 1: Full Migration to OpenAI ⭐⭐⭐

**When:** You prioritize quality over cost

**Pros:**

- Best prompt quality
- Image understanding with Vision
- Consistent experience

**Cons:**

- 60x cost increase
- Slightly slower

### Option 2: Hybrid Approach ⭐⭐⭐⭐⭐ (RECOMMENDED)

**When:** You want balance of quality and cost

**Pros:**

- Best of both worlds
- Cost-effective for simple cases
- GPT-4 Vision for reference images
- Only 20x cost increase

**Cons:**

- More complex codebase
- Need to maintain both integrations

### Option 3: Keep Gemini, Add OpenAI as Premium ⭐⭐⭐⭐

**When:** You want to offer tiered pricing

**Pros:**

- Free tier: Gemini
- Premium tier: OpenAI GPT-4 Vision
- Revenue opportunity

**Cons:**

- Need pricing strategy
- User confusion

---

## 📝 Implementation Checklist

- [ ] Install OpenAI SDK
- [ ] Add OPENAI_API_KEY to config
- [ ] Create `openai_prompt_engineer.py`
- [ ] Update `workflow.py` with provider selection
- [ ] Update `api_server.py` to accept provider parameter
- [ ] Update frontend API types
- [ ] Add provider selection UI (optional)
- [ ] Create comparison test script
- [ ] Run A/B tests
- [ ] Monitor costs and quality
- [ ] Make final decision
- [ ] Update documentation

---

## 🚀 Quick Start (Hybrid Approach)

1. **Install OpenAI:**

```bash
pip install openai
```

2. **Set API Key:**

```bash
set OPENAI_API_KEY=sk-...
```

3. **Test:**

```python
python test_prompt_providers.py
```

4. **Deploy with auto routing:**

```python
# Automatically uses OpenAI for images, Gemini for text
result = run_generation_workflow(
    "Modern headphones",
    "preset_luxury_reflection.json",
    reference_image_base64=image_data,
    prompt_provider='auto'  # Smart routing
)
```

---

## Conclusion

**Recommendation:** Implement the **Hybrid Approach** (Option 2)

- Use **OpenAI GPT-4 Vision** when reference images are provided
- Use **OpenAI GPT-4 Turbo** for complex Pro Mode prompts
- Use **Gemini** for simple Standard Mode (cost optimization)
- Set `prompt_provider='auto'` for intelligent routing

This gives you the best quality where it matters while keeping costs reasonable for simple use cases.

**Next Step:** Shall I implement the hybrid approach with automatic routing?
