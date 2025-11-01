'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  QrCodeIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import QrCodeModal from './QrCodeModal'

interface QrCode {
  id: number
  qrId: string
  targetUrl: string
  description: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  createdBy: string
  imageUrl: string
  downloadUrl: string
}

interface Filters {
  search: string
  status: string
  sortBy: string
  sortOrder: string
}

interface QrCodesTableProps {
  filters: Filters
}

async function fetchQrCodes(filters: Filters): Promise<QrCode[]> {
  const params = new URLSearchParams()
  if (filters.search) params.append('search', filters.search)
  if (filters.status !== 'all') params.append('status', filters.status)
  params.append('sortBy', filters.sortBy)
  params.append('sortOrder', filters.sortOrder)

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  const response = await fetch(`${apiBaseUrl}/api/admin/qr-codes?${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch QR codes')
  }
  const data = await response.json()
  return data.content || []
}

async function deleteQrCode(id: string): Promise<void> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  const response = await fetch(`${apiBaseUrl}/api/admin/qr-codes/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete QR code')
  }
}

async function toggleQrCodeStatus(id: string, isActive: boolean): Promise<void> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  const response = await fetch(`${apiBaseUrl}/api/admin/qr-codes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive }),
  })
  if (!response.ok) {
    throw new Error('Failed to update QR code status')
  }
}

export default function QrCodesTable({ filters }: QrCodesTableProps) {
  const [selectedQrCode, setSelectedQrCode] = useState<QrCode | null>(null)
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: qrCodes, isLoading, error } = useQuery({
    queryKey: ['qrCodes', filters],
    queryFn: () => fetchQrCodes(filters),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const deleteMutation = useMutation({
    mutationFn: deleteQrCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] })
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleQrCodeStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] })
    },
  })

  const handleEdit = (qrCode: QrCode) => {
    setSelectedQrCode(qrCode)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this QR code?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleToggleStatus = (id: string, isActive: boolean) => {
    toggleStatusMutation.mutate({ id, isActive: !isActive })
  }

  if (isLoading) {
    return (
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-semibold">QR Codes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-semibold">QR Codes</h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-500">Failed to load QR codes</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-semibold">QR Codes ({qrCodes?.length || 0})</h3>
        </div>
        
        {qrCodes?.length === 0 ? (
          <div className="p-6 text-center">
            <QrCodeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No QR codes found</p>
            <a
              href="/generate"
              className="btn-primary inline-block"
            >
              Create your first QR code
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {qrCodes?.map((qrCode) => (
                  <tr key={qrCode.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <QrCodeIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {qrCode.qrId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {qrCode.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <LinkIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {qrCode.targetUrl}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {qrCode.createdBy}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(qrCode.id, qrCode.isActive)}
                        className={`status-badge ${qrCode.isActive ? 'status-active' : 'status-inactive'} cursor-pointer`}
                      >
                        {qrCode.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(qrCode.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(qrCode)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(qrCode.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          disabled={deleteMutation.isPending}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedQrCode && (
        <QrCodeModal
          qrCode={selectedQrCode}
          onClose={() => {
            setShowModal(false)
            setSelectedQrCode(null)
          }}
        />
      )}
    </>
  )
}
