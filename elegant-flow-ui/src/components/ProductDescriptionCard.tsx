import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

interface ProductDescriptionCardProps {
    value: string;
    onChange: (value: string) => void;
    isLoading: boolean;
    error?: string;
}

// Validation constants exported for use by parent components
export const MIN_CHARACTERS = 3;
export const MAX_CHARACTERS = 500;

/**
 * ProductDescriptionCard Component
 * 
 * Requirements:
 * - 3.1: Display shadcn/ui Card component containing a Textarea for product description
 * - 3.2: Accept text input up to 500 characters
 * - 3.3: Display character counter showing current and maximum length
 * - 3.4: Display validation error when fewer than 3 characters
 * - 3.5: Disable Textarea while Generation Request is processing
 * - 13.2: Provide ARIA labels for all interactive elements
 * - 13.4: Announce state changes to screen readers using ARIA live regions
 */
export function ProductDescriptionCard({
    value,
    onChange,
    isLoading,
    error,
}: ProductDescriptionCardProps) {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    const characterCount = value.length;

    return (
        <Card>
            <CardHeader>
                {/* Requirement 12.5: Adjust typography for each breakpoint */}
                <CardTitle className="text-lg sm:text-xl">Product Description</CardTitle>
            </CardHeader>
            {/* Requirement 12.5: Adjust spacing for each breakpoint */}
            <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                    {/* Requirement 13.1: Semantic HTML - using label element */}
                    <Label htmlFor="product-description" className="sr-only">
                        Product description (required)
                    </Label>
                    {/* Requirement 12.3: Maintain usability on screens as small as 375px wide */}
                    {/* Requirement 13.2: ARIA labels for all interactive elements */}
                    <Textarea
                        id="product-description"
                        value={value}
                        onChange={handleChange}
                        disabled={isLoading}
                        maxLength={MAX_CHARACTERS}
                        placeholder="Describe your product (e.g., 'a smartphone on a white background')..."
                        aria-describedby="char-count product-description-error"
                        aria-invalid={!!error}
                        aria-required="true"
                        className="min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base"
                    />
                    {/* Requirement 13.4: ARIA live regions for dynamic content */}
                    <div
                        id="char-count"
                        className="text-xs sm:text-sm text-muted-foreground text-right"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        <span className="sr-only">Character count: </span>
                        {characterCount} / {MAX_CHARACTERS}
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" id="product-description-error">
                        <AlertDescription aria-live="assertive" className="text-xs sm:text-sm">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
