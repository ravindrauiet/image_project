# Repository Graph Feature

## Overview
The Repository Graph feature provides comprehensive visual analytics for GitHub repositories, allowing users to analyze their repository's activity, structure, and contributors through interactive charts and graphs.

## Features

### 1. Repository Overview
- **Repository Statistics**: Stars, forks, issues, and size
- **Language Distribution**: Visual pie chart showing programming languages used
- **Recent Commits**: Timeline of the last 20 commits with author information
- **Top Contributors**: List of contributors with their contribution counts

### 2. Commit History Analysis
- **Commit Timeline**: Line chart showing commit activity over time
- **Total Commits**: Count of all commits in the repository
- **Recent Commits List**: Detailed view of recent commits with SHA, message, author, and date

### 3. File Structure Analysis
- **File Types Distribution**: Bar chart showing count of different file types
- **Folder Structure**: Visual representation of repository folders
- **Total Files Count**: Summary of all files in the repository

### 4. Contributor Activity
- **Contributor Chart**: Bar chart showing contribution counts per contributor
- **Contributor Profiles**: List with avatars, usernames, and contribution counts
- **GitHub Links**: Direct links to contributor profiles

## How to Use

### For Regular Repositories (Created through the app)
1. Navigate to your repository detail page
2. Click the "View Graph" button in the header
3. Select from different graph types using the tabs:
   - **Overview**: Complete repository summary
   - **Commits**: Commit history and activity
   - **Files**: File structure and types
   - **Contributors**: Contributor activity and profiles

### For External Repositories
1. Navigate to an external repository through the dashboard
2. Click the "View Graph" button in the header
3. Use the same tab interface to explore different aspects of the repository

## Technical Implementation

### Backend API Endpoints
- `GET /api/repositories/:repoId/graph?type={overview|commits|files|contributors}` - For regular repositories
- `GET /api/github/repositories/:owner/:repo/graph?type={overview|commits|files|contributors}` - For external repositories

### Frontend Components
- `RepositoryGraph.js` - Main graph modal component with Chart.js integration
- Updated `RepositoryDetail.js` - Added graph button and modal integration
- Updated `ExternalRepositoryManager.js` - Added graph functionality for external repos

### Chart Types Used
- **Doughnut Chart**: Language distribution
- **Line Chart**: Commit activity over time
- **Bar Chart**: File types and contributor activity
- **Custom Cards**: Repository statistics and recent commits

## Data Sources
The graphs are generated using real-time data from the GitHub API:
- Repository metadata (stars, forks, issues, size)
- Commit history and statistics
- Programming language usage
- Contributor information and activity
- File structure and organization

## Benefits
1. **Visual Analytics**: Easy-to-understand visual representation of repository data
2. **Real-time Data**: Always up-to-date information from GitHub
3. **Multiple Views**: Different perspectives on the same repository
4. **Interactive Charts**: Hover effects and detailed tooltips
5. **Responsive Design**: Works on desktop and mobile devices

## Future Enhancements
- Branch comparison graphs
- Pull request activity analysis
- Issue tracking and resolution trends
- Code complexity metrics
- Release history visualization
- Team collaboration patterns

## Dependencies
- **Chart.js**: For creating interactive charts
- **react-chartjs-2**: React wrapper for Chart.js
- **GitHub API**: For fetching repository data
- **Octokit**: GitHub API client for Node.js

## Usage Example
```javascript
// The graph modal can be opened from any repository page
<RepositoryGraph
  isOpen={showGraphModal}
  onClose={() => setShowGraphModal(false)}
  repositoryId={repoId}
  repositoryName={repository?.name}
  isExternalRepository={false}
  externalRepositoryInfo={null}
/>
```

This feature enhances the GitHub image management system by providing valuable insights into repository activity and structure, making it easier for users to understand and analyze their projects.
