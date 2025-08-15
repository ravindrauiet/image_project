import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Calendar, Type, ExternalLink, Upload, FileImage, Folder } from 'lucide-react';
import ImageUploadModal from './ImageUploadModal';

function ExternalRepositoryManager() {
  const { owner, repo } = useParams();
  const [repository, setRepository] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  console.log('ExternalRepositoryManager rendered with params:', { owner, repo });

  const fetchRepositoryData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching repository data for:', owner, repo);
      
      // Check if repository exists and user has access
      const response = await fetch(`/api/github/repositories/${owner}/${repo}/check`, {
        credentials: 'include'
      });
      
      console.log('Repository check response status:', response.status);
      console.log('Repository check response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Repository check response data:', data);
        setRepository(data.repository);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('Repository check failed:', errorData);
        setError(errorData.error || 'Failed to fetch repository data');
      }
    } catch (err) {
      console.error('Failed to fetch repository data:', err);
      setError('Failed to fetch repository data');
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  const handleImageUploaded = (newImage) => {
    setImages([newImage, ...images]);
  };

  useEffect(() => {
    fetchRepositoryData();
  }, [fetchRepositoryData, owner, repo]);

  const handleClose = () => {
    setShowUploadModal(false);
  };

  if (loading) {
    console.log('ExternalRepositoryManager: Loading state');
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('ExternalRepositoryManager: Error state:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Repository</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="btn-primary"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Repository Not Found</h3>
          <p className="text-gray-600 mb-6">The repository could not be loaded</p>
          <Link
            to="/dashboard"
            className="btn-primary"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  console.log('ExternalRepositoryManager: About to render main content with repository:', repository);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Debug Info */}
      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Debug:</strong> Component rendered with owner: {owner}, repo: {repo}
        </p>
        <p className="text-sm text-yellow-800">
          <strong>State:</strong> loading: {loading.toString()}, error: {error || 'none'}, repository: {repository ? 'loaded' : 'not loaded'}
        </p>
      </div>
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {repository.name}
              </h1>
              <p className="mt-2 text-gray-600">
                {repository.description || 'No description available'}
              </p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(repository.created_at).toLocaleDateString()}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  repository.private 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {repository.private ? 'Private' : 'Public'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      {/* Repository Info */}
      <div className="mb-8 bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Repository Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Full Name:</span>
                <span className="font-medium">{repository.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Default Branch:</span>
                <span className="font-medium">{repository.default_branch}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-medium">{new Date(repository.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Access</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Push Access:</span>
                <span className={`font-medium ${repository.permissions?.push ? 'text-green-600' : 'text-red-600'}`}>
                  {repository.permissions?.push ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Admin Access:</span>
                <span className={`font-medium ${repository.permissions?.admin ? 'text-green-600' : 'text-red-600'}`}>
                  {repository.permissions?.admin ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Maintain Access:</span>
                <span className={`font-medium ${repository.permissions?.maintain ? 'text-green-600' : 'text-red-600'}`}>
                  {repository.permissions?.maintain ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View on GitHub</span>
          </a>
        </div>
      </div>

      {/* Repository Contents Section */}
      <RepositoryContentsSection owner={owner} repo={repo} />

      {/* Images Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Images</h2>
          <span className="text-sm text-gray-500">{images.length} images</span>
        </div>
        
        {images.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileImage className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
            <p className="text-gray-600 mb-6">
              Upload your first image to this repository
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              Upload Image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div key={image.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  <img
                    src={image.cdn_url}
                    alt={image.original_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBMMTIwIDEyMEw4MCAxNDBWNzBMMTIwIDkwTDgwIDExMFYxMDBaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate mb-2">
                    {image.original_name}
                  </h3>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{(image.file_size / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span>{image.width} × {image.height}</span>
                    </div>
                    {image.target_folder && (
                      <div className="flex justify-between">
                        <span>Folder:</span>
                        <span className="font-medium">{image.target_folder}/</span>
                      </div>
                    )}
                    {image.watermark_applied && (
                      <div className="flex items-center space-x-2 text-primary-600">
                        <Type className="h-4 w-4" />
                        <span className="text-xs">Watermark Applied</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <a
                      href={image.cdn_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Image
                    </a>
                    <a
                      href={image.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      title="View on GitHub"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={handleClose}
        onImageUploaded={handleImageUploaded}
        repositoryId={null}
        isExternalRepository={true}
        externalRepositoryInfo={repository ? {
          owner,
          name: repo,
          full_name: repository.full_name
        } : null}
      />
    </div>
  );
}

// Repository Contents Section Component
function RepositoryContentsSection({ owner, repo }) {
  const [contents, setContents] = useState({ folders: [], files: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [pathHistory, setPathHistory] = useState([]);

  const fetchContents = useCallback(async (path = '') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching repository contents for path:', path);
      const response = await fetch(`/api/github/repositories/${owner}/${repo}/contents?path=${path}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Repository contents received:', data);
        setContents(data);
        setCurrentPath(path);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch repository contents:', errorData);
        setError(errorData.error || 'Failed to fetch repository contents');
      }
    } catch (err) {
      console.error('Error fetching repository contents:', err);
      setError('Failed to fetch repository contents');
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  const navigateToPath = useCallback((newPath) => {
    setPathHistory(prev => [...prev, currentPath]);
    fetchContents(newPath);
  }, [currentPath, fetchContents]);

  const navigateBack = useCallback(() => {
    if (pathHistory.length > 0) {
      const previousPath = pathHistory[pathHistory.length - 1];
      setPathHistory(prev => prev.slice(0, -1));
      fetchContents(previousPath);
    }
  }, [pathHistory, fetchContents]);

  const navigateToRoot = useCallback(() => {
    setPathHistory([]);
    fetchContents('');
  }, [fetchContents]);

  useEffect(() => {
    fetchContents('');
  }, [fetchContents]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Repository Contents</h2>
        <div className="flex items-center space-x-2">
          {currentPath && (
            <button
              onClick={navigateToRoot}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              Root
            </button>
          )}
          {pathHistory.length > 0 && (
            <button
              onClick={navigateBack}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
          )}
        </div>
      </div>

      {/* Current Path Display */}
      {currentPath && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Current Path:</span> {currentPath || 'Root'}
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading repository contents...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchContents(currentPath)}
            className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      ) : contents.folders.length === 0 && contents.files.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">This directory is empty</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Folders Section */}
          {contents.folders.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                <Folder className="h-4 w-4 text-blue-600" />
                <span>Folders ({contents.folders.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {contents.folders.map((folder) => (
                  <button
                    key={folder.path}
                    onClick={() => navigateToPath(folder.path)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <Folder className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{folder.name}</p>
                        <p className="text-sm text-gray-500">{folder.path}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {contents.files.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                <FileImage className="h-4 w-4 text-green-600" />
                <span>Files ({contents.files.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {contents.files.map((file) => (
                  <div
                    key={file.path}
                    className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <FileImage className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.path}</p>
                        <p className="text-xs text-gray-400">
                          {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'} • {file.extension || 'No extension'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExternalRepositoryManager;
