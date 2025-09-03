import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  BarChart3, 
  GitCommit, 
  FileText, 
  Users, 
  Star, 
  GitFork, 
  AlertCircle,
  Calendar,
  Code,
  TrendingUp,
  X
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function RepositoryGraph({ isOpen, onClose, repositoryId, repositoryName, isExternalRepository = false, externalRepositoryInfo = null }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'commits', label: 'Commits', icon: GitCommit },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'contributors', label: 'Contributors', icon: Users }
  ];

  useEffect(() => {
    if (isOpen && repositoryId) {
      fetchGraphData(activeTab);
    }
  }, [isOpen, repositoryId, activeTab]);

  const fetchGraphData = async (type) => {
    try {
      setLoading(true);
      setError(null);
      
      let url;
      if (isExternalRepository && externalRepositoryInfo) {
        url = `/api/github/repositories/${externalRepositoryInfo.owner}/${externalRepositoryInfo.name}/graph?type=${type}`;
      } else {
        url = `/api/repositories/${repositoryId}/graph?type=${type}`;
      }
      
      // console.log('Fetching graph data for type:', type, 'URL:', url);
      
      const response = await fetch(url, {
        credentials: 'include'
      });

      // console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        // console.log('Graph data received:', data);
        setGraphData(data);
      } else {
        const errorData = await response.json();
        // console.error('Error response:', errorData);
        setError(errorData.error || 'Failed to fetch graph data');
      }
    } catch (err) {
      console.error('Error fetching graph data:', err);
      setError('Failed to fetch graph data');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => {
    if (!graphData?.data) return null;

    const { overview, commits, languages, contributors } = graphData.data;

    // Check if we have the correct data structure for overview
    if (!overview || !commits || !languages || !contributors) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No overview data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Repository Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Stars</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{overview.stars}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <GitFork className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Forks</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{overview.forks}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Issues</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">{overview.issues}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Size</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{overview.size} KB</p>
          </div>
        </div>

        {/* Languages Chart */}
        {languages.length > 0 && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Languages</span>
            </h3>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: languages.map(lang => lang.language),
                  datasets: [{
                    data: languages.map(lang => lang.percentage),
                    backgroundColor: [
                      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          return `${label}: ${value}%`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Recent Commits */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <GitCommit className="h-5 w-5" />
            <span>Recent Commits ({commits.total})</span>
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {commits.timeline.slice(0, 10).map((commit, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {commit.message}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <span>{commit.author}</span>
                    <span>•</span>
                    <span>{commit.sha}</span>
                    <span>•</span>
                    <span>{new Date(commit.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Top Contributors</span>
          </h3>
          <div className="space-y-3">
            {contributors.slice(0, 5).map((contributor, index) => (
              <div key={index} className="flex items-center space-x-3">
                <img
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{contributor.login}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {contributor.contributions} commits
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCommits = () => {
    if (!graphData?.data) {
      // console.log('No graph data available for commits');
      return null;
    }

    // console.log('Rendering commits with data:', graphData.data);
    const { chartData, totalCommits, recentCommits } = graphData.data;

    // Check if we have the correct data structure for commits
    if (!chartData || !Array.isArray(chartData)) {
      return (
        <div className="text-center py-12">
          <GitCommit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No commit data available</p>
        </div>
      );
    }

    if (!chartData || chartData.length === 0) {
      return (
        <div className="text-center py-12">
          <GitCommit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No commit data available</p>
          {/* <p className="text-sm text-gray-400 mt-2">Chart data: {JSON.stringify(chartData)}</p> */}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Commit Chart */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Commit Activity ({totalCommits} total commits)</span>
          </h3>
          <div className="h-64">
            <Line
              data={{
                labels: chartData.map(item => new Date(item.date).toLocaleDateString()),
                datasets: [{
                  label: 'Commits',
                  data: chartData.map(item => item.commits),
                  borderColor: '#3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4,
                  fill: true
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Recent Commits List */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Recent Commits</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentCommits.map((commit, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {commit.message}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <span>{commit.author}</span>
                    <span>•</span>
                    <span className="font-mono">{commit.sha}</span>
                    <span>•</span>
                    <span>{new Date(commit.date).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFiles = () => {
    if (!graphData?.data) {
      // console.log('No graph data available for files');
      return null;
    }

    // console.log('Rendering files with data:', graphData.data);
    const { fileTypes, folders, totalFiles } = graphData.data;

    // Check if we have the correct data structure for files
    if (!fileTypes || !Array.isArray(fileTypes)) {
      return (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No file data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* File Types Chart */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>File Types ({totalFiles || 0} total files)</span>
          </h3>
          {fileTypes && fileTypes.length > 0 ? (
            <div className="h-64">
              <Bar
                data={{
                  labels: fileTypes.map(item => item.type),
                  datasets: [{
                    label: 'Number of Files',
                    data: fileTypes.map(item => item.count),
                    backgroundColor: '#3B82F6',
                    borderColor: '#2563EB',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No file type data available</p>
              {/* <p className="text-sm text-gray-400 mt-2">File types: {JSON.stringify(fileTypes)}</p> */}
            </div>
          )}
        </div>

        {/* Folders Structure */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Folder Structure</h3>
          <div className="space-y-2">
            {folders && folders.length > 0 ? (
              folders.map((folder, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{folder.name}</span>
                  <span className="text-xs text-gray-500">({folder.path})</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No folders found</p>
                {/* <p className="text-sm text-gray-400 mt-2">Folders: {JSON.stringify(folders)}</p> */}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };



  const renderContributors = () => {
    if (!graphData?.data) return null;

    const { contributors, totalContributors } = graphData.data;

    // Check if we have the correct data structure for contributors
    if (!contributors || !Array.isArray(contributors)) {
      return (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No contributor data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Contributors Chart */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Contributor Activity ({totalContributors} contributors)</span>
          </h3>
          <div className="h-64">
            <Bar
              data={{
                labels: contributors.map(contrib => contrib.login),
                datasets: [{
                  label: 'Contributions',
                  data: contributors.map(contrib => contrib.contributions),
                  backgroundColor: '#10B981',
                  borderColor: '#059669',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Contributors List */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">All Contributors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contributors.map((contributor, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <a
                    href={contributor.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {contributor.login}
                  </a>
                  <p className="text-xs text-gray-500">
                    {contributor.contributions} contributions
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };



  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'commits':
        return renderCommits();
      case 'files':
        return renderFiles();
      case 'contributors':
        return renderContributors();
      default:
        return renderOverview();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Repository Graph</h2>
            <p className="text-gray-600">{repositoryName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchGraphData(activeTab)}
                className="mt-4 btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}



export default RepositoryGraph;
