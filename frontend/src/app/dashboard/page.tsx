'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import StatsCards from '@/components/StatsCards'
import RecentQrCodes from '@/components/RecentQrCodes'
import QuickActions from '@/components/QuickActions'
import AuthGuard from '@/components/AuthGuard'

export default function DashboardPage() {
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
        <main className="flex-1 p-6 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary-800 mb-2">
                Dashboard
              </h1>
              <p className="text-primary-600">
                Welcome back! Here's what's happening with your QR codes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <StatsCards />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentQrCodes />
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        QR code <span className="font-medium text-primary-700">ECO-12345</span> was scanned 5 times
                      </p>
                      <p className="text-xs text-primary-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        New QR code <span className="font-medium text-primary-700">REST-67890</span> was created
                      </p>
                      <p className="text-xs text-primary-500">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        QR code <span className="font-medium text-primary-700">EVENT-11111</span> was updated
                      </p>
                      <p className="text-xs text-primary-500">3 hours ago</p>
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