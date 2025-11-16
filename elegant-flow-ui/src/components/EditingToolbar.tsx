/**
 * EditingToolbar Component
 * 
 * Provides a toolbar/menu for accessing image editing tools:
 * - Background editing (remove, replace, blur)
 * - Generative fill
 * - Enhancement (quality, upscale)
 * - Canvas expansion
 * 
 * Requirements: Task 6.1 - Enhance ResultsPanel with editing toolbar
 */

import { useState } from "react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Eraser,
    Palette,
    Focus,
    Sparkles,
    Wand2,
    Maximize2,
    Expand,
    ChevronDown,
} from "lucide-react";

export type EditingTool =
    | 'background-remove'
    | 'background-replace'
    | 'background-blur'
    | 'generative-fill'
    | 'enhance'
    | 'upscale'
    | 'expand'
    | null;

interface EditingToolbarProps {
    /** Callback when a tool is selected */
    onToolSelect: (tool: EditingTool) => void;
    /** Currently selected tool */
    selectedTool: EditingTool;
    /** Whether editing operations are disabled */
    disabled?: boolean;
}

/**
 * EditingToolbar component
 * 
 * Displays a horizontal toolbar with dropdown menus for editing tools
 */
export function EditingToolbar({
    onToolSelect,
    selectedTool,
    disabled = false,
}: EditingToolbarProps) {
    const [backgroundMenuOpen, setBackgroundMenuOpen] = useState(false);
    const [enhanceMenuOpen, setEnhanceMenuOpen] = useState(false);

    // Check if a background tool is selected
    const isBackgroundToolSelected = selectedTool?.startsWith('background-');

    // Check if an enhance tool is selected
    const isEnhanceToolSelected = selectedTool === 'enhance' || selectedTool === 'upscale';

    return (
        <TooltipProvider>
            <div
                className="flex flex-wrap items-center gap-2 p-2 sm:p-3 bg-muted/50 rounded-lg border border-border transition-smooth"
                role="toolbar"
                aria-label="Image editing tools"
            >
                {/* Background Dropdown */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenu open={backgroundMenuOpen} onOpenChange={setBackgroundMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant={isBackgroundToolSelected ? "default" : "outline"}
                                    size="sm"
                                    disabled={disabled}
                                    className="gap-2 transition-smooth"
                                    aria-label="Background editing tools"
                                    aria-haspopup="menu"
                                    aria-expanded={backgroundMenuOpen}
                                >
                                    <Palette className="h-4 w-4" aria-hidden="true" />
                                    Background
                                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" role="menu">
                                <DropdownMenuItem
                                    onClick={() => {
                                        onToolSelect('background-remove');
                                        setBackgroundMenuOpen(false);
                                    }}
                                    role="menuitem"
                                    className="gap-2 cursor-pointer"
                                >
                                    <Eraser className="h-4 w-4" aria-hidden="true" />
                                    Remove Background
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        onToolSelect('background-replace');
                                        setBackgroundMenuOpen(false);
                                    }}
                                    role="menuitem"
                                    className="gap-2 cursor-pointer"
                                >
                                    <Palette className="h-4 w-4" aria-hidden="true" />
                                    Replace Background
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        onToolSelect('background-blur');
                                        setBackgroundMenuOpen(false);
                                    }}
                                    role="menuitem"
                                    className="gap-2 cursor-pointer"
                                >
                                    <Focus className="h-4 w-4" aria-hidden="true" />
                                    Blur Background
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Remove, replace, or blur image backgrounds</p>
                    </TooltipContent>
                </Tooltip>

                {/* Generative Fill Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={selectedTool === 'generative-fill' ? "default" : "outline"}
                            size="sm"
                            disabled={disabled}
                            onClick={() => onToolSelect('generative-fill')}
                            className="gap-2 transition-smooth"
                            aria-label="Generative fill tool"
                            aria-pressed={selectedTool === 'generative-fill'}
                        >
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            Generative Fill
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add or modify content in specific areas using AI</p>
                    </TooltipContent>
                </Tooltip>

                {/* Enhance Dropdown */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenu open={enhanceMenuOpen} onOpenChange={setEnhanceMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant={isEnhanceToolSelected ? "default" : "outline"}
                                    size="sm"
                                    disabled={disabled}
                                    className="gap-2 transition-smooth"
                                    aria-label="Enhancement tools"
                                    aria-haspopup="menu"
                                    aria-expanded={enhanceMenuOpen}
                                >
                                    <Wand2 className="h-4 w-4" aria-hidden="true" />
                                    Enhance
                                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" role="menu">
                                <DropdownMenuItem
                                    onClick={() => {
                                        onToolSelect('enhance');
                                        setEnhanceMenuOpen(false);
                                    }}
                                    role="menuitem"
                                    className="gap-2 cursor-pointer"
                                >
                                    <Wand2 className="h-4 w-4" aria-hidden="true" />
                                    Enhance Quality
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        onToolSelect('upscale');
                                        setEnhanceMenuOpen(false);
                                    }}
                                    role="menuitem"
                                    className="gap-2 cursor-pointer"
                                >
                                    <Maximize2 className="h-4 w-4" aria-hidden="true" />
                                    Upscale Resolution
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Improve quality or increase resolution</p>
                    </TooltipContent>
                </Tooltip>

                {/* Expand Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={selectedTool === 'expand' ? "default" : "outline"}
                            size="sm"
                            disabled={disabled}
                            onClick={() => onToolSelect('expand')}
                            className="gap-2 transition-smooth"
                            aria-label="Canvas expansion tool"
                            aria-pressed={selectedTool === 'expand'}
                        >
                            <Expand className="h-4 w-4" aria-hidden="true" />
                            Expand
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Expand canvas to different aspect ratios</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}

export default EditingToolbar;
