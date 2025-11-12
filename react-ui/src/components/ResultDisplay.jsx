import { useEffect, useRef } from 'react';
import './ResultDisplay.css';

const ResultDisplay = ({ imageURL, errorMessage, isLoading }) => {
    const downloadButtonRef = useRef(null);
    const previousLoadingRef = useRef(isLoading);

    // Focus management: focus on download button when image loads
    useEffect(() => {
        if (previousLoadingRef.current && !isLoading && imageURL && downloadButtonRef.current) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                downloadButtonRef.current?.focus();
            }, 100);
        }
        previousLoadingRef.current = isLoading;
    }, [isLoading, imageURL]);

    const handleDownload = () => {
        if (!imageURL) return;

        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = imageURL;

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `generated-image-${timestamp}.jpg`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Idle state - no content displayed
    if (!isLoading && !imageURL && !errorMessage) {
        return (
            <div className="result-display" role="region" aria-label="Image generation results">
                <div className="result-idle">
                    <div className="idle-icon" aria-hidden="true">🖼️</div>
                    <p className="idle-text">Your generated image will appear here</p>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="result-display" role="region" aria-label="Image generation results" aria-busy="true">
                <div className="result-loading">
                    <div className="loading-spinner" role="status" aria-label="Loading"></div>
                    <p className="loading-text" aria-live="polite">Generating your image...</p>
                    <p className="loading-subtext">This may take up to 2 minutes</p>
                </div>
            </div>
        );
    }

    // Error state
    if (errorMessage) {
        return (
            <div className="result-display" role="region" aria-label="Image generation results">
                <div className="result-error">
                    <div className="error-icon" aria-hidden="true">⚠️</div>
                    <h3 className="error-title">Generation Failed</h3>
                    <p className="error-message" role="alert" aria-live="assertive">
                        {errorMessage}
                    </p>
                    <p className="error-hint">Please try again or modify your inputs</p>
                </div>
            </div>
        );
    }

    // Success state - display generated image
    if (imageURL) {
        return (
            <div className="result-display" role="region" aria-label="Image generation results">
                <div className="result-success">
                    <div className="image-container">
                        <img
                            src={imageURL}
                            alt="AI-generated product image based on your prompt and selected style preset"
                            className="generated-image"
                        />
                    </div>
                    <button
                        ref={downloadButtonRef}
                        onClick={handleDownload}
                        className="download-button"
                        aria-label="Download generated product image"
                        type="button"
                    >
                        <span className="download-icon" aria-hidden="true">⬇️</span>
                        Download Image
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default ResultDisplay;
