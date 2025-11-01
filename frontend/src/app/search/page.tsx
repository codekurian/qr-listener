'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function SearchPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // For demo purposes, skip authentication
    setIsLoading(false)
  }, [])

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
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Search QR Codes
              </h1>
              <p className="text-gray-600">
                Find and manage your QR codes with advanced search
              </p>
            </div>

            <div className="card p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search QR codes by ID, description, or URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full input-field"
                  />
                </div>
                <button className="btn-primary">
                  Search
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Search Results
              </h2>
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchQuery ? `Searching for "${searchQuery}"...` : 'Enter a search query to find QR codes'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
