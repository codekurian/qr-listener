'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { 
  BoldIcon, 
  ItalicIcon, 
  ListBulletIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState } from 'react'

interface RichTextEditorClientProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditorClient({ content, onChange, placeholder = 'Write your story here...' }: RichTextEditorClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Disable Link from StarterKit to avoid duplicate with Link extension
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-amber-600 hover:text-amber-700 underline',
        },
      }),
    ],
    content: mounted ? content : '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
    immediatelyRender: false,
    enabled: mounted,
  }, [mounted])

  // Update editor content when it changes from props (but only if different)
  useEffect(() => {
    if (editor && mounted && content && editor.getHTML() !== content) {
      const currentContent = editor.getHTML()
      // Only update if content actually changed to avoid infinite loops
      if (currentContent !== content) {
        editor.commands.setContent(content, false) // false = don't add to history
      }
    }
  }, [content, editor, mounted])

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  // Don't render editor until mounted to avoid SSR hydration issues
  if (!mounted || !editor) {
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

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap items-center gap-2">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`
            p-2 rounded hover:bg-gray-200 transition-colors text-gray-700
            ${editor.isActive('bold') ? 'bg-gray-300 text-gray-900' : 'bg-transparent'}
          `}
          title="Bold"
        >
          <BoldIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`
            p-2 rounded hover:bg-gray-200 transition-colors text-gray-700
            ${editor.isActive('italic') ? 'bg-gray-300 text-gray-900' : 'bg-transparent'}
          `}
          title="Italic"
        >
          <ItalicIcon className="h-5 w-5" />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`
            p-2 rounded hover:bg-gray-200 transition-colors text-sm font-bold text-gray-700
            ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 text-gray-900' : 'bg-transparent'}
          `}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`
            p-2 rounded hover:bg-gray-200 transition-colors text-sm font-bold text-gray-700
            ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 text-gray-900' : 'bg-transparent'}
          `}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`
            p-2 rounded hover:bg-gray-200 transition-colors text-sm font-bold text-gray-700
            ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 text-gray-900' : 'bg-transparent'}
          `}
          title="Heading 3"
        >
          H3
        </button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`
            p-2 rounded hover:bg-gray-200 transition-colors text-gray-700
            ${editor.isActive('bulletList') ? 'bg-gray-300 text-gray-900' : 'bg-transparent'}
          `}
          title="Bullet List"
        >
          <ListBulletIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`
            p-2 rounded hover:bg-gray-200 transition-colors text-gray-700
            ${editor.isActive('orderedList') ? 'bg-gray-300 text-gray-900' : 'bg-transparent'}
          `}
          title="Numbered List"
        >
          1.
        </button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Link */}
        <button
          onClick={setLink}
          className={`
            p-2 rounded hover:bg-gray-200 transition-colors text-gray-700
            ${editor.isActive('link') ? 'bg-gray-300 text-gray-900' : 'bg-transparent'}
          `}
          title="Add Link"
        >
          <LinkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="min-h-[300px]" />

      {/* Tips */}
      <div className="border-t border-gray-200 bg-amber-50 p-3 text-sm text-gray-700">
        <p className="font-medium mb-1">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Tell their story, achievements, and meaningful moments</li>
          <li>Add meaningful quotes and memories</li>
          <li>Include dates and locations when relevant</li>
        </ul>
      </div>
    </div>
  )
}

