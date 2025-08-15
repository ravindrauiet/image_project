import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RepositoryDetail from './components/RepositoryDetail';
import ExternalRepositoryManager from './components/ExternalRepositoryManager';
import './index.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar />}
        <main className={isAuthenticated ? 'pt-16' : ''}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/repository/:repoId" 
              element={
                <ProtectedRoute>
                  <RepositoryDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/external-repository/:owner/:repo" 
              element={
                <ProtectedRoute>
                  <ExternalRepositoryManager />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

