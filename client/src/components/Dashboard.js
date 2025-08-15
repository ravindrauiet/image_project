import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Image as ImageIcon, Users, GitBranch, Settings, Upload, ExternalLink, Calendar, Star, Eye, FolderOpen } from 'lucide-react';
import CreateRepositoryModal from './CreateRepositoryModal';

function Dashboard() {
  const [repositories, setRepositories] = useState([]);
  const [allGithubRepos, setAllGithubRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section - Compact */}
      <div className="bg-white shadow-soft border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to <span className="text-gradient">ImageHub</span>
            </h1>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              Your professional image management platform with GitHub integration, CDN capabilities, and advanced watermarking.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Stats Cards - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card-hover text-center group">
            <div className="p-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {repositories.reduce((total, repo) => total + (repo.image_count || 0), 0)}
              </h3>
              <p className="text-xs text-gray-600 font-medium">Total Images</p>
            </div>
          </div>

          <div className="card-hover text-center group">
            <div className="p-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {repositories.length}
              </h3>
              <p className="text-xs text-gray-600 font-medium">App Repositories</p>
            </div>
          </div>

          <div className="card-hover text-center group">
            <div className="p-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {allGithubRepos.length}
              </h3>
              <p className="text-xs text-gray-600 font-medium">GitHub Repositories</p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle - Compact */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white rounded-xl p-1 shadow-soft border border-gray-100">
            <button
              onClick={() => setViewMode('app')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewMode === 'app'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              App Repos ({repositories.length})
            </button>
            <button
              onClick={() => setViewMode('github')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewMode === 'github'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              All GitHub ({allGithubRepos.length})
            </button>
          </div>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary btn-sm flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Repository</span>
          </button>
        </div>

        {/* Error Message - Compact */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Content Section - Compact */}
        {viewMode === 'app' ? (
          // App Repositories View
          repositories.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <GitBranch className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">No repositories yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create your first repository to start managing images
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary btn-sm"
              >
                Create Repository
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {repositories.map((repo) => (
                <RepositoryCard key={repo.id} repository={repo} />
              ))}
            </div>
          )
        ) : (
          // All GitHub Repositories View
          allGithubRepos.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <GitBranch className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">No repositories found</h3>
              <p className="text-sm text-gray-600 mb-4">
                Loading your GitHub repositories...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}

function RepositoryCard({ repository }) {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <GitBranch className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{repository.name}</h3>
            <p className="text-xs text-gray-500">{repository.full_name}</p>
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
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {repository.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>{new Date(repository.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          to={`/repository/${repository.id}`}
          className="btn-primary btn-sm text-xs py-1.5 px-2"
        >
          <ImageIcon className="h-3 w-3 mr-1" />
          Manage
        </Link>
        
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-primary-600 p-1.5 rounded hover:bg-gray-100 transition-colors duration-200"
          title="View on GitHub"
        >
          <ExternalLink className="h-3 w-3" />
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
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <GitBranch className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{repository.name}</h3>
            <p className="text-xs text-gray-500">{repository.full_name}</p>
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
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {repository.description}
        </p>
      )}

      {/* Repository Stats - Compact */}
      <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>{new Date(repository.created_at).toLocaleDateString()}</span>
        </div>
        {repository.language && (
          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
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
          className="btn-primary btn-sm text-xs py-1.5 px-2 flex items-center space-x-1"
        >
          {isAddingToApp ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-3 w-3" />
              <span>Add Images</span>
            </>
          )}
        </button>
        
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-primary-600 p-1.5 rounded hover:bg-gray-100 transition-colors duration-200"
          title="View on GitHub"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

export default Dashboard;

