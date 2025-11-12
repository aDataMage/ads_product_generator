import React from 'react';
import '../styles/PresetSelector.css';

const PresetSelector = ({ presets, selectedPreset, onChange, disabled }) => {
    return (
        <div className="preset-selector" role="group" aria-labelledby="preset-selector-label">
            <label id="preset-selector-label" className="preset-selector-label">
                Style Preset
            </label>
            <div className="preset-button-group" role="radiogroup" aria-labelledby="preset-selector-label">
                {presets.map((preset) => (
                    <button
                        key={preset.value}
                        type="button"
                        role="radio"
                        aria-checked={selectedPreset === preset.value}
                        className={`preset-button ${selectedPreset === preset.value ? 'selected' : ''}`}
                        onClick={() => onChange(preset.value)}
                        disabled={disabled}
                        aria-label={`Select ${preset.label} style preset`}
                        tabIndex={disabled ? -1 : 0}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PresetSelector;
