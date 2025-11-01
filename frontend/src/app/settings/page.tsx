'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    defaultPrefix: 'QR',
    qrCodeSize: 256,
    autoGenerate: true,
    notifications: true,
    analytics: true
  })

  useEffect(() => {
    // For demo purposes, skip authentication
    setIsLoading(false)
  }, [])

  const handleSave = () => {
    // Demo save functionality
    alert('Settings saved successfully!')
  }

  if (isLoading) {
    return (
      <div className="qr-admin-panel min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="qr-admin-panel min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Settings
              </h1>
              <p className="text-gray-600">
                Configure your QR code generation and management preferences
              </p>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  QR Code Generation
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Prefix
                    </label>
                    <input
                      type="text"
                      value={settings.defaultPrefix}
                      onChange={(e) => setSettings({...settings, defaultPrefix: e.target.value})}
                      className="input-field"
                      placeholder="QR"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default QR Code Size
                    </label>
                    <select
                      value={settings.qrCodeSize}
                      onChange={(e) => setSettings({...settings, qrCodeSize: parseInt(e.target.value)})}
                      className="input-field"
                    >
                      <option value={128}>128x128</option>
                      <option value={256}>256x256</option>
                      <option value={512}>512x512</option>
                      <option value={1024}>1024x1024</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoGenerate"
                      checked={settings.autoGenerate}
                      onChange={(e) => setSettings({...settings, autoGenerate: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="autoGenerate" className="text-sm font-medium text-gray-700">
                      Auto-generate QR codes for new URLs
                    </label>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Notifications
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={settings.notifications}
                      onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                      Enable email notifications
                    </label>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Analytics
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="analytics"
                      checked={settings.analytics}
                      onChange={(e) => setSettings({...settings, analytics: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="analytics" className="text-sm font-medium text-gray-700">
                      Enable analytics tracking
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="btn-primary"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
