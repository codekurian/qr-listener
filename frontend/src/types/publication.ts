export type ContentType = 'SINGLE_PERSON' | 'COUPLE' | 'FAMILY'

export type PublicationStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED'

export interface Photo {
  id?: string
  url: string
  thumbnailUrl?: string
  fileName?: string
  file?: File
  isCover?: boolean
  order?: number
}

export interface Publication {
  id?: string
  contentType: ContentType
  primaryNames: string
  specialDate?: string
  slug: string
  story: string
  photos: Photo[]
  tags: string[]
  status: PublicationStatus
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  scheduledFor?: string
  viewCount?: number
  createdBy?: string
}

export interface PublicationFormData {
  contentType: ContentType
  primaryNames: string
  specialDate?: string
  slug: string
  story: string
  photos: Photo[]
  tags: string[]
  status: PublicationStatus
  scheduledFor?: string
}

export interface PublicationStats {
  totalPublications: number
  published: number
  drafts: number
  scheduled: number
  totalViews: number
}

