'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ContentType, PublicationFormData, Photo } from '@/types/publication'
import PhotoUpload from './PhotoUpload'
import RichTextEditor from './RichTextEditor'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  UserIcon,
  PhotoIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

const formSchema = z.object({
  contentType: z.enum(['SINGLE_PERSON', 'COUPLE', 'FAMILY']),
  primaryNames: z.string().min(1, 'Primary name(s) is required'),
  specialDate: z.string().optional(),
  slug: z.string().min(1, 'Slug is required'),
  story: z.string().min(10, 'Story must be at least 10 characters'),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).optional(),
})

type FormData = z.infer<typeof formSchema>

interface ContentWizardProps {
  onSave?: (data: PublicationFormData) => void
  onPublish?: (data: PublicationFormData) => void
  initialData?: Partial<PublicationFormData>
}

export default function ContentWizard({ onSave, onPublish, initialData }: ContentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [photos, setPhotos] = useState<Photo[]>(initialData?.photos || [])
  const [story, setStory] = useState(initialData?.story || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [scheduledFor, setScheduledFor] = useState(initialData?.scheduledFor || '')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentType: initialData?.contentType || 'SINGLE_PERSON',
      primaryNames: initialData?.primaryNames || '',
      specialDate: initialData?.specialDate || '',
      slug: initialData?.slug || '',
      story: initialData?.story || '',
      tags: initialData?.tags || [],
      status: initialData?.status || 'DRAFT',
    },
  })

  const contentType = watch('contentType')
  const primaryNames = watch('primaryNames')

  // Auto-generate slug from primary names
  const generateSlug = (names: string) => {
    return names
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNamesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue('primaryNames', value)
    if (!slug || slug === generateSlug(primaryNames)) {
      const newSlug = generateSlug(value)
      setSlug(newSlug)
      setValue('slug', newSlug)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updated = [...tags, newTag.trim()]
      setTags(updated)
      setValue('tags', updated)
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const updated = tags.filter((tag) => tag !== tagToRemove)
    setTags(updated)
    setValue('tags', updated)
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = (data: FormData) => {
    // Ensure story is up to date from the state
    const finalStory = story || data.story || ''
    
    // Validate story length before submitting
    if (finalStory.length < 10) {
      setCurrentStep(3) // Go back to story step
      setValue('story', finalStory, { shouldValidate: true })
      return
    }

    const publicationData: PublicationFormData = {
      ...data,
      story: finalStory,
      photos,
      tags,
      scheduledFor: scheduledFor || undefined,
    }

    if (data.status === 'PUBLISHED') {
      onPublish?.(publicationData)
    } else {
      onSave?.(publicationData)
    }
  }

  const steps = [
    { number: 1, title: 'Basic Information', icon: UserIcon },
    { number: 2, title: 'Add Photos', icon: PhotoIcon },
    { number: 3, title: 'Write Story', icon: DocumentTextIcon },
    { number: 4, title: 'Preview & Publish', icon: EyeIcon },
  ]

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(); }} className="bg-white rounded-lg shadow-lg">
      {/* Step Indicator */}
      <div className="border-b border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create New Publication</h2>
          <span className="text-xs sm:text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-2">
          {steps.map((step) => {
            const isActive = step.number === currentStep
            const isCompleted = step.number < currentStep
            const Icon = step.icon

            return (
              <div key={step.number} className="flex items-center flex-shrink-0">
                <div className="flex items-center">
                  <div
                    className={`
                      flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex-shrink-0
                      ${
                        isActive
                          ? 'border-amber-500 bg-amber-50 text-amber-600'
                          : isCompleted
                          ? 'border-green-500 bg-green-50 text-green-600'
                          : 'border-gray-300 bg-gray-50 text-gray-400'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium">{step.title}</span>
                </div>
                {step.number < steps.length && (
                  <div
                    className={`w-4 sm:w-8 md:w-12 lg:w-16 h-0.5 mx-2 sm:mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4 sm:p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👤 Who is this about?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {(['SINGLE_PERSON', 'COUPLE', 'FAMILY'] as ContentType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue('contentType', type)}
                    className={`
                      p-4 border-2 rounded-lg text-center transition-colors
                      ${
                        contentType === type
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="font-medium text-gray-700">
                      {type === 'SINGLE_PERSON' && 'Single Person'}
                      {type === 'COUPLE' && 'Couple'}
                      {type === 'FAMILY' && 'Family'}
                    </div>
                  </button>
                ))}
              </div>
              {errors.contentType && (
                <p className="text-red-600 text-sm mt-1">{errors.contentType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Primary Name(s)
              </label>
              <input
                {...register('primaryNames')}
                onChange={handleNamesChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white"
                placeholder="John & Jane Doe"
              />
              {errors.primaryNames && (
                <p className="text-red-600 text-sm mt-1">{errors.primaryNames.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Special Date (Optional)
              </label>
              <input
                {...register('specialDate')}
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white"
              />
            </div>
          </div>
        )}

        {/* Step 2: Photo Upload */}
        {currentStep === 2 && (
          <div>
            <PhotoUpload photos={photos} onPhotosChange={setPhotos} maxPhotos={10} />
          </div>
        )}

        {/* Step 3: Content Writing */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ✍️ Biography / Story
              </label>
              <RichTextEditor 
                content={story} 
                onChange={(newContent) => {
                  setStory(newContent)
                  setValue('story', newContent, { shouldValidate: true })
                }} 
              />
              <input type="hidden" {...register('story')} value={story} />
              {errors.story && (
                <p className="text-red-600 text-sm mt-1">{errors.story.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📋 Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-amber-600 hover:text-amber-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Add tag"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preview & Publish */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔗 Publication URL
              </label>
              <div className="flex gap-2">
                <input
                  {...register('slug')}
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value)
                    setValue('slug', e.target.value)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white"
                  placeholder="john-jane-doe"
                />
                <button
                  type="button"
                  onClick={() => {
                    // Use current origin (port 8080 through Nginx) or fallback to env
                    const baseUrl = typeof window !== 'undefined' 
                      ? window.location.origin 
                      : (process.env.NEXT_PUBLIC_BASE_URL || 'http://graceshoppee.tech:8080')
                    const fullUrl = `${baseUrl}/p/${slug}`
                    navigator.clipboard.writeText(fullUrl)
                    alert('Link copied to clipboard!')
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Copy Link
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {typeof window !== 'undefined' 
                  ? `${window.location.origin}/p/${slug}`
                  : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://graceshoppee.tech:8080'}/p/${slug}`}
              </p>
              {errors.slug && (
                <p className="text-red-600 text-sm mt-1">{errors.slug.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                ⚙️ Publishing Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    {...register('status')}
                    value="PUBLISHED"
                    defaultChecked={initialData?.status === 'PUBLISHED'}
                    className="text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="text-gray-700 text-sm sm:text-base">Publish immediately</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    {...register('status')}
                    value="DRAFT"
                    defaultChecked={initialData?.status !== 'PUBLISHED'}
                    className="text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="text-gray-700 text-sm sm:text-base">Save as draft</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    {...register('status')}
                    value="SCHEDULED"
                    defaultChecked={initialData?.status === 'SCHEDULED'}
                    className="text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="text-gray-700 text-sm sm:text-base">Schedule for later</span>
                </label>
              </div>
              {watch('status') === 'SCHEDULED' && (
                <div className="mt-3">
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                {photos.length > 0 && photos[0].isCover && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={photos.find((p) => p.isCover)?.url || photos[0].url}
                      alt="Cover"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                <h2 className="text-2xl font-bold mb-2">{primaryNames}</h2>
                {watch('specialDate') && (
                  <p className="text-gray-600 mb-4">
                    {new Date(watch('specialDate')!).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: story || '<p class="text-gray-400">Story preview...</p>' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Back</span>
        </button>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {currentStep === 4 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setValue('status', 'PUBLISHED')
                  handleSubmit(onSubmit)()
                }}
                className="px-4 sm:px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium text-sm sm:text-base"
              >
                Publish Now
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setValue('status', 'DRAFT')
                  handleSubmit(onSubmit)()
                }}
                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Save Draft
              </button>
            </>
          )}
          {currentStep < 4 && (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 sm:px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>Next</span>
              <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>
      </div>
    </form>
  )
}

