/**
 * Background Replacement Presets
 * 
 * Common background options for the BackgroundEditor component.
 * These presets provide quick access to popular background styles
 * for product photography.
 * 
 * Requirements: Task 2.2 - Background Presets
 */

export interface BackgroundPreset {
    id: string;
    name: string;
    category: 'studio' | 'outdoor' | 'abstract' | 'solid';
    prompt?: string;
    color?: string;
    description: string;
    icon?: string; // Lucide icon name for visual representation
}

/**
 * Studio Background Presets
 * Professional studio backgrounds for clean product photography
 */
const STUDIO_PRESETS: BackgroundPreset[] = [
    {
        id: 'studio_white',
        name: 'White Studio',
        category: 'studio',
        prompt: 'clean white studio background with soft even lighting, professional photography backdrop, seamless white sweep',
        description: 'Classic white studio background with soft, even lighting',
        icon: 'Square'
    },
    {
        id: 'studio_black',
        name: 'Black Studio',
        category: 'studio',
        prompt: 'solid black studio background, dramatic dark backdrop, professional photography setup, deep black seamless',
        description: 'Dramatic black studio background for luxury products',
        icon: 'Square'
    },
    {
        id: 'studio_gray',
        name: 'Gray Studio',
        category: 'studio',
        prompt: 'neutral gray studio background, professional photography backdrop, medium gray seamless sweep, soft lighting',
        description: 'Neutral gray studio background for versatile product shots',
        icon: 'Square'
    }
];

/**
 * Gradient Background Presets
 * Smooth color transitions for depth and visual interest
 */
const GRADIENT_PRESETS: BackgroundPreset[] = [
    {
        id: 'gradient_white_gray',
        name: 'White to Gray Gradient',
        category: 'studio',
        prompt: 'smooth gradient background from white to light gray, professional studio sweep, subtle color transition, adds depth',
        description: 'Subtle gradient from white to gray for dimensional look',
        icon: 'Layers'
    },
    {
        id: 'gradient_blue',
        name: 'Blue Gradient',
        category: 'studio',
        prompt: 'smooth blue gradient background, light blue to deep blue transition, professional studio backdrop, calming atmosphere',
        description: 'Cool blue gradient for tech and modern products',
        icon: 'Layers'
    },
    {
        id: 'gradient_warm',
        name: 'Warm Gradient',
        category: 'studio',
        prompt: 'warm gradient background, cream to soft peach transition, inviting atmosphere, professional photography backdrop',
        description: 'Warm gradient for lifestyle and beauty products',
        icon: 'Layers'
    },
    {
        id: 'gradient_purple',
        name: 'Purple Gradient',
        category: 'studio',
        prompt: 'elegant purple gradient background, lavender to deep purple transition, luxury feel, professional studio sweep',
        description: 'Elegant purple gradient for premium products',
        icon: 'Layers'
    },
    {
        id: 'gradient_green',
        name: 'Green Gradient',
        category: 'studio',
        prompt: 'fresh green gradient background, light mint to forest green transition, natural feel, professional backdrop',
        description: 'Fresh green gradient for natural and eco products',
        icon: 'Layers'
    }
];

/**
 * Outdoor Background Presets
 * Natural outdoor scenes for lifestyle product photography
 */
const OUTDOOR_PRESETS: BackgroundPreset[] = [
    {
        id: 'outdoor_nature',
        name: 'Natural Outdoor',
        category: 'outdoor',
        prompt: 'natural outdoor background with soft bokeh, blurred greenery, sunlight filtering through leaves, organic atmosphere',
        description: 'Soft natural outdoor setting with blurred greenery',
        icon: 'Trees'
    },
    {
        id: 'outdoor_beach',
        name: 'Beach Scene',
        category: 'outdoor',
        prompt: 'beach background with soft sand and blurred ocean, coastal atmosphere, natural sunlight, vacation vibes',
        description: 'Coastal beach setting for summer and lifestyle products',
        icon: 'Waves'
    },
    {
        id: 'outdoor_urban',
        name: 'Urban Setting',
        category: 'outdoor',
        prompt: 'modern urban background, blurred city architecture, contemporary setting, soft focus buildings and streets',
        description: 'Contemporary urban environment for modern products',
        icon: 'Building2'
    }
];

/**
 * Abstract Background Presets
 * Creative abstract patterns and textures
 */
