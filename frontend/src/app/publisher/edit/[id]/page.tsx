'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import ContentWizard from '@/components/publisher/ContentWizard'
import { PublicationFormData } from '@/types/publication'
import { publicationApi } from '@/lib/api/publications'

export default function EditPublicationPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [initialData, setInitialData] = useState<Partial<PublicationFormData> | null>(null)

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const publication = await publicationApi.getById(id)
        setInitialData({
          contentType: publication.contentType,
          primaryNames: publication.primaryNames,
          specialDate: publication.specialDate,
          slug: publication.slug,
          story: publication.story,
          tags: publication.tags,
          status: publication.status,
          scheduledFor: publication.scheduledFor,
          photos: publication.photos,
        })
      } catch (error: any) {
        console.error('Error fetching publication:', error)
        alert('Failed to load publication. Redirecting...')
        router.push('/publisher/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchPublication()
    }
  }, [id, router])

  const handleSave = async (data: PublicationFormData) => {
    setIsSubmitting(true)
    try {
      console.log('Updating publication:', id, data)
      await publicationApi.update(id, data)
      router.push('/publisher/dashboard')
    } catch (error: any) {
      console.error('Error updating publication:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update publication. Please try again.'
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async (data: PublicationFormData) => {
    setIsSubmitting(true)
    try {
      console.log('Publishing publication:', id, data)
      const publishData = { ...data, status: 'PUBLISHED' as const }
      await publicationApi.update(id, publishData)
      router.push('/publisher/dashboard')
    } catch (error: any) {
      console.error('Error publishing publication:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to publish publication. Please try again.'
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="qr-admin-panel min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!initialData) {
    return null
  }

  return (
    <div className="qr-admin-panel min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Edit Publication
              </h1>
              <p className="text-gray-600">
                Update the publication details below
              </p>
            </div>

            {isSubmitting && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">Saving changes...</p>
              </div>
            )}

            <ContentWizard
              initialData={initialData}
              onSave={handleSave}
              onPublish={handlePublish}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

