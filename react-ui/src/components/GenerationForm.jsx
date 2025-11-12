import { useState } from 'react';
import PresetSelector from './PresetSelector';
import FileUploader from './FileUploader';
import { generateImage } from '../services/api';
import { PRESETS } from '../constants/presets';
import './GenerationForm.css';

const GenerationForm = ({ onSuccess, onError, onLoadingChange }) => {
    // Component state
    const [userPrompt, setUserPrompt] = useState('');
    const [selectedPreset, setSelectedPreset] = useState('');
    const [referenceImage, setReferenceImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Character limit for user prompt
    const MAX_PROMPT_LENGTH = 500;

    // Handle user prompt change
    const handlePromptChange = (event) => {
        const value = event.target.value;
        if (value.length <= MAX_PROMPT_LENGTH) {
            setUserPrompt(value);
            // Clear validation error when user types
            if (validationErrors.userPrompt) {
                setValidationErrors(prev => ({ ...prev, userPrompt: null }));
            }
        }
    };

    // Handle preset selection change
    const handlePresetChange = (preset) => {
        setSelectedPreset(preset);
        // Clear validation error when user selects
        if (validationErrors.selectedPreset) {
            setValidationErrors(prev => ({ ...prev, selectedPreset: null }));
        }
    };

    // Handle image upload
    const handleImageUpload = (base64String) => {
        setReferenceImage(base64String);
    };

    // Validate form before submission
    const validateForm = () => {
        const errors = {};

        // Validate user prompt
        if (!userPrompt.trim()) {
            errors.userPrompt = 'Please enter a description for your image';
        } else if (userPrompt.trim().length < 3) {
            errors.userPrompt = 'Description must be at least 3 characters';
        }

        // Validate preset selection
        if (!selectedPreset) {
            errors.selectedPreset = 'Please select a style preset';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        // Validate form
        if (!validateForm()) {
            return;
        }

        // Set loading state
        setIsLoading(true);
        if (onLoadingChange) {
            onLoadingChange(true);
        }

        try {
            // Construct payload
            const payload = {
                user_prompt: userPrompt.trim(),
                preset_name: selectedPreset,
            };

            // Include reference image if provided
            if (referenceImage) {
                payload.reference_image_base64 = referenceImage;
            }

            // Call API
            const response = await generateImage(payload);

            // Handle response
            if (response.success) {
                onSuccess(response.final_image_url);
            } else {
                onError(response.error || 'Failed to generate image');
            }
        } catch (error) {
            onError('An unexpected error occurred. Please try again.');
            console.error('Generation error:', error);
        } finally {
            setIsLoading(false);
            if (onLoadingChange) {
                onLoadingChange(false);
            }
        }
    };

    // Check if form is valid for submission
    const isFormValid = userPrompt.trim().length >= 3 && selectedPreset;

    return (
        <form
            className="generation-form"
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            aria-label="Product image generation form"
        >
            <h2 className="form-title">Generate Product Image</h2>

            {/* User Prompt Input */}
            <div className="form-group">
                <label htmlFor="user-prompt" className="form-label">
                    Product Description
                </label>
                <textarea
                    id="user-prompt"
                    name="user-prompt"
                    className={`form-textarea ${validationErrors.userPrompt ? 'error' : ''}`}
                    value={userPrompt}
                    onChange={handlePromptChange}
                    disabled={isLoading}
                    placeholder="Describe the product you want to generate (e.g., 'a smartphone on a white background')"
                    rows={4}
                    maxLength={MAX_PROMPT_LENGTH}
                    aria-label="Product description"
                    aria-invalid={!!validationErrors.userPrompt}
                    aria-describedby={validationErrors.userPrompt ? "prompt-error character-count" : "character-count"}
                    required
                />
                <div className="form-meta">
                    <span id="character-count" className="character-counter" aria-live="polite">
                        {userPrompt.length} / {MAX_PROMPT_LENGTH}
                    </span>
                </div>
                {validationErrors.userPrompt && (
                    <div id="prompt-error" className="validation-error" role="alert" aria-live="assertive">
                        {validationErrors.userPrompt}
                    </div>
                )}
            </div>

            {/* Preset Selector */}
            <div className="form-group">
                <PresetSelector
                    presets={PRESETS}
                    selectedPreset={selectedPreset}
                    onChange={handlePresetChange}
                    disabled={isLoading}
                />
                {validationErrors.selectedPreset && (
                    <div id="preset-error" className="validation-error" role="alert" aria-live="assertive">
                        {validationErrors.selectedPreset}
                    </div>
                )}
            </div>

            {/* File Uploader */}
            <div className="form-group">
                <FileUploader
                    onImageUpload={handleImageUpload}
                    disabled={isLoading}
                />
            </div>

            {/* Generate Button */}
            <div className="form-actions">
                <button
                    type="submit"
                    className="generate-button"
                    disabled={isLoading || !isFormValid}
                    aria-label={isLoading ? "Generating image, please wait" : "Generate product image"}
                    aria-busy={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner" role="status" aria-hidden="true"></span>
                            Generating...
                        </>
                    ) : (
                        'Generate Image'
                    )}
                </button>
            </div>
        </form>
    );
};

export default GenerationForm;
