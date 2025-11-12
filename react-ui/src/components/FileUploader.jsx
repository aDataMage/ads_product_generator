import { useState } from 'react';
import './FileUploader.css';

const FileUploader = ({ onImageUpload, disabled }) => {
    const [fileName, setFileName] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);
    const [error, setError] = useState(null);

    const validateFileType = (file) => {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        return validTypes.includes(file.type);
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        // Validate file type
        if (!validateFileType(file)) {
            setError('Please select a valid image file (PNG, JPEG, or JPG)');
            setFileName(null);
            setPreviewURL(null);
            // Announce error to screen readers
            const errorAnnouncement = document.getElementById('file-uploader-error');
            if (errorAnnouncement) {
                errorAnnouncement.setAttribute('aria-live', 'assertive');
            }
            return;
        }

        setError(null);
        setFileName(file.name);

        try {
            // Create preview URL
            const preview = URL.createObjectURL(file);
            setPreviewURL(preview);

            // Convert to base64 and notify parent
            const base64String = await convertToBase64(file);
            onImageUpload(base64String);
        } catch (err) {
            setError('Failed to process image. Please try again.');
            setFileName(null);
            setPreviewURL(null);
            console.error('Error processing image:', err);
        }
    };

    const handleClear = () => {
        setFileName(null);
        setPreviewURL(null);
        setError(null);

        // Revoke the preview URL to free memory
        if (previewURL) {
            URL.revokeObjectURL(previewURL);
        }

        // Clear the file input
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.value = '';
        }

        // Notify parent that image was cleared
        onImageUpload(null);
    };

    return (
        <div className="file-uploader">
            <label htmlFor="file-input" className="file-uploader-label">
                Reference Image (Optional)
            </label>

            <div className="file-uploader-content">
                {!fileName ? (
                    <div className="file-input-wrapper">
                        <input
                            id="file-input"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleFileSelect}
                            disabled={disabled}
                            className="file-input"
                            aria-label="Upload reference image file"
                            aria-describedby="file-input-hint"
                        />
                        <label
                            htmlFor="file-input"
                            className={`file-input-button ${disabled ? 'disabled' : ''}`}
                            tabIndex={disabled ? -1 : 0}
                            role="button"
                            aria-disabled={disabled}
                        >
                            Choose Image
                        </label>
                        <span id="file-input-hint" className="file-input-hint">
                            PNG, JPEG, or JPG
                        </span>
                    </div>
                ) : (
                    <div className="file-preview" role="region" aria-label="Image preview">
                        {previewURL && (
                            <img
                                src={previewURL}
                                alt={`Preview of uploaded reference image: ${fileName}`}
                                className="preview-thumbnail"
                            />
                        )}
                        <div className="file-info">
                            <span className="file-name" aria-label={`Selected file: ${fileName}`}>
                                {fileName}
                            </span>
                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={disabled}
                                className="clear-button"
                                aria-label={`Remove uploaded image ${fileName}`}
                                tabIndex={disabled ? -1 : 0}
                            >
                                ✕ Remove
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div
                    id="file-uploader-error"
                    className="file-uploader-error"
                    role="alert"
                    aria-live="assertive"
                >
                    {error}
                </div>
            )}
        </div>
    );
};

export default FileUploader;
