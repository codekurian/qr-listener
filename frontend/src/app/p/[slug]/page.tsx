'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import PhotoGallery from '@/components/publisher/PhotoGallery'
import { Publication, Photo } from '@/types/publication'
import { 
  ShareIcon, 
  PrinterIcon
} from '@heroicons/react/24/outline'
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
} from 'react-share'
import { format } from 'date-fns'
import { publicationApi } from '@/lib/api/publications'

export default function PublicPublicationPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [publication, setPublication] = useState<Publication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showGallery, setShowGallery] = useState(false)
  const [galleryStartIndex, setGalleryStartIndex] = useState(0)

  useEffect(() => {
    const fetchPublication = async () => {
      setIsLoading(true)
      try {
        const data = await publicationApi.getBySlug(slug)
        setPublication(data)
      } catch (error) {
        console.error('Error fetching publication:', error)
        setPublication(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchPublication()
    }
  }, [slug])

  const openGallery = (index: number) => {
    setGalleryStartIndex(index)
    setShowGallery(true)
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!publication) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Publication Not Found</h1>
          <p className="text-gray-600">The publication you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const coverPhoto = publication.photos.find((p) => p.isCover) || publication.photos[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">Content Publisher</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print"
            >
              <PrinterIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Cover Photo */}
        {coverPhoto && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <img
              src={coverPhoto.url}
              alt={publication.primaryNames}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
            {publication.primaryNames}
          </h1>
          {publication.specialDate && (
            <p className="text-xl text-gray-600 font-serif">
              {format(new Date(publication.specialDate), 'MMMM d, yyyy')}
            </p>
          )}
        </div>

        <div className="border-t border-gray-300 my-8"></div>

        {/* Story Content */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">📖 Their Story</h2>
          <div
            className="prose prose-lg max-w-none prose-headings:font-serif prose-p:text-gray-700 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: publication.story }}
          />
        </section>

        <div className="border-t border-gray-300 my-8"></div>

        {/* Photo Gallery */}
        {publication.photos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">📸 Photo Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {publication.photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => openGallery(index)}
                  className="relative group rounded-lg overflow-hidden aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="border-t border-gray-300 my-8"></div>

        {/* Share Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">💬 Share This Page</h2>
          <div className="flex flex-wrap gap-3">
            <FacebookShareButton url={currentUrl} title={publication.primaryNames}>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <span>Facebook</span>
              </div>
            </FacebookShareButton>
            <TwitterShareButton url={currentUrl} title={publication.primaryNames}>
              <div className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors cursor-pointer">
                <span>Twitter</span>
              </div>
            </TwitterShareButton>
            <WhatsappShareButton url={currentUrl} title={publication.primaryNames}>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                <span>WhatsApp</span>
              </div>
            </WhatsappShareButton>
            <EmailShareButton url={currentUrl} subject={publication.primaryNames}>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <span>Email</span>
              </div>
            </EmailShareButton>
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentUrl)
                alert('Link copied to clipboard!')
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ShareIcon className="h-5 w-5" />
              <span>Copy Link</span>
            </button>
          </div>
        </section>
      </main>

      {/* Photo Gallery Modal */}
      {showGallery && publication.photos.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="w-full h-full max-w-6xl max-h-full p-4">
            <PhotoGallery
              photos={publication.photos}
              startIndex={galleryStartIndex}
              onClose={() => setShowGallery(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

