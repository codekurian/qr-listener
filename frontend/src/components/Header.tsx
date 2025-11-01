'use client'

import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = () => {
    // For demo purposes, just redirect to login
    window.location.href = '/login'
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-primary-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary-700">
            QR Listener Admin
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <UserCircleIcon className="w-8 h-8 text-primary-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">
                  Demo Admin
                </p>
                <p className="text-xs text-primary-600">
                  admin@graceshoppee.tech
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-primary-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-primary-100">
                  <p className="text-sm font-medium text-gray-800">
                    Demo Admin
                  </p>
                  <p className="text-xs text-primary-600">
                    admin@graceshoppee.tech
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
