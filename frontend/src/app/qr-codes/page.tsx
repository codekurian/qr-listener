'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import QrCodesTable from '@/components/QrCodesTable'
import QrCodeFilters from '@/components/QrCodeFilters'

export default function QrCodesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

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
                QR Codes
              </h1>
              <p className="text-gray-600">
                Manage and monitor your QR codes
              </p>
            </div>

            <div className="mb-6">
              <QrCodeFilters 
                filters={filters} 
                onFiltersChange={setFilters} 
              />
            </div>

            <QrCodesTable filters={filters} />
          </div>
        </main>
      </div>
    </div>
  )
}
