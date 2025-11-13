import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ReferenceImageCardProps {
    value: string | null; // base64 encoded image
    onChange: (value: string | null) => void;
    isLoading: boolean;
    error?: string;
}

// Allowed file types
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const ALLOWED_EXTENSIONS = [".png", ".jpeg", ".jpg"];

/**
 * ReferenceImageCard Component
 * 
 * Requirements:
 * - 5.1: Display shadcn/ui Card component containing a file upload dropzone
 * - 5.2: Accept PNG, JPEG, and JPG file formats
 * - 5.3: Display preview thumbnail when User uploads a file
 * - 5.4: Allow User to remove an uploaded Reference Image
 * - 5.5: Disable dropzone while Generation Request is processing
 * - 13.2: Add ARIA labels and file input descriptions
 */
export function ReferenceImageCard({
    value,
    onChange,
    isLoading,
    error,
}: ReferenceImageCardProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const [fileName, setFileName] = React.useState<string>("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Validate file type
    const isValidFileType = (file: File): boolean => {
        return ALLOWED_FILE_TYPES.includes(file.type) ||
            ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
    };

    // Convert file to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the data URL prefix to get just the base64 string
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Handle file selection
    const handleFileSelect = async (file: File) => {
        if (!isValidFileType(file)) {
            onChange(null);
            return;
        }

        try {
            const base64 = await fileToBase64(file);
            setFileName(file.name);
            onChange(base64);
        } catch (error) {
            console.error("Error encoding file:", error);
            onChange(null);
        }
    };

    // Handle drag events
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (isLoading) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    // Handle click to browse
    const handleBrowseClick = () => {
        if (!isLoading && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle remove image
    const handleRemove = () => {
        onChange(null);
        setFileName("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Card>
            <CardHeader>
                {/* Requirement 12.5: Adjust typography for each breakpoint */}
                <CardTitle className="text-lg sm:text-xl">Reference Image (Optional)</CardTitle>
            </CardHeader>
            {/* Requirement 12.5: Adjust spacing for each breakpoint */}
            <CardContent className="space-y-3 sm:space-y-4">
                {!value ? (
                    // Empty state - dropzone
                    // Requirement 12.3: Maintain usability on screens as small as 375px wide
                    // Requirement 12.5: Adjust spacing and typography for each breakpoint
                    <div
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleBrowseClick}
                        className={`
                            border-2 border-dashed rounded-lg p-6 sm:p-8
                            flex flex-col items-center justify-center
                            transition-colors cursor-pointer
                            ${isDragging
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-primary/50"
                            }
                            ${isLoading
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
                        `}
                        role="button"
                        tabIndex={isLoading ? -1 : 0}
                        aria-label="Upload reference image. Drag and drop or press Enter to browse"
                        aria-describedby="dropzone-description reference-image-error"
                        aria-disabled={isLoading}
                        onKeyDown={(e) => {
                            if ((e.key === "Enter" || e.key === " ") && !isLoading) {
                                e.preventDefault();
                                handleBrowseClick();
                            }
                        }}
                        onFocus={(e) => {
                            // Enhance focus visibility for dropzone
                            e.currentTarget.classList.add('ring-2', 'ring-ring', 'ring-offset-2');
                        }}
                        onBlur={(e) => {
                            e.currentTarget.classList.remove('ring-2', 'ring-ring', 'ring-offset-2');
                        }}
                    >
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-3 sm:mb-4" />
                        <p className="text-xs sm:text-sm font-medium text-center mb-2">
                            Drag and drop your image here
                        </p>
                        <p className="text-xs text-muted-foreground text-center mb-3 sm:mb-4">
                            or click to browse
                        </p>
                        <p
                            id="dropzone-description"
                            className="text-xs text-muted-foreground text-center"
                        >
                            Supports PNG, JPEG, JPG
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".png,.jpeg,.jpg,image/png,image/jpeg"
                            onChange={handleFileInputChange}
                            className="hidden"
                            disabled={isLoading}
                            aria-label="File input for reference image"
                        />
                    </div>
                ) : (
                    // Preview state
                    // Requirement 12.5: Adjust spacing for each breakpoint
                    <div className="space-y-3 sm:space-y-4">
                        <div className="relative rounded-lg border border-border overflow-hidden bg-muted">
                            {/* Requirement 12.3: Maintain usability on screens as small as 375px wide */}
                            <img
                                src={`data:image/jpeg;base64,${value}`}
                                alt="Reference image preview"
                                className="w-full h-40 sm:h-48 object-contain"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground min-w-0 flex-1">
                                <ImageIcon className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                    {fileName || "Uploaded image"}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRemove}
                                disabled={isLoading}
                                aria-label="Remove reference image"
                                className="flex-shrink-0"
                            >
                                <X className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Remove</span>
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive" id="reference-image-error">
                        <AlertDescription aria-live="assertive" className="text-xs sm:text-sm">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
