'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function AnalyticsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

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
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Track performance and usage of your QR codes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Total Scans</p>
                    <p className="text-white text-2xl font-bold">1,234</p>
                  </div>
                  <div className="text-white/60 text-2xl">📊</div>
                </div>
              </div>
              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Active QR Codes</p>
                    <p className="text-white text-2xl font-bold">45</p>
                  </div>
                  <div className="text-white/60 text-2xl">🔗</div>
                </div>
              </div>
              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Today's Scans</p>
                    <p className="text-white text-2xl font-bold">89</p>
                  </div>
                  <div className="text-white/60 text-2xl">📈</div>
                </div>
              </div>
              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Top QR Code</p>
                    <p className="text-white text-2xl font-bold">ECO-12345</p>
                  </div>
                  <div className="text-white/60 text-2xl">🏆</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Scan Trends
                </h2>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart will be displayed here</p>
                </div>
              </div>
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Top Performing QR Codes
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">ECO-12345</p>
                      <p className="text-sm text-gray-600">E-commerce Product</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">234 scans</p>
                      <p className="text-sm text-green-600">+12%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">REST-67890</p>
                      <p className="text-sm text-gray-600">Restaurant Menu</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">189 scans</p>
                      <p className="text-sm text-green-600">+8%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">EVENT-11111</p>
                      <p className="text-sm text-gray-600">Event Registration</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">156 scans</p>
                      <p className="text-sm text-red-600">-3%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
