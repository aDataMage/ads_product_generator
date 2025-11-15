/**
 * Slider Component
 * 
 * A basic slider component for range inputs
 * Based on shadcn/ui patterns
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    onValueChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, onValueChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onValueChange) {
                onValueChange(Number(e.target.value));
            }
            if (props.onChange) {
                props.onChange(e);
            }
        };

        return (
            <input
                type="range"
                className={cn(
                    "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "[&::-webkit-slider-thumb]:appearance-none",
                    "[&::-webkit-slider-thumb]:w-4",
                    "[&::-webkit-slider-thumb]:h-4",
                    "[&::-webkit-slider-thumb]:rounded-full",
                    "[&::-webkit-slider-thumb]:bg-primary",
                    "[&::-webkit-slider-thumb]:cursor-pointer",
                    "[&::-webkit-slider-thumb]:transition-all",
                    "[&::-webkit-slider-thumb]:hover:scale-110",
                    "[&::-moz-range-thumb]:w-4",
                    "[&::-moz-range-thumb]:h-4",
                    "[&::-moz-range-thumb]:rounded-full",
                    "[&::-moz-range-thumb]:bg-primary",
                    "[&::-moz-range-thumb]:border-0",
                    "[&::-moz-range-thumb]:cursor-pointer",
                    "[&::-moz-range-thumb]:transition-all",
                    "[&::-moz-range-thumb]:hover:scale-110",
                    className
                )}
                ref={ref}
                onChange={handleChange}
                {...props}
            />
        );
    }
);
Slider.displayName = "Slider";

export { Slider };
