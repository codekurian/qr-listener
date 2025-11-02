'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Link from 'next/link'
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { Publication, PublicationStats } from '@/types/publication'
import { format } from 'date-fns'
import { publicationApi } from '@/lib/api/publications'

export default function PublisherDashboard() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [stats, setStats] = useState<PublicationStats>({
    totalPublications: 0,
    published: 0,
    drafts: 0,
    scheduled: 0,
    totalViews: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'SCHEDULED'>('ALL')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [publicationsResponse, statsResponse] = await Promise.all([
          publicationApi.getAll(0, 100),
          publicationApi.getStats(),
        ])
        setPublications(publicationsResponse.content)
        setStats(statsResponse)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Set empty data on error
        setPublications([])
        setStats({
          totalPublications: 0,
          published: 0,
          drafts: 0,
          scheduled: 0,
          totalViews: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredPublications = publications.filter((pub) => {
    const matchesSearch = 
      pub.primaryNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = filterStatus === 'ALL' || pub.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <div className="qr-admin-panel min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="qr-admin-panel min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Content Publisher
                  </h1>
                  <p className="text-gray-600">
                    Manage biographies, stories, and family publications
                  </p>
                </div>
                <Link
                  href="/publisher/create"
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 shadow-md"
                >
                  <PlusIcon className="h-5 w-5" />
                  Create New
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Publications</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {stats.totalPublications}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Published</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {stats.published}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Drafts</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {stats.drafts}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {stats.totalViews}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, story, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Drafts</option>
                    <option value="SCHEDULED">Scheduled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Publications List */}
            <div className="bg-white rounded-lg shadow">
              {filteredPublications.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 text-lg mb-4">No publications found</p>
                  <Link
                    href="/publisher/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Create Your First Publication
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredPublications.map((publication) => (
                    <div
                      key={publication.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Cover Photo */}
                        {publication.photos.length > 0 && (
                          <div className="flex-shrink-0">
                            <img
                              src={publication.photos.find((p) => p.isCover)?.url || publication.photos[0].url}
                              alt={publication.primaryNames}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                {publication.primaryNames}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {publication.contentType === 'SINGLE_PERSON' && 'Single Person'}
                                {publication.contentType === 'COUPLE' && 'Couple'}
                                {publication.contentType === 'FAMILY' && 'Family'}
                              </p>
                              {publication.specialDate && (
                                <p className="text-sm text-gray-500 mb-2">
                                  {format(new Date(publication.specialDate), 'MMMM d, yyyy')}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mb-2">
                                {publication.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-block px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <p className="text-sm text-gray-500">
                                Created {publication.createdAt && format(new Date(publication.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                            
                            {/* Status Badge */}
                            <span
                              className={`
                                px-3 py-1 rounded-full text-xs font-medium
                                ${
                                  publication.status === 'PUBLISHED'
                                    ? 'bg-green-100 text-green-800'
                                    : publication.status === 'DRAFT'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                                }
                              `}
                            >
                              {publication.status}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {publication.status === 'PUBLISHED' && (
                            <a
                              href={`/p/${publication.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </a>
                          )}
                          <Link
                            href={`/publisher/edit/${publication.id}`}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete "${publication.primaryNames}"? This action cannot be undone.`)) {
                                try {
                                  await publicationApi.delete(publication.id)
                                  // Refresh the list
                                  const [publicationsResponse, statsResponse] = await Promise.all([
                                    publicationApi.getAll(0, 100),
                                    publicationApi.getStats(),
                                  ])
                                  setPublications(publicationsResponse.content)
                                  setStats(statsResponse)
                                } catch (error: any) {
                                  console.error('Error deleting publication:', error)
                                  alert('Failed to delete publication. Please try again.')
                                }
                              }
                            }}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

