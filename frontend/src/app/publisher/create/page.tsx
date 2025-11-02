'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import ContentWizard from '@/components/publisher/ContentWizard'
import { PublicationFormData } from '@/types/publication'
import { publicationApi } from '@/lib/api/publications'

export default function CreatePublicationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async (data: PublicationFormData) => {
    setIsSubmitting(true)
    try {
      console.log('Saving publication data:', data)
      await publicationApi.create(data)
      router.push('/publisher/dashboard')
    } catch (error: any) {
      console.error('Error saving publication:', error)
      let errorMessage = error?.response?.data?.message || error?.message || 'Failed to save publication. Please try again.'
      
      // Check for duplicate slug error
      if (error?.response?.data?.message?.includes('slug') || 
          error?.response?.data?.message?.includes('duplicate') ||
          error?.response?.status === 500) {
        const errorText = error?.response?.data?.message || ''
        if (errorText.includes('slug') || errorText.includes('duplicate')) {
          errorMessage = `The slug "${data.slug}" already exists. Please choose a different one.`
        } else {
          errorMessage = `Failed to save: ${errorText || 'Server error'}. Please check the slug is unique and try again.`
        }
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async (data: PublicationFormData) => {
    setIsSubmitting(true)
    try {
      console.log('Publishing publication data:', data)
      const publishData = { ...data, status: 'PUBLISHED' as const }
      await publicationApi.create(publishData)
      router.push('/publisher/dashboard')
    } catch (error: any) {
      console.error('Error publishing publication:', error)
      let errorMessage = error?.response?.data?.message || error?.message || 'Failed to publish publication. Please try again.'
      
      // Check for duplicate slug error
      if (error?.response?.data?.message?.includes('slug') || 
          error?.response?.data?.message?.includes('duplicate') ||
          error?.response?.status === 500) {
        const errorText = error?.response?.data?.message || ''
        if (errorText.includes('slug') || errorText.includes('duplicate')) {
          errorMessage = `The slug "${data.slug}" already exists. Please choose a different one.`
        } else {
          errorMessage = `Failed to publish: ${errorText || 'Server error'}. Please check the slug is unique and try again.`
        }
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="qr-admin-panel min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <ContentWizard onSave={handleSave} onPublish={handlePublish} />
          </div>
        </main>
      </div>
    </div>
  )
}

