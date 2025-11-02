'use client'

import { useState } from 'react'
import ImageGallery from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'
import { Photo } from '@/types/publication'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface PhotoGalleryProps {
  photos: Photo[]
  startIndex?: number
  onClose?: () => void
}

export default function PhotoGallery({ photos, startIndex = 0, onClose }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex)

  if (photos.length === 0) {
    return null
  }

  const galleryImages = photos.map((photo) => ({
    original: photo.url,
    thumbnail: photo.thumbnailUrl || photo.url,
  }))

  return (
    <div className="photo-gallery-container">
      <ImageGallery
        items={galleryImages}
        startIndex={currentIndex}
        onSlide={(index) => setCurrentIndex(index)}
        showPlayButton={false}
        showFullscreenButton={true}
        showBullets={true}
        lazyLoad={true}
      />
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-colors"
          aria-label="Close gallery"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}

