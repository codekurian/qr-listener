'use client'

import Link from 'next/link'
import { 
  PlusIcon, 
  QrCodeIcon, 
  MagnifyingGlassIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline'

const actions = [
  {
    name: 'Generate QR Code',
    description: 'Create a new QR code',
    href: '/generate',
    icon: PlusIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'View QR Codes',
    description: 'Manage existing QR codes',
    href: '/qr-codes',
    icon: QrCodeIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Search QR Codes',
    description: 'Find specific QR codes',
    href: '/search',
    icon: MagnifyingGlassIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'View Analytics',
    description: 'Check performance metrics',
    href: '/analytics',
    icon: ChartBarIcon,
    color: 'bg-orange-500',
  },
]

export default function QuickActions() {
  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Quick Actions
      </h2>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{action.name}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
