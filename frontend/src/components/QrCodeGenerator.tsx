'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  QrCodeIcon, 
  LinkIcon, 
  DocumentTextIcon,
  TagIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import { appConfig } from '@/config/app'

interface QrCodeGenerationRequest {
  targetUrl: string
  description: string
  prefix?: string
  size?: number
  createdBy: string
  applicationId?: number | null
}

interface QrCodeGenerationResponse {
  id: string
  qrId: string
  targetUrl: string
  description: string
  imageUrl: string
  downloadUrl: string
  createdAt: string
}

async function generateQrCode(request: QrCodeGenerationRequest): Promise<QrCodeGenerationResponse> {
  const apiBaseUrl = appConfig.api.baseUrl
  const response = await fetch(`${apiBaseUrl}/api/qr/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to generate QR code')
  }

  return response.json()
}

export default function QrCodeGenerator() {
  const [formData, setFormData] = useState({
    targetUrl: '',
    description: '',
    prefix: '',
    size: 256,
    applicationId: null as number | null,
  })
  const [generatedQrCode, setGeneratedQrCode] = useState<QrCodeGenerationResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()

  const generateMutation = useMutation({
    mutationFn: generateQrCode,
    onSuccess: (data) => {
      setGeneratedQrCode(data)
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateMutation.mutate({
      ...formData,
      createdBy: 'admin@graceshoppee.tech', // This should come from session
    })
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
    if (generatedQrCode && navigator.share) {
      try {
        await navigator.share({
          title: `QR Code: ${generatedQrCode.qrId}`,
          text: `Check out this QR code: ${generatedQrCode.description}`,
          url: `${appConfig.api.baseUrl}/api/qr/redirect?qr_id=${generatedQrCode.qrId}`,
        })
      } catch (err) {
        console.error('Error sharing: ', err)
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Generation Form */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          QR Code Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target URL */}
          <div>
            <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Target URL *
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="targetUrl"
                type="url"
                required
                value={formData.targetUrl}
                onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                className="w-full pl-10 input-field"
                placeholder="https://example.com/page"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The URL where users will be redirected when they scan the QR code
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-10 input-field"
                rows={3}
                placeholder="Describe what this QR code is for..."
              />
            </div>
          </div>

          {/* Prefix */}
          <div>
            <label htmlFor="prefix" className="block text-sm font-medium text-gray-700 mb-2">
              QR ID Prefix
            </label>
            <div className="relative">
              <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="prefix"
                type="text"
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                className="w-full pl-10 input-field"
                placeholder="ECO, REST, EVENT, etc."
                maxLength={10}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Optional prefix for the QR ID (e.g., ECO-12345)
            </p>
          </div>

          {/* Size */}
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Size
            </label>
            <select
              id="size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
              className="input-field w-full"
            >
              <option value={128}>128x128 (Small)</option>
              <option value={256}>256x256 (Medium)</option>
              <option value={512}>512x512 (Large)</option>
              <option value={1024}>1024x1024 (Extra Large)</option>
            </select>
          </div>

          {/* Application */}
          <div>
            <label htmlFor="applicationId" className="block text-sm font-medium text-gray-700 mb-2">
              Application
            </label>
            <select
              id="applicationId"
              value={formData.applicationId || ''}
              onChange={(e) => setFormData({ ...formData, applicationId: e.target.value ? parseInt(e.target.value) : null })}
              className="input-field w-full"
            >
              <option value="">Select Application</option>
              <option value="1">E-commerce</option>
              <option value="2">Restaurant</option>
              <option value="3">Event</option>
              <option value="4">Marketing</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={generateMutation.isPending}
            className="w-full btn-primary py-3"
          >
            {generateMutation.isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="loading-spinner"></div>
                <span>Generating QR Code...</span>
              </div>
            ) : (
              'Generate QR Code'
            )}
          </button>

          {generateMutation.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {generateMutation.error.message}
            </div>
          )}
        </form>
      </div>

      {/* Generated QR Code */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Generated QR Code
        </h2>

        {generatedQrCode ? (
          <div className="space-y-6">
            {/* QR Code Image */}
            <div className="qr-code-container">
              <img
                src={generatedQrCode.imageUrl}
                alt={`QR Code ${generatedQrCode.qrId}`}
                className="mx-auto mb-4"
              />
              <div className="text-center">
                <p className="font-medium text-gray-800 mb-2">{generatedQrCode.qrId}</p>
                <p className="text-sm text-gray-600">{generatedQrCode.description}</p>
              </div>
            </div>

            {/* QR Code Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  QR ID
                </label>
                <div className="flex items-center space-x-2">
                  <QrCodeIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 font-mono">{generatedQrCode.qrId}</span>
                  <button
                    onClick={() => copyToClipboard(generatedQrCode.qrId)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target URL
                </label>
                <div className="flex items-center space-x-2">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 break-all">{generatedQrCode.targetUrl}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Redirect URL
                </label>
                <div className="flex items-center space-x-2">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 break-all">
                    {appConfig.api.baseUrl}/api/qr/redirect?qr_id={generatedQrCode.qrId}
                  </span>
                  <button
                    onClick={() => copyToClipboard(`${appConfig.api.baseUrl}/api/qr/redirect?qr_id=${generatedQrCode.qrId}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={generatedQrCode.downloadUrl}
                  download
                  className="btn-secondary text-sm flex items-center justify-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download</span>
                </a>
                <button
                  onClick={shareQrCode}
                  className="btn-secondary text-sm flex items-center justify-center space-x-2"
                >
                  <ShareIcon className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              <button
                onClick={() => copyToClipboard(`${appConfig.api.baseUrl}/api/qr/redirect?qr_id=${generatedQrCode.qrId}`)}
                className="w-full btn-primary text-sm"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                Copy Redirect URL
              </button>
            </div>

            {copied && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                Copied to clipboard!
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Generate a QR code to see it here</p>
          </div>
        )}
      </div>
    </div>
  )
}
