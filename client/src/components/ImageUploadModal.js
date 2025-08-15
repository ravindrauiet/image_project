import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, Upload, Image, FileImage, AlertCircle } from 'lucide-react';

function ImageUploadModal({ isOpen, onClose, repositoryId, onImageUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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

      const response = await axios.post(
        `/api/repositories/${repositoryId}/images`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      onImageUploaded(response.data);
      handleClose();
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
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

