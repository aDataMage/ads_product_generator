import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { STYLE_PRESETS } from "@/constants/presets";

interface StylePresetCardProps {
    value: string | null;
    onChange: (value: string) => void;
    isLoading: boolean;
    error?: string;
}

/**
 * StylePresetCard Component
 * 
 * Requirements:
 * - 4.1: Display shadcn/ui Card component containing style preset options
 * - 4.2: Use shadcn/ui RadioGroup component for preset selection
 * - 4.3: Display all 10 available style presets with clear labels
 * - 4.4: Require User to select exactly one Style Preset before generation
 * - 4.5: Disable preset selector while Generation Request is processing
 * - 13.2: Add ARIA labels for accessibility
 */
export function StylePresetCard({
    value,
    onChange,
    isLoading,
    error,
}: StylePresetCardProps) {
    const handleValueChange = (newValue: string) => {
        onChange(newValue);
    };

    return (
        <Card>
            <CardHeader>
                {/* Requirement 12.5: Adjust typography for each breakpoint */}
                <CardTitle className="text-lg sm:text-xl">Style Preset</CardTitle>
            </CardHeader>
            {/* Requirement 12.5: Adjust spacing for each breakpoint */}
            <CardContent className="space-y-3 sm:space-y-4">
                <RadioGroup
                    value={value || undefined}
                    onValueChange={handleValueChange}
                    disabled={isLoading}
                    aria-label="Style preset selection"
                    aria-describedby="style-preset-error"
                    aria-required="true"
                >
                    {/* Requirement 12.3: Maintain usability on screens as small as 375px wide */}
                    <div className="space-y-2 sm:space-y-3">
                        {STYLE_PRESETS.map((preset) => (
                            <div
                                key={preset.value}
                                className="flex items-start space-x-2 sm:space-x-3"
                            >
                                <RadioGroupItem
                                    value={preset.value}
                                    id={preset.value}
                                    disabled={isLoading}
                                    className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                    <Label
                                        htmlFor={preset.value}
                                        className={`cursor-pointer ${isLoading
                                            ? "cursor-not-allowed opacity-50"
                                            : ""
                                            }`}
                                    >
                                        {/* Requirement 12.5: Adjust typography for each breakpoint */}
                                        <div className="font-medium text-sm sm:text-base">
                                            {preset.label}
                                        </div>
                                        {preset.description && (
                                            <div className="text-xs sm:text-sm text-muted-foreground font-normal mt-0.5">
                                                {preset.description}
                                            </div>
                                        )}
                                    </Label>
                                </div>
                            </div>
                        ))}
                    </div>
                </RadioGroup>

                {error && (
                    <Alert variant="destructive" id="style-preset-error">
                        <AlertDescription aria-live="assertive" className="text-xs sm:text-sm">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
