/**
 * Style Preset Constants
 * Requirement 4.3: Display all 10 available style presets with clear labels
 * 
 * These presets correspond to the JSON preset files in the /presets directory
 * and are used for the RadioGroup selection in the StylePresetCard component.
 */

import type { StylePreset } from '../lib/types';

/**
 * Array of all available style presets
 * Each preset includes:
 * - value: The filename of the preset JSON file
 * - label: Human-readable display name
 * - description: Optional description of the preset style
 */
export const STYLE_PRESETS: StylePreset[] = [
    {
        value: 'preset_bright_clean.json',
        label: 'Bright Clean',
        description: 'Clean white background with bright, even studio lighting'
    },
    {
        value: 'preset_luxury_reflection.json',
        label: 'Luxury Reflection',
        description: 'Premium photography with elegant reflective surface'
    },
    {
        value: 'preset_minimalist_shadow.json',
        label: 'Minimalist Shadow',
        description: 'Minimalist photography with artistic shadow play'
    },
    {
        value: 'preset_natural_warm.json',
        label: 'Natural Warm',
        description: 'Natural, warm lighting with organic feel'
    },
    {
        value: 'preset_vibrant_pop.json',
        label: 'Vibrant Pop',
        description: 'Vibrant, colorful backgrounds with bold energy'
    },
    {
        value: 'preset_detail_macro.json',
        label: 'Detail Macro',
        description: 'Close-up detail shots emphasizing texture and craftsmanship'
    },
    {
        value: 'preset_editorial_dark.json',
        label: 'Editorial Dark',
        description: 'Dark, moody editorial style with dramatic lighting'
    },
    {
        value: 'preset_flat_lay.json',
        label: 'Flat Lay',
        description: 'Overhead flat lay composition with organized arrangement'
    },
    {
        value: 'preset_hero_shot.json',
        label: 'Hero Shot',
        description: 'Dramatic hero product shots with cinematic appeal'
    },
    {
        value: 'preset_lifestyle_context.json',
        label: 'Lifestyle Context',
        description: 'Product in lifestyle context with natural environment'
    }
];

/**
 * Default preset value
 * Can be used to set an initial selection
 */
export const DEFAULT_PRESET = STYLE_PRESETS[0].value;
