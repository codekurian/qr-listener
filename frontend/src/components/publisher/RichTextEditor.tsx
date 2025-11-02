'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

// Dynamically import the editor with SSR disabled to avoid hydration issues
const RichTextEditorClient = dynamic(
  () => import('./RichTextEditorClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <div className="min-h-[300px] p-4 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-2"></div>
            <p>Loading editor...</p>
          </div>
        </div>
      </div>
    )
  }
)

export default function RichTextEditor(props: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render the client component after mount to prevent SSR issues
  if (!mounted) {
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <div className="min-h-[300px] p-4 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-2"></div>
            <p>Loading editor...</p>
          </div>
        </div>
      </div>
    )
  }

  return <RichTextEditorClient {...props} />
}

