'use client'

import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface Filters {
  search: string
  status: string
  sortBy: string
  sortOrder: string
}

interface QrCodeFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export default function QrCodeFilters({ filters, onFiltersChange }: QrCodeFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value })
  }

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy })
  }

  const handleOrderChange = (sortOrder: string) => {
    onFiltersChange({ ...filters, sortOrder })
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <FunnelIcon className="w-4 h-4" />
          <span className="text-sm">Advanced</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search QR codes..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 input-field"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="input-field"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Sort By */}
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="input-field"
        >
          <option value="createdAt">Created Date</option>
          <option value="qrId">QR ID</option>
          <option value="scanCount">Scan Count</option>
          <option value="description">Description</option>
        </select>

        {/* Sort Order */}
        <select
          value={filters.sortOrder}
          onChange={(e) => handleOrderChange(e.target.value)}
          className="input-field"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <input
                type="date"
                className="input-field w-full"
                placeholder="From date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scan Count Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="input-field flex-1"
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="input-field flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application
              </label>
              <select className="input-field w-full">
                <option value="">All Applications</option>
                <option value="1">E-commerce</option>
                <option value="2">Restaurant</option>
                <option value="3">Event</option>
                <option value="4">Marketing</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
