'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { QrCodeIcon, EyeIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface QrCode {
  id: string
  qrId: string
  targetUrl: string
  description: string
  scanCount: number
  createdAt: string
  isActive: boolean
}

async function fetchRecentQrCodes(): Promise<QrCode[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  const response = await fetch(`${apiBaseUrl}/api/admin/qr?limit=5&sort=createdAt&order=desc`)
  if (!response.ok) {
    throw new Error('Failed to fetch QR codes')
  }
  return response.json()
}

export default function RecentQrCodes() {
  const { data: qrCodes, isLoading, error } = useQuery({
    queryKey: ['recentQrCodes'],
    queryFn: fetchRecentQrCodes,
    refetchInterval: 60000, // Refetch every minute
  })

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent QR Codes
        </h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent QR Codes
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Failed to load QR codes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Recent QR Codes
        </h2>
        <Link
          href="/qr-codes"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {qrCodes?.length === 0 ? (
          <div className="text-center py-8">
            <QrCodeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No QR codes yet</p>
            <Link
              href="/generate"
              className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Create your first QR code
            </Link>
          </div>
        ) : (
          qrCodes?.map((qrCode) => (
            <div key={qrCode.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <QrCodeIcon className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-800">{qrCode.qrId}</span>
                    <span className={`status-badge ${qrCode.isActive ? 'status-active' : 'status-inactive'}`}>
                      {qrCode.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{qrCode.description}</p>
                  <p className="text-xs text-gray-500 truncate">{qrCode.targetUrl}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{qrCode.scanCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(qrCode.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
