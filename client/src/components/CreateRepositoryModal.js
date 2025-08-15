import React, { useState } from 'react';
import { X, Folder, Lock, Globe } from 'lucide-react';

function CreateRepositoryModal({ isOpen, onClose, onRepositoryCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    private: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Repository name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        onRepositoryCreated(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create repository');
      }
    } catch (error) {
      console.error('Failed to create repository:', error);
      setError('Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Folder className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Create Repository</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Repository Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Repository name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="my-image-repository"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be created on your GitHub account
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input-field resize-none"
              placeholder="A repository for storing and managing images..."
            />
          </div>

          {/* Privacy Setting */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="private"
                checked={formData.private}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="flex items-center space-x-2">
                {formData.private ? (
                  <>
                    <Lock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Private</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Public</span>
                  </>
                )}
              </div>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              {formData.private 
                ? 'Only you can see this repository' 
                : 'Anyone can see this repository'
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Repository'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRepositoryModal;

