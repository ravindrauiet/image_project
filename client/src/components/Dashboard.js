import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Folder, Image as ImageIcon, ExternalLink, Calendar } from 'lucide-react';
import CreateRepositoryModal from './CreateRepositoryModal';

function Dashboard() {
  const [repositories, setRepositories] = useState([]);
  const [allGithubRepos, setAllGithubRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('app'); // 'app' or 'github'

  useEffect(() => {
    fetchRepositories();
    fetchAllGithubRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const response = await fetch('/api/repositories', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched app repositories:', data);
        setRepositories(data);
        setError(null);
      } else {
        console.error('Failed to fetch repositories:', response.status, response.statusText);
        setError(`Failed to load repositories: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      setError('Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllGithubRepositories = async () => {
    try {
      const response = await fetch('/api/github/repositories', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched all GitHub repositories:', data);
        setAllGithubRepos(data);
      } else {
        console.error('Failed to fetch GitHub repositories:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch GitHub repositories:', error);
    }
  };

  const handleRepositoryCreated = (newRepo) => {
    setRepositories([newRepo, ...repositories]);
    setShowCreateModal(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Repositories</h1>
            <p className="mt-2 text-gray-600">
              Manage your GitHub repositories and images
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Repository</span>
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('app')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'app'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            App Repositories ({repositories.length})
          </button>
          <button
            onClick={() => setViewMode('github')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'github'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All GitHub Repositories ({allGithubRepos.length})
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Repositories Grid */}
      {viewMode === 'app' ? (
        // App Repositories View
        repositories.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Folder className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first repository to start managing images
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Repository
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repo) => (
              <RepositoryCard key={repo.id} repository={repo} />
            ))}
          </div>
        )
      ) : (
        // All GitHub Repositories View
        allGithubRepos.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Folder className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
            <p className="text-gray-600 mb-6">
              Loading your GitHub repositories...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allGithubRepos.map((repo) => (
              <GitHubRepositoryCard key={repo.id} repository={repo} />
            ))}
          </div>
        )
      )}

      {/* Create Repository Modal */}
      <CreateRepositoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRepositoryCreated={handleRepositoryCreated}
      />
    </div>
  );
}

function RepositoryCard({ repository }) {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Folder className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{repository.name}</h3>
            <p className="text-sm text-gray-500">{repository.full_name}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          repository.private 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {repository.private ? 'Private' : 'Public'}
        </span>
      </div>

      {repository.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {repository.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(repository.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          to={`/repository/${repository.id}`}
          className="btn-primary text-sm py-2 px-3"
        >
          <ImageIcon className="h-4 w-4 mr-1" />
          Manage Images
        </Link>
        
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          title="View on GitHub"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function GitHubRepositoryCard({ repository }) {
  const [isAddingToApp, setIsAddingToApp] = useState(false);

  const handleAddToApp = async () => {
    if (!window.confirm(`Add "${repository.full_name}" to your app for image management?`)) {
      return;
    }

    try {
      setIsAddingToApp(true);
      
      // Check if repository can be used
      const ownerLogin = repository.owner?.login || 'ravindrauiet';
      console.log('Checking repository access for:', ownerLogin, repository.name);
      
      const response = await fetch(`/api/github/repositories/${ownerLogin}/${repository.name}/check`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Repository check response:', data);
        if (data.exists) {
          // Repository exists and user has access - redirect to image management
          console.log('Redirecting to external repository manager:', `/external-repository/${ownerLogin}/${repository.name}`);
          window.location.href = `/external-repository/${ownerLogin}/${repository.name}`;
        }
      } else {
        const errorData = await response.json();
        console.error('Repository check failed:', errorData);
        alert(errorData.error || 'Failed to add repository to app');
      }
    } catch (error) {
      console.error('Failed to add repository to app:', error);
      alert('Failed to add repository to app');
    } finally {
      setIsAddingToApp(false);
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Folder className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{repository.name}</h3>
            <p className="text-sm text-gray-500">{repository.full_name}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          repository.private 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {repository.private ? 'Private' : 'Public'}
        </span>
      </div>

      {repository.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {repository.description}
        </p>
      )}

      {/* Repository Stats */}
      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(repository.created_at).toLocaleDateString()}</span>
        </div>
        {repository.language && (
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
            {repository.language}
          </span>
        )}
        {repository.stargazers_count > 0 && (
          <span className="flex items-center space-x-1">
            <span>⭐</span>
            <span>{repository.stargazers_count}</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleAddToApp}
          disabled={isAddingToApp}
          className="btn-primary text-sm py-2 px-3 flex items-center space-x-2"
        >
          {isAddingToApp ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4" />
              <span>Add Images</span>
            </>
          )}
        </button>
        
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          title="View on GitHub"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export default Dashboard;

