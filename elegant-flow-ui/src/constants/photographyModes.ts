/**
 * Professional Photography Modes
 * 
 * Industry-standard photography techniques and settings that can be applied
 * to Pro Mode structured prompts. These modes add professional photography
 * context to the user's structured prompt before sending to the API.
 */

export interface PhotographyMode {
    id: string;
    name: string;
    description: string;
    category: 'commercial' | 'artistic' | 'technical' | 'editorial';
    promptAddition: string;
}

export const PHOTOGRAPHY_MODES: PhotographyMode[] = [
    // Commercial Photography
    {
        id: 'catalog',
        name: 'Catalog Photography',
        description: 'Clean, accurate product representation for catalogs and e-commerce',
        category: 'commercial',
        promptAddition: 'Shot in catalog photography style with accurate color reproduction, even lighting, neutral white background, sharp focus throughout, no creative shadows, straightforward composition optimized for product clarity and detail visibility.'
    },
    {
        id: 'hero_product',
        name: 'Hero Product Shot',
        description: 'Dramatic, attention-grabbing product photography for marketing',
        category: 'commercial',
        promptAddition: 'Hero product photography with dramatic lighting, bold composition, strong visual impact, professional retouching, cinematic quality, designed to be the centerpiece of marketing materials with premium feel.'
    },
    {
        id: 'lifestyle_commercial',
        name: 'Lifestyle Commercial',
        description: 'Product in real-world context showing usage and benefits',
        category: 'commercial',
        promptAddition: 'Lifestyle commercial photography showing product in authentic use context, natural environment, relatable setting, aspirational yet achievable aesthetic, warm and inviting atmosphere, human-centric composition.'
    },
    {
        id: 'packshot',
        name: 'Packshot',
        description: 'Professional package photography with perfect alignment',
        category: 'commercial',
        promptAddition: 'Professional packshot photography with perfect geometric alignment, crisp edges, accurate perspective, clean background, optimal lighting to show package design clearly, studio-quality precision.'
    },

    // Artistic Photography
    {
        id: 'fine_art',
        name: 'Fine Art Photography',
        description: 'Artistic interpretation with creative lighting and composition',
        category: 'artistic',
        promptAddition: 'Fine art photography approach with creative interpretation, artistic lighting, thoughtful composition, emphasis on mood and emotion, gallery-worthy aesthetic, conceptual elements, sophisticated visual language.'
    },
    {
        id: 'still_life',
        name: 'Still Life',
        description: 'Classical still life arrangement with painterly quality',
        category: 'artistic',
        promptAddition: 'Still life photography with painterly quality, classical composition principles, careful arrangement, dramatic chiaroscuro lighting, rich textures, timeless aesthetic inspired by Dutch masters.'
    },
    {
        id: 'abstract_product',
        name: 'Abstract Product',
        description: 'Creative abstract interpretation focusing on form and color',
        category: 'artistic',
        promptAddition: 'Abstract product photography emphasizing form, color, and texture over literal representation, creative angles, experimental lighting, bold graphic composition, modern artistic sensibility.'
    },
    {
        id: 'minimalist_zen',
        name: 'Minimalist Zen',
        description: 'Serene, minimal composition with negative space',
        category: 'artistic',
        promptAddition: 'Minimalist zen photography with abundant negative space, serene composition, subtle tonal variations, peaceful atmosphere, Japanese aesthetic influence, emphasis on simplicity and tranquility.'
    },

    // Technical Photography
    {
        id: 'macro_detail',
        name: 'Macro Detail',
        description: 'Extreme close-up showing intricate product details',
        category: 'technical',
        promptAddition: 'Macro photography with extreme magnification, razor-sharp focus on intricate details, shallow depth of field, technical precision, revealing textures and craftsmanship invisible to naked eye, professional macro lens characteristics.'
    },
    {
        id: 'focus_stacking',
        name: 'Focus Stacking',
        description: 'Multiple focus planes combined for complete sharpness',
        category: 'technical',
        promptAddition: 'Focus stacking technique with complete sharpness from foreground to background, technical perfection, every detail in crisp focus, professional product photography standard, no depth of field limitations.'
    },
    {
        id: 'high_key',
        name: 'High Key',
        description: 'Bright, airy aesthetic with minimal shadows',
        category: 'technical',
        promptAddition: 'High key photography with bright, airy aesthetic, minimal shadows, overexposed background, clean and fresh feel, predominantly white tones, optimistic and light atmosphere, beauty and cosmetics industry standard.'
    },
    {
        id: 'low_key',
        name: 'Low Key',
        description: 'Dark, moody aesthetic with dramatic shadows',
        category: 'technical',
        promptAddition: 'Low key photography with dark, moody aesthetic, dramatic shadows, predominantly black tones, selective lighting highlighting key features, mysterious and sophisticated atmosphere, luxury product standard.'
    },
    {
        id: 'rim_lighting',
        name: 'Rim Lighting',
        description: 'Backlit edge glow separating subject from background',
        category: 'technical',
        promptAddition: 'Rim lighting technique with backlight creating glowing edge around product, strong separation from background, three-dimensional appearance, dramatic and professional look, automotive and tech industry favorite.'
    },
    {
        id: 'gradient_background',
        name: 'Gradient Background',
        description: 'Smooth color transition background for depth',
        category: 'technical',
        promptAddition: 'Gradient background photography with smooth color transition, professional studio sweep, adds depth without distraction, classic product photography technique, elegant and timeless approach.'
    },

    // Editorial Photography
    {
        id: 'editorial_fashion',
        name: 'Editorial Fashion',
        description: 'High-fashion editorial style with bold aesthetics',
        category: 'editorial',
        promptAddition: 'Editorial fashion photography style with bold aesthetics, magazine-worthy composition, trendy and contemporary, strong visual statement, fashion-forward approach, Vogue and Harper\'s Bazaar influence.'
    },
    {
        id: 'documentary_style',
        name: 'Documentary Style',
        description: 'Authentic, unposed product in natural environment',
        category: 'editorial',
        promptAddition: 'Documentary photography style with authentic, unposed aesthetic, natural environment, candid feel, storytelling approach, photojournalistic quality, genuine and relatable atmosphere.'
    },
    {
        id: 'architectural',
        name: 'Architectural',
        description: 'Precise geometric composition with architectural principles',
        category: 'editorial',
        promptAddition: 'Architectural photography approach with precise geometric composition, strong lines and angles, symmetry and balance, technical precision, modernist aesthetic, emphasis on form and structure.'
    },
    {
        id: 'cinematic',
        name: 'Cinematic',
        description: 'Film-inspired lighting and color grading',
        category: 'editorial',
        promptAddition: 'Cinematic photography with film-inspired lighting, movie-quality color grading, widescreen composition, dramatic atmosphere, Hollywood production value, storytelling through visual language.'
    },
    {
        id: 'vintage_analog',
        name: 'Vintage Analog',
        description: 'Film photography aesthetic with grain and warmth',
        category: 'editorial',
        promptAddition: 'Vintage analog photography aesthetic with film grain, warm color cast, slight imperfections, nostalgic feel, medium format film characteristics, timeless and authentic quality.'
    },
    {
        id: 'neon_cyberpunk',
        name: 'Neon Cyberpunk',
        description: 'Futuristic neon lighting with sci-fi atmosphere',
        category: 'editorial',
        promptAddition: 'Neon cyberpunk photography with vibrant neon lighting, futuristic atmosphere, bold color contrasts, sci-fi aesthetic, urban night scene influence, Blade Runner inspired mood.'
    },
    {
        id: 'golden_hour',
        name: 'Golden Hour',
        description: 'Warm, soft natural light mimicking sunset',
        category: 'editorial',
        promptAddition: 'Golden hour photography with warm, soft natural light, sunset glow, long shadows, romantic atmosphere, golden color temperature, outdoor photography magic hour aesthetic.'
    },
    {
        id: 'studio_strobe',
        name: 'Studio Strobe',
        description: 'Professional studio flash with crisp lighting',
        category: 'technical',
        promptAddition: 'Studio strobe photography with professional flash lighting, crisp and clean illumination, frozen motion capability, commercial photography standard, precise light control, high-end studio quality.'
    },
    {
        id: 'natural_window',
        name: 'Natural Window Light',
        description: 'Soft, directional window light for organic feel',
        category: 'artistic',
        promptAddition: 'Natural window light photography with soft, directional illumination, organic shadows, authentic atmosphere, gentle contrast, intimate and personal feel, lifestyle photography favorite.'
    },
    {
        id: 'reflection_mirror',
        name: 'Reflection & Mirror',
        description: 'Creative use of reflections and mirrored surfaces',
        category: 'artistic',
        promptAddition: 'Reflection and mirror photography with creative use of reflective surfaces, doubled imagery, symmetrical composition, luxury aesthetic, adds depth and visual interest, premium product photography technique.'
    }
];

/**
 * Get photography modes by category
 */
export function getModesByCategory(category: PhotographyMode['category']): PhotographyMode[] {
    return PHOTOGRAPHY_MODES.filter(mode => mode.category === category);
}

/**
 * Get photography mode by ID
 */
export function getModeById(id: string): PhotographyMode | undefined {
    return PHOTOGRAPHY_MODES.find(mode => mode.id === id);
}

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<PhotographyMode['category'], string> = {
    commercial: 'Commercial',
    artistic: 'Artistic',
    technical: 'Technical',
    editorial: 'Editorial'
};