const ABSTRACT_PRESETS: BackgroundPreset[] = [
    {
        id: 'abstract_bokeh',
        name: 'Bokeh Lights',
        category: 'abstract',
        prompt: 'abstract bokeh background with soft circular light orbs, dreamy atmosphere, blurred colorful lights, magical feel',
        description: 'Dreamy bokeh lights for festive and elegant products',
        icon: 'Sparkles'
    },
    {
        id: 'abstract_geometric',
        name: 'Geometric Pattern',
        category: 'abstract',
        prompt: 'subtle geometric pattern background, modern abstract shapes, minimalist design, soft colors, contemporary aesthetic',
        description: 'Modern geometric patterns for tech and design products',
        icon: 'Shapes'
    },
    {
        id: 'abstract_texture',
        name: 'Textured Surface',
        category: 'abstract',
        prompt: 'abstract textured background, soft fabric or paper texture, subtle depth, artistic feel, neutral tones',
        description: 'Artistic textured surface for creative product shots',
        icon: 'Grid'
    }
];

/**
 * Solid Color Presets
 * Pure solid colors for clean, simple backgrounds
 */
const SOLID_COLOR_PRESETS: BackgroundPreset[] = [
    {
        id: 'solid_white',
        name: 'Pure White',
        category: 'solid',
        color: '#FFFFFF',
        description: 'Clean pure white background',
        icon: 'Circle'
    },
    {
        id: 'solid_black',
        name: 'Pure Black',
        category: 'solid',
        color: '#000000',
        description: 'Solid black background for dramatic contrast',
        icon: 'Circle'
    },
    {
        id: 'solid_gray',
        name: 'Neutral Gray',
        category: 'solid',
        color: '#808080',
        description: 'Neutral gray for balanced product shots',
        icon: 'Circle'
    },
    {
        id: 'solid_light_gray',
        name: 'Light Gray',
        category: 'solid',
        color: '#D3D3D3',
        description: 'Soft light gray background',
        icon: 'Circle'
    },
    {
        id: 'solid_beige',
        name: 'Warm Beige',
        category: 'solid',
        color: '#F5F5DC',
        description: 'Warm beige for natural product photography',
        icon: 'Circle'
    },
    {
        id: 'solid_blue',
        name: 'Sky Blue',
        category: 'solid',
        color: '#87CEEB',
        description: 'Fresh sky blue background',
        icon: 'Circle'
    },
    {
        id: 'solid_navy',
        name: 'Navy Blue',
        category: 'solid',
        color: '#000080',
        description: 'Deep navy blue for professional look',
        icon: 'Circle'
    },
    {
        id: 'solid_pink',
        name: 'Soft Pink',
        category: 'solid',
        color: '#FFB6C1',
        description: 'Gentle pink for beauty and lifestyle products',
        icon: 'Circle'
    },
    {
        id: 'solid_green',
        name: 'Forest Green',
        category: 'solid',
        color: '#228B22',
        description: 'Natural forest green background',
        icon: 'Circle'
    },
    {
        id: 'solid_red',
        name: 'Bold Red',
        category: 'solid',
        color: '#DC143C',
        description: 'Vibrant red for attention-grabbing shots',
        icon: 'Circle'
    }
];

/**
 * All background presets combined
 */
export const BACKGROUND_PRESETS: BackgroundPreset[] = [
    ...STUDIO_PRESETS,
    ...GRADIENT_PRESETS,
    ...OUTDOOR_PRESETS,
    ...ABSTRACT_PRESETS,
    ...SOLID_COLOR_PRESETS
];

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: BackgroundPreset['category']): BackgroundPreset[] {
    return BACKGROUND_PRESETS.filter(preset => preset.category === category);
}

/**
 * Get preset by ID
 */
export function getPresetById(id: string): BackgroundPreset | undefined {
    return BACKGROUND_PRESETS.find(preset => preset.id === id);
}

/**
 * Category display names
 */
export const BACKGROUND_CATEGORY_NAMES: Record<BackgroundPreset['category'], string> = {
    studio: 'Studio',
    outdoor: 'Outdoor',
    abstract: 'Abstract',
    solid: 'Solid Colors'
};

/**
 * Get all categories
 */
export const BACKGROUND_CATEGORIES: BackgroundPreset['category'][] = [
    'studio',
    'outdoor',
    'abstract',
    'solid'
];
