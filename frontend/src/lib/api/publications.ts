import axios from 'axios'
import { Publication, PublicationFormData, PublicationStats } from '@/types/publication'

// Use relative URLs when accessed through Nginx (same origin)
// This avoids CORS issues by using the same port (8080) for both frontend and API
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: Use relative URL when on production domain through Nginx
    const currentHost = window.location.hostname
    const currentPort = window.location.port
    
    // If accessing through Nginx on port 8080, use relative URLs
    if (currentHost === 'graceshoppee.tech' || currentHost === 'www.graceshoppee.tech') {
      if (currentPort === '8080' || currentPort === '') {
        // Same origin - use relative URLs (no CORS)
        return ''
      }
    }
  }
  
  // Fallback to environment variable or default
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
}

const API_BASE_URL = getApiBaseUrl()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface PublicationApiResponse {
  id: number
  contentType: string
  primaryNames: string
  specialDate?: string
  slug: string
  story: string
  tags: string[]
  status: string
  scheduledFor?: string
  viewCount?: number
  createdBy?: string
  createdAt: string
  updatedAt?: string
  publishedAt?: string
  photos: Array<{
    id?: number
    fileUrl: string
    thumbnailUrl?: string
    fileName?: string
    isCover?: boolean
    displayOrder?: number
  }>
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

function mapApiResponseToPublication(response: PublicationApiResponse): Publication {
  // Use the same API base URL logic for image URLs
  const apiBaseUrl = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  
  return {
    id: response.id?.toString(),
    contentType: response.contentType as 'SINGLE_PERSON' | 'COUPLE' | 'FAMILY',
    primaryNames: response.primaryNames,
    specialDate: response.specialDate,
    slug: response.slug,
    story: response.story,
    tags: response.tags || [],
    status: response.status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED',
    scheduledFor: response.scheduledFor,
    viewCount: response.viewCount,
    createdBy: response.createdBy,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    publishedAt: response.publishedAt,
    photos: response.photos?.map((photo) => {
      // If URL is a relative path (starts with 'api/'), prepend API base URL
      // Otherwise use as-is (for base64 data URLs or external URLs)
      let photoUrl = photo.fileUrl || ''
      let thumbUrl = photo.thumbnailUrl || photoUrl
      
      // Handle relative API paths - prepend base URL if needed
      if (photoUrl.startsWith('/api/')) {
        photoUrl = `${apiBaseUrl}${photoUrl}`
      } else if (photoUrl.startsWith('api/')) {
        photoUrl = `${apiBaseUrl}/${photoUrl}`
      }
      
      if (thumbUrl.startsWith('/api/')) {
        thumbUrl = `${apiBaseUrl}${thumbUrl}`
      } else if (thumbUrl.startsWith('api/')) {
        thumbUrl = `${apiBaseUrl}/${thumbUrl}`
      }
      
      return {
        id: photo.id?.toString(),
        url: photoUrl,
        thumbnailUrl: thumbUrl,
        fileName: photo.fileName,
        isCover: photo.isCover,
        order: photo.displayOrder,
      }
    }) || [],
  }
}

export const publicationApi = {
  // Create publication
  async create(data: PublicationFormData, userId: string = 'admin'): Promise<Publication> {
    // TODO: Handle photo uploads to storage service (S3/Cloudinary)
    // For now, we use base64 data URLs from FileReader
    // Filter out File objects and only send serializable data
    const photosPayload = (data.photos || []).map((photo, index) => {
      // Extract just the URL (which is a base64 data URL from FileReader)
      // Remove the File object as it cannot be serialized
      return {
        fileUrl: photo.url || '', // This is the base64 data URL
        thumbnailUrl: photo.thumbnailUrl || photo.url || '',
        fileName: photo.fileName || `photo-${index + 1}.jpg`,
        isCover: photo.isCover || index === 0,
        displayOrder: photo.order !== undefined ? photo.order : index,
      }
    })

    const requestPayload = {
      contentType: data.contentType,
      primaryNames: data.primaryNames,
      specialDate: data.specialDate ? new Date(data.specialDate).toISOString() : null,
      slug: data.slug,
      story: data.story,
      tags: data.tags || [],
      status: data.status || 'DRAFT',
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor).toISOString() : null,
      photos: photosPayload,
    }

    console.log('Sending publication request:', {
      ...requestPayload,
      photos: photosPayload.length,
      storyLength: requestPayload.story?.length,
    })

    const response = await api.post<PublicationApiResponse>('/api/publisher/publications', requestPayload, {
      headers: {
        'X-User-Id': userId,
      },
    })
    return mapApiResponseToPublication(response.data)
  },

  // Get all publications
  async getAll(page: number = 0, size: number = 10, sortBy: string = 'createdAt', sortDirection: string = 'desc'): Promise<PagedResponse<Publication>> {
    const response = await api.get<PagedResponse<PublicationApiResponse>>('/api/publisher/publications', {
      params: { page, size, sortBy, sortDirection },
    })
    return {
      ...response.data,
      content: response.data.content.map(mapApiResponseToPublication),
    }
  },

  // Get publication by ID
  async getById(id: string): Promise<Publication> {
    const response = await api.get<PublicationApiResponse>(`/api/publisher/publications/${id}`)
    return mapApiResponseToPublication(response.data)
  },

  // Get publication by slug (public)
  async getBySlug(slug: string): Promise<Publication> {
    const response = await api.get<PublicationApiResponse>(`/api/public/publications/${slug}`)
    return mapApiResponseToPublication(response.data)
  },

  // Search publications
  async search(query: string, status: string = 'ALL', page: number = 0, size: number = 10): Promise<PagedResponse<Publication>> {
    const response = await api.get<PagedResponse<PublicationApiResponse>>('/api/publisher/publications/search', {
      params: { query, status, page, size },
    })
    return {
      ...response.data,
      content: response.data.content.map(mapApiResponseToPublication),
    }
  },

  // Update publication
  async update(id: string, data: Partial<PublicationFormData>): Promise<Publication> {
    // Convert photos similar to create method
    const photosPayload = (data.photos || []).map((photo, index) => {
      return {
        fileUrl: photo.url || '',
        thumbnailUrl: photo.thumbnailUrl || photo.url || '',
        fileName: photo.fileName || `photo-${index + 1}.jpg`,
        isCover: photo.isCover || index === 0,
        displayOrder: photo.order !== undefined ? photo.order : index,
      }
    })

    const requestPayload = {
      contentType: data.contentType,
      primaryNames: data.primaryNames,
      specialDate: data.specialDate ? new Date(data.specialDate).toISOString() : null,
      slug: data.slug,
      story: data.story,
      tags: data.tags || [],
      status: data.status,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor).toISOString() : null,
      photos: photosPayload,
    }

    const response = await api.put<PublicationApiResponse>(`/api/publisher/publications/${id}`, requestPayload)
    return mapApiResponseToPublication(response.data)
  },

  // Delete publication
  async delete(id: string): Promise<void> {
    await api.delete(`/api/publisher/publications/${id}`)
  },

  // Get stats
  async getStats(): Promise<PublicationStats> {
    const response = await api.get<{
      totalPublications: number
      published: number
      drafts: number
      scheduled: number
      totalViews: number
    }>('/api/publisher/publications/stats')
    return {
      totalPublications: response.data.totalPublications,
      published: response.data.published,
      drafts: response.data.drafts,
      scheduled: response.data.scheduled,
      totalViews: response.data.totalViews,
    }
  },
}

