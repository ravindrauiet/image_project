import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Image as ImageIcon, Calendar, Type, ExternalLink, Upload, FileImage } from 'lucide-react';
import ImageUploadModal from './ImageUploadModal';

function RepositoryDetail() {
  const { repoId } = useParams();
  const [repository, setRepository] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchRepositoryData = useCallback(async () => {
    try {
      setLoading(true);
      const [repoResponse, imagesResponse] = await Promise.all([
        fetch(`/api/repositories/${repoId}`, { credentials: 'include' }),
        fetch(`/api/repositories/${repoId}/images`, { credentials: 'include' })
      ]);

      if (repoResponse.ok && imagesResponse.ok) {
        const repoData = await repoResponse.json();
        const imagesData = await imagesResponse.json();
        setRepository(repoData);
        setImages(imagesData);
        setError(null);
      } else {
        setError('Failed to load repository data');
      }
    } catch (error) {
      console.error('Failed to fetch repository data:', error);
      setError('Failed to load repository data');
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    fetchRepositoryData();
  }, [fetchRepositoryData]);

  const handleImageUploaded = (newImage) => {
    setImages([newImage, ...images]);
    setShowUploadModal(false);
  };

  const handleImageDeleted = (imageId) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Repository Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The repository could not be loaded'}</p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link to="/dashboard" className="text-gray-500 hover:text-primary-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{repository.name}</h1>
            <p className="text-gray-600">{repository.description || 'No description'}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              repository.private 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {repository.private ? 'Private' : 'Public'}
            </span>
            <span>Created {new Date(repository.created_at).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on GitHub</span>
            </a>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Image</span>
            </button>
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Images ({images.length})</h2>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileImage className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
            <p className="text-gray-600 mb-6">
              Upload your first image to get started
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              Upload Image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => (
              <ImageCard 
                key={image.id} 
                image={image} 
                repositoryId={repoId}
                onDeleted={handleImageDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        repositoryId={repoId}
        onImageUploaded={handleImageUploaded}
      />
    </div>
  );
}

function ImageCard({ image, repositoryId, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/repositories/${repositoryId}/images/${image.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        onDeleted(image.id);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card group hover:shadow-md transition-shadow duration-200">
      {/* Image Preview */}
      <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
        {image.github_url ? (
          <img
            src={image.github_url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')}
            alt={image.original_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="hidden w-full h-full items-center justify-center text-gray-400">
          <ImageIcon className="h-12 w-12" />
        </div>
      </div>

      {/* Image Info */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 truncate" title={image.original_name}>
          {image.original_name}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{image.width} × {image.height}</span>
          <span>{(image.file_size / 1024).toFixed(1)} KB</span>
        </div>
        
        {image.target_folder && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Folder:</span>
            <span className="font-medium">{image.target_folder}/</span>
          </div>
        )}
        
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{new Date(image.created_at).toLocaleDateString()}</span>
        </div>
        
                                {/* CDN URL Display */}
                         {image.cdn_url && (
                           <div className="mt-2 p-2 bg-gray-50 rounded border">
                             <p className="text-xs text-gray-600 mb-1">CDN URL:</p>
                             <div className="flex items-center space-x-2">
                               <input
                                 type="text"
                                 value={image.cdn_url}
                                 readOnly
                                 className="text-xs bg-white border rounded px-2 py-1 flex-1"
                               />
                               <button
                                 onClick={() => navigator.clipboard.writeText(image.cdn_url)}
                                 className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                 title="Copy CDN URL"
                               >
                                 Copy
                               </button>
                             </div>
                           </div>
                         )}

                         {/* Watermark Information */}
                         {image.watermark_applied && (
                           <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                             <div className="flex items-center space-x-2">
                               <Type className="h-3 w-3 text-blue-600" />
                               <span className="text-xs text-blue-800 font-medium">
                                 Watermark Applied During Upload
                               </span>
                             </div>
                             {image.watermark_text && (
                               <p className="text-xs text-blue-700 mt-1">
                                 Text: "{image.watermark_text}"
                               </p>
                             )}
                           </div>
                         )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <a
          href={image.github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          title="View on GitHub"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
          title="Delete image"
        >
          {deleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default RepositoryDetail;

