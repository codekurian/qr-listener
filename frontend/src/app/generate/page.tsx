'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import QrCodeGenerator from '@/components/QrCodeGenerator'

export default function GeneratePage() {
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Generate QR Code
              </h1>
              <p className="text-gray-600">
                Create a new QR code for your application
              </p>
            </div>

            <QrCodeGenerator />
          </div>
        </main>
      </div>
    </div>
  )
}
