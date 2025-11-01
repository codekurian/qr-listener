'use client'

import { useQuery } from '@tanstack/react-query'
import { 
  QrCodeIcon, 
  EyeIcon, 
  ChartBarIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline'

interface StatsData {
  totalQrCodes: number
  totalScans: number
  activeQrCodes: number
  todayScans: number
}

async function fetchStats(): Promise<StatsData> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  const response = await fetch(`${apiBaseUrl}/api/admin/qr-codes/stats`)
  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }
  return response.json()
}

export default function StatsCards() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stats-card animate-pulse">
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-8 bg-white/20 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total QR Codes', value: '0', icon: QrCodeIcon },
          { title: 'Total Scans', value: '0', icon: EyeIcon },
          { title: 'Active QR Codes', value: '0', icon: ChartBarIcon },
          { title: 'Today Scans', value: '0', icon: ClockIcon },
        ].map((stat, index) => (
          <div key={index} className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                <p className="text-white text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-white/60" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statsData = [
    { 
      title: 'Total QR Codes', 
      value: stats?.totalQrCodes || 0, 
      icon: QrCodeIcon 
    },
    { 
      title: 'Total Scans', 
      value: stats?.totalScans || 0, 
      icon: EyeIcon 
    },
    { 
      title: 'Active QR Codes', 
      value: stats?.activeQrCodes || 0, 
      icon: ChartBarIcon 
    },
    { 
      title: 'Today Scans', 
      value: stats?.todayScans || 0, 
      icon: ClockIcon 
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <div key={index} className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">{stat.title}</p>
              <p className="text-white text-2xl font-bold">{stat.value.toLocaleString()}</p>
            </div>
            <stat.icon className="w-8 h-8 text-white/60" />
          </div>
        </div>
      ))}
    </div>
  )
}
