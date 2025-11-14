import * as React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PHOTOGRAPHY_MODES, CATEGORY_NAMES, type PhotographyMode } from "@/constants/photographyModes";

interface PhotographyModeSectionProps {
    selectedMode: string | null;
    onChange: (modeId: string | null) => void;
}

/**
 * PhotographyModeSection Component
 * 
 * Allows users to select a professional photography mode that will be
 * added to their structured prompt before generation.
 */
export function PhotographyModeSection({ selectedMode, onChange }: PhotographyModeSectionProps) {
    const [selectedCategory, setSelectedCategory] = React.useState<PhotographyMode['category'] | 'all'>('all');

    const filteredModes = selectedCategory === 'all'
        ? PHOTOGRAPHY_MODES
        : PHOTOGRAPHY_MODES.filter(mode => mode.category === selectedCategory);

    const categories: Array<PhotographyMode['category'] | 'all'> = ['all', 'commercial', 'artistic', 'technical', 'editorial'];

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-base font-semibold mb-2 block">
                    Photography Mode (Optional)
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                    Select a professional photography style to enhance your structured prompt.
                    This adds industry-standard techniques and aesthetics to your generation.
                </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedCategory === category
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            }`}
                        aria-label={`Filter by ${category === 'all' ? 'all categories' : CATEGORY_NAMES[category as PhotographyMode['category']]}`}
                    >
                        {category === 'all' ? 'All' : CATEGORY_NAMES[category as PhotographyMode['category']]}
                    </button>
                ))}
            </div>

            {/* Mode Selection */}
            <RadioGroup
                value={selectedMode || undefined}
                onValueChange={(value) => onChange(value)}
                className="space-y-3"
            >
                {/* None Option */}
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem
                        value="none"
                        id="mode-none"
                        className="mt-1"
                    />
                    <div className="flex-1">
                        <Label
                            htmlFor="mode-none"
                            className="cursor-pointer font-medium"
                        >
                            No Photography Mode
                        </Label>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Use only your structured prompt without additional photography style
                        </p>
                    </div>
                </div>

                {/* Photography Modes */}
                {filteredModes.map((mode) => (
                    <div
                        key={mode.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${selectedMode === mode.id
                                ? 'bg-primary/5 border-primary'
                                : 'hover:bg-muted/50'
                            }`}
                    >
                        <RadioGroupItem
                            value={mode.id}
                            id={`mode-${mode.id}`}
                            className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Label
                                    htmlFor={`mode-${mode.id}`}
                                    className="cursor-pointer font-medium"
                                >
                                    {mode.name}
                                </Label>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {CATEGORY_NAMES[mode.category]}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {mode.description}
                            </p>
                        </div>
                    </div>
                ))}
            </RadioGroup>

            {filteredModes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                    No modes found in this category
                </p>
            )}
        </div>
    );
}
