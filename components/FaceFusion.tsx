/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';

interface FaceFusionProps {
  onImageUpload: (base64: string) => void;
  onImageClear: () => void;
  imagePreviewUrl: string | null;
  isAnalyzing: boolean;
}

export const FaceFusion: React.FC<FaceFusionProps> = ({ onImageUpload, onImageClear, imagePreviewUrl, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic client-side validation for file size (e.g., 4MB)
      if (file.size > 4 * 1024 * 1024) {
          alert("Please upload an image smaller than 4MB.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
      onImageClear();
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  return (
    <div className="face-fusion-container">
      <label htmlFor="face-fusion-upload" className="setting-label">User-as-Hero (Face Fusion)</label>
      <p className="subtitle-small">Upload an image to base a character on your likeness.</p>
      <input
        id="face-fusion-upload"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      
      {!imagePreviewUrl ? (
         <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing}>Upload Image</button>
      ) : (
        <div className="image-preview-container">
            <img src={imagePreviewUrl} alt="User upload preview" className="image-preview" />
            <button type="button" className="remove-char-btn" onClick={handleClear} aria-label="Remove image">&times;</button>
        </div>
      )}

      {isAnalyzing && (
        <div className="analyzing-indicator">
            <p>Analyzing image</p>
            <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
        </div>
      )}
    </div>
  );
};
