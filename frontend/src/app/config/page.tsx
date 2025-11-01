'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import AuthGuard from '@/components/AuthGuard'

export default function ConfigPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [config, setConfig] = useState({
    authEnabled: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true',
    skipAuth: process.env.NEXT_PUBLIC_SKIP_AUTH === 'true',
    demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    googleAuth: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true',
    emailAuth: process.env.NEXT_PUBLIC_EMAIL_AUTH_ENABLED === 'true',
  })

  useEffect(() => {
    // For demo purposes, skip authentication
    setIsLoading(false)
  }, [])

  const handleSave = () => {
    // Demo save functionality
    alert('Configuration saved! (This is a demo - settings are not persisted)')
  }

  const handleReset = () => {
    setConfig({
      authEnabled: false,
      skipAuth: true,
      demoMode: true,
      apiBaseUrl: 'http://localhost:8080',
      googleAuth: false,
      emailAuth: false,
    })
  }

  if (isLoading) {
    return (
      <div className="qr-admin-panel min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="qr-admin-panel min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Configuration
                </h1>
                <p className="text-gray-600">
                  Manage application settings and environment configuration
                </p>
              </div>

              <div className="space-y-6">
                {/* Authentication Settings */}
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Authentication Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Enable Authentication
                        </label>
                        <p className="text-xs text-gray-500">
                          Require login to access the admin panel
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.authEnabled}
                        onChange={(e) => setConfig({...config, authEnabled: e.target.checked})}
                        className="w-4 h-4"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Skip Authentication (Demo Mode)
                        </label>
                        <p className="text-xs text-gray-500">
                          Bypass authentication for demo purposes
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.skipAuth}
                        onChange={(e) => setConfig({...config, skipAuth: e.target.checked})}
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Demo Mode
                        </label>
                        <p className="text-xs text-gray-500">
                          Enable demo features and sample data
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.demoMode}
                        onChange={(e) => setConfig({...config, demoMode: e.target.checked})}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </div>

                {/* Provider Settings */}
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Authentication Providers
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Google OAuth
                        </label>
                        <p className="text-xs text-gray-500">
                          Enable Google sign-in
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.googleAuth}
                        onChange={(e) => setConfig({...config, googleAuth: e.target.checked})}
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Email Authentication
                        </label>
                        <p className="text-xs text-gray-500">
                          Enable email magic link authentication
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.emailAuth}
                        onChange={(e) => setConfig({...config, emailAuth: e.target.checked})}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </div>

                {/* API Settings */}
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    API Configuration
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Base URL
                      </label>
                      <input
                        type="text"
                        value={config.apiBaseUrl}
                        onChange={(e) => setConfig({...config, apiBaseUrl: e.target.value})}
                        className="input-field"
                        placeholder="https://graceshoppee.tech"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Backend API endpoint URL (graceshoppee.tech for production)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Environment Info */}
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Environment Information
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Environment:</span>
                        <span className="ml-2 text-gray-600">
                          {process.env.NODE_ENV || 'development'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Hostname:</span>
                        <span className="ml-2 text-gray-600">
                          {typeof window !== 'undefined' ? window.location.hostname : 'localhost'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Port:</span>
                        <span className="ml-2 text-gray-600">
                          {typeof window !== 'undefined' ? window.location.port || '3000' : '3000'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Protocol:</span>
                        <span className="ml-2 text-gray-600">
                          {typeof window !== 'undefined' ? window.location.protocol : 'http:'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <button
                    onClick={handleReset}
                    className="btn-secondary"
                  >
                    Reset to Defaults
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-primary"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
