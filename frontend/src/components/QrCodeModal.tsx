'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  XMarkIcon, 
  QrCodeIcon, 
  LinkIcon, 
  EyeIcon, 
  CalendarIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  PencilIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { appConfig } from '@/config/app'

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

interface QrCodeModalProps {
  qrCode: QrCode
  onClose: () => void
}

export default function QrCodeModal({ qrCode, onClose }: QrCodeModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'analytics' | 'settings'>('details')
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    targetUrl: qrCode.targetUrl,
    description: qrCode.description,
    isActive: qrCode.isActive,
  })
  const queryClient = useQueryClient()

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { targetUrl: string; description: string; isActive: boolean }) => {
      const apiBaseUrl = appConfig.api.baseUrl
      const response = await fetch(`${apiBaseUrl}/api/admin/qr-codes/${qrCode.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to update QR code')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setIsEditing(false)
      // Update local qrCode data by closing and reopening would refresh, but for now just close editing
    },
  })

  const handleSave = () => {
    updateMutation.mutate(editData)
  }

  const handleCancel = () => {
    setEditData({
      targetUrl: qrCode.targetUrl,
      description: qrCode.description,
      isActive: qrCode.isActive,
    })
    setIsEditing(false)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const shareQrCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code: ${qrCode.qrId}`,
          text: `Check out this QR code: ${qrCode.description}`,
          url: `${appConfig.api.baseUrl}/api/qr/redirect?qr_id=${qrCode.qrId}`,
        })
      } catch (err) {
        console.error('Error sharing: ', err)
      }
    } else {
      copyToClipboard(`${appConfig.api.baseUrl}/api/qr/redirect?qr_id=${qrCode.qrId}`)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            QR Code Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* QR Code Image */}
        <div className="qr-code-container mb-6">
          <img
            src={qrCode.imageUrl || `${appConfig.api.baseUrl}/api/qr/${qrCode.qrId}/image?size=256`}
            alt={`QR Code ${qrCode.qrId}`}
            className="mx-auto mb-4"
          />
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => copyToClipboard(qrCode.qrId)}
              className="btn-secondary text-sm"
            >
              <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
              Copy ID
            </button>
            <button
              onClick={shareQrCode}
              className="btn-secondary text-sm"
            >
              <ShareIcon className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
          {copied && (
            <p className="text-green-600 text-sm mt-2">Copied to clipboard!</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'details', label: 'Details' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QR ID
              </label>
              <div className="flex items-center space-x-2">
                <QrCodeIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-mono">{qrCode.qrId}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">QR ID cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target URL {isEditing && <span className="text-red-500">*</span>}
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={editData.targetUrl}
                  onChange={(e) => setEditData({ ...editData, targetUrl: e.target.value })}
                  className="input-field w-full"
                  placeholder="https://example.com"
                  required
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 break-all">{qrCode.targetUrl}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="input-field w-full min-h-[80px]"
                  placeholder="Describe what this QR code is for..."
                />
              ) : (
                <p className="text-gray-900">{qrCode.description || 'No description'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              {isEditing ? (
                <select
                  value={editData.isActive ? 'true' : 'false'}
                  onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'true' })}
                  className="input-field w-full"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              ) : (
                <span className={`status-badge ${qrCode.isActive ? 'status-active' : 'status-inactive'}`}>
                  {qrCode.isActive ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created
                </label>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {new Date(qrCode.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {new Date(qrCode.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Total Scans</p>
                    <p className="text-white text-2xl font-bold">N/A</p>
                  </div>
                  <EyeIcon className="w-8 h-8 text-white/60" />
                </div>
              </div>
              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Status</p>
                    <p className="text-white text-2xl font-bold">
                      {qrCode.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <QrCodeIcon className="w-8 h-8 text-white/60" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Scan History</h3>
              <p className="text-gray-600 text-sm">
                Detailed analytics coming soon...
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Status
              </label>
              <button
                className={`status-badge ${qrCode.isActive ? 'status-active' : 'status-inactive'} cursor-pointer`}
              >
                {qrCode.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Download Options
              </label>
              <div className="space-y-2">
                <a
                  href={qrCode.downloadUrl || `${appConfig.api.baseUrl}/api/qr/${qrCode.qrId}/download?size=256`}
                  download
                  className="btn-secondary text-sm block text-center"
                >
                  Download PNG (256x256)
                </a>
                <a
                  href={`${appConfig.api.baseUrl}/api/qr/${qrCode.qrId}/download?size=512`}
                  download
                  className="btn-secondary text-sm block text-center"
                >
                  Download PNG (512x512)
                </a>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-800 mb-2">Danger Zone</h3>
              <p className="text-red-600 text-sm mb-3">
                Deleting this QR code will remove it permanently and all associated data.
              </p>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
                Delete QR Code
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel} 
                className="btn-secondary"
                disabled={updateMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="btn-primary flex items-center"
                disabled={updateMutation.isPending || !editData.targetUrl.trim()}
              >
                {updateMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn-primary flex items-center"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit QR Code
              </button>
            </>
          )}
        </div>
        {updateMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            Failed to update QR code. Please try again.
          </div>
        )}
        {updateMutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            QR code updated successfully!
          </div>
        )}
      </div>
    </div>
  )
}
