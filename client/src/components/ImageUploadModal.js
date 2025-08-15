import React, { useState, useRef } from 'react';
import { X, Upload, Type, AlertCircle, FileImage } from 'lucide-react';

function ImageUploadModal({ isOpen, onClose, repositoryId, onImageUploaded, isExternalRepository = false, externalRepositoryInfo = null }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showWatermarkOptions, setShowWatermarkOptions] = useState(false);
  const [watermarkOptions, setWatermarkOptions] = useState({
    text: '',
    color: '#FFFFFF',
    size: 24,
    opacity: 0.8,
    position: 'bottom-right',
    margin: 20
  });
  const fileInputRef = useRef(null);

  // Function to get contrasting text color for background
  const getContrastColor = (hexColor) => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleWatermarkOptionChange = (key, value) => {
    setWatermarkOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', selectedFile);
      
      // Add watermark options if watermark text is provided
      if (watermarkOptions.text.trim()) {
        formData.append('watermark_text', watermarkOptions.text);
        formData.append('watermark_color', watermarkOptions.color);
        formData.append('watermark_size', watermarkOptions.size);
        formData.append('watermark_opacity', watermarkOptions.opacity);
        formData.append('watermark_position', watermarkOptions.position);
        formData.append('watermark_margin', watermarkOptions.margin);
      }

      // Use different endpoint for external repositories
      const endpoint = isExternalRepository && externalRepositoryInfo
        ? `/api/github/repositories/${externalRepositoryInfo.owner}/${externalRepositoryInfo.name}/images`
        : `/api/repositories/${repositoryId}/images`;

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        onImageUploaded(data);
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setWatermarkOptions({
      text: '',
      color: '#FFFFFF',
      size: 24,
      opacity: 0.8,
      position: 'bottom-right',
      margin: 20
    });
    setShowWatermarkOptions(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Image</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image *
            </label>
            
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer ${
                selectedFile 
                  ? 'border-primary-300 bg-primary-50' 
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50 hover:shadow-md'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => {
                console.log('Upload area clicked, fileInputRef:', fileInputRef.current);
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                } else {
                  console.error('fileInputRef is not available');
                }
              }}
              title="Click to select an image file"
            >
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto max-h-32 rounded-lg shadow-sm"
                  />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                      fileInputRef.current.value = '';
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-primary-600 hover:text-primary-700 transition-colors">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* File Info */}
          {selectedFile && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-gray-900">File Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Name:</span> {selectedFile.name}</p>
                <p><span className="font-medium">Size:</span> {(selectedFile.size / 1024).toFixed(1)} KB</p>
                <p><span className="font-medium">Type:</span> {selectedFile.type}</p>
              </div>
            </div>
          )}

          {/* Watermark Options */}
          {selectedFile && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Type className="h-4 w-4 text-primary-600" />
                  <span>Watermark Options</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowWatermarkOptions(!showWatermarkOptions)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    showWatermarkOptions 
                      ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {showWatermarkOptions ? 'Hide' : 'Show'} Options
                </button>
              </div>
              
              {showWatermarkOptions && (
                <div className="space-y-4">
                  {/* Watermark Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      value={watermarkOptions.text}
                      onChange={(e) => handleWatermarkOptionChange('text', e.target.value)}
                      placeholder="Enter watermark text..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Watermark Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={watermarkOptions.color}
                        onChange={(e) => handleWatermarkOptionChange('color', e.target.value)}
                        className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <div className="flex-1">
                        <div 
                          className="h-8 rounded border border-gray-300 flex items-center justify-center text-sm font-medium"
                          style={{ 
                            backgroundColor: watermarkOptions.color,
                            color: getContrastColor(watermarkOptions.color)
                          }}
                        >
                          {watermarkOptions.text || 'Preview'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Watermark Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Size: {watermarkOptions.size}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={watermarkOptions.size}
                      onChange={(e) => handleWatermarkOptionChange('size', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Watermark Opacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opacity: {Math.round(watermarkOptions.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={watermarkOptions.opacity}
                      onChange={(e) => handleWatermarkOptionChange('opacity', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Watermark Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <select
                      value={watermarkOptions.position}
                      onChange={(e) => handleWatermarkOptionChange('position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="center">Center</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                  </div>
                  
                  {/* Watermark Margin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Margin: {watermarkOptions.margin}px
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={watermarkOptions.margin}
                      onChange={(e) => handleWatermarkOptionChange('margin', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              
              {/* Watermark Preview */}
              {watermarkOptions.text.trim() && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Watermark Preview:</h5>
                  <div className="relative bg-white rounded border border-gray-300 p-4 h-24 flex items-center justify-center">
                    <div 
                      className="text-center font-medium"
                      style={{
                        color: watermarkOptions.color,
                        fontSize: `${Math.min(watermarkOptions.size, 48)}px`,
                        opacity: watermarkOptions.opacity,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      {watermarkOptions.text}
                    </div>
                    <div className="absolute top-1 right-1 text-xs text-gray-500">
                      {watermarkOptions.position}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                'Upload Image'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ImageUploadModal;

