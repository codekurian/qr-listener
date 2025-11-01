'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isAuthEnabled, isDemoMode } from '@/config/app'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // If demo mode is enabled or auth is disabled, skip authentication
      if (isDemoMode() || !isAuthEnabled()) {
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      // TODO: Implement actual authentication check
      // For now, in demo mode, we'll always allow access
      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="qr-admin-panel min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    // Redirect to login if not authenticated and auth is enabled
    router.push('/login')
    return null
  }

  return <>{children}</>
}
