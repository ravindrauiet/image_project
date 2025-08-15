import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Github, Image, Database, Zap } from 'lucide-react';

function Login() {
  const { login } = useAuth();

  const handleGitHubLogin = () => {
    // Redirect to GitHub OAuth on backend
    window.location.href = 'http://localhost:5000/auth/github';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Image className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            GitHub Image Manager
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage your images in GitHub repositories with ease
          </p>
        </div>

        <div className="card">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Sign in to get started
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Connect your GitHub account to create repositories and manage images
              </p>
            </div>

            <button
              onClick={handleGitHubLogin}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-github-800 hover:bg-github-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-500 transition-colors duration-200"
            >
              <Github className="h-5 w-5 mr-2" />
              Continue with GitHub
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our terms of service and privacy policy
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mb-2">
              <Database className="h-4 w-4 text-primary-600" />
            </div>
            <p className="text-xs text-gray-600">Create Repositories</p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mb-2">
              <Image className="h-4 w-4 text-primary-600" />
            </div>
            <p className="text-xs text-gray-600">Upload Images</p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mb-2">
              <Zap className="h-4 w-4 text-primary-600" />
            </div>
            <p className="text-xs text-gray-600">Fast API</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
