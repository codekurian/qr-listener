'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  QrCodeIcon, 
  ChartBarIcon, 
  CogIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'QR Codes', href: '/qr-codes', icon: QrCodeIcon },
  { name: 'Generate QR', href: '/generate', icon: PlusIcon },
  { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
  { name: 'Configuration', href: '/config', icon: CogIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="sidebar w-64 min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          QR Listener
        </h2>
        <p className="text-white/80 text-sm">
          Admin Panel
        </p>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-link ${
                isActive
                  ? 'active'
                  : ''
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 pt-6 border-t border-white/20">
        <div className="text-white/80 text-sm">
          <p className="font-medium">GraceShoppee.tech</p>
          <p className="text-xs">QR Redirect Service</p>
        </div>
      </div>
    </div>
  )
}
