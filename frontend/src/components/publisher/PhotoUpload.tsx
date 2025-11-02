'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Photo } from '@/types/publication'

interface PhotoUploadProps {
  photos: Photo[]
  onPhotosChange: (photos: Photo[]) => void
  maxPhotos?: number
}

export default function PhotoUpload({ photos, onPhotosChange, maxPhotos = 10 }: PhotoUploadProps) {
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setErrors([])
    const newErrors: string[] = []

    if (photos.length + acceptedFiles.length > maxPhotos) {
      newErrors.push(`You can only upload up to ${maxPhotos} photos`)
    }

    acceptedFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        newErrors.push(`${file.name} is not an image file`)
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        newErrors.push(`${file.name} is too large (max 10MB)`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        const newPhoto: Photo = {
          url,
          fileName: file.name,
          file,
          isCover: photos.length === 0,
          order: photos.length,
        }
        onPhotosChange([...photos, newPhoto])
      }
      reader.readAsDataURL(file)
    })

    if (newErrors.length > 0) {
      setErrors(newErrors)
    }
  }, [photos, onPhotosChange, maxPhotos])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxFiles: maxPhotos - photos.length,
  })

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index)
    // Update cover photo if the removed one was cover
    if (photos[index].isCover && updated.length > 0) {
      updated[0].isCover = true
    }
    // Update order indices
    updated.forEach((photo, i) => {
      photo.order = i
    })
    onPhotosChange(updated)
  }

  const setCoverPhoto = (index: number) => {
    const updated = photos.map((photo, i) => ({
      ...photo,
      isCover: i === index,
    }))
    onPhotosChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragActive
              ? 'border-amber-400 bg-amber-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive ? (
            <span className="text-amber-600 font-medium">Drop photos here...</span>
          ) : (
            <>
              <span className="text-amber-600 font-medium">Click to upload</span> or drag and drop
            </>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Select up to {maxPhotos} photos (JPG, PNG, WebP, GIF - Max 10MB each)
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {photos.length} / {maxPhotos} photos selected
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Photos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className={`
                  relative group rounded-lg overflow-hidden border-2
                  ${photo.isCover ? 'border-amber-500' : 'border-gray-200'}
                `}
              >
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                {photo.isCover && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                    Cover
                  </div>
                )}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                {!photo.isCover && (
                  <button
                    onClick={() => setCoverPhoto(index)}
                    className="absolute bottom-2 left-2 bg-white/90 text-gray-700 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Set as cover
                  </button>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                  <p className="text-white text-xs truncate">{photo.fileName || `Photo ${index + 1}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      {photos.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={photos[0]?.isCover || false}
              onChange={(e) => {
                if (e.target.checked && photos.length > 0) {
                  setCoverPhoto(0)
                }
              }}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-gray-700">Set first photo as cover image</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-gray-700">Enable photo gallery slider</span>
          </label>
        </div>
      )}
    </div>
  )
}

