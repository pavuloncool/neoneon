'use client'

// components/admin/TiptapEditor.tsx

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

interface TiptapEditorProps {
  content: object | null
  onChange: (content: object) => void
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Youtube.configure({ width: 640, height: 360 }),
    ],
    content: content ?? undefined,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] px-1 py-2',
      },
    },
  })

  if (!editor) return null

  const ToolbarButton = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'px-2.5 py-1.5 text-xs border transition-colors',
        active
          ? 'border-[#0f0f0f] bg-[#0f0f0f] text-[#fafaf8]'
          : 'border-transparent text-[#0f0f0f] hover:text-[#0f0f0f] hover:border-[#e5e5e0]'
      )}
    >
      {children}
    </button>
  )

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Max file size is 5MB.')
      return
    }

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage
      .from('images')
      .upload(filename, file, { cacheControl: '3600', upsert: false })
    if (error) {
      alert('Upload failed: ' + error.message)
      return
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filename)
    editor.chain().focus().setImage({ src: data.publicUrl }).run()
  }

  function addLink() {
    const url = window.prompt('URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  function addYoutube() {
    const url = window.prompt('YouTube URL')
    if (url) editor.commands.setYoutubeVideo({ src: url })
  }

  return (
    <div className="border border-[#e5e5e0]">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageUpload(file)
          e.target.value = ''
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-[#e5e5e0] bg-[#fafaf8]">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <em>I</em>
        </ToolbarButton>

        <span className="w-px h-4 bg-[#e5e5e0] mx-1" />

        {[2, 3, 4].map((level) => (
          <ToolbarButton
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level: level as 2 | 3 | 4 }).run()}
            active={editor.isActive('heading', { level })}
            title={`Heading ${level}`}
          >
            H{level}
          </ToolbarButton>
        ))}

        <span className="w-px h-4 bg-[#e5e5e0] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          • List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
          1. List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          &ldquo;&rdquo;
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
          {'</>'}
        </ToolbarButton>

        <span className="w-px h-4 bg-[#e5e5e0] mx-1" />

        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Add link">
          Link
        </ToolbarButton>
        <ToolbarButton onClick={() => imageInputRef.current?.click()} title="Upload image">
          Image
        </ToolbarButton>
        <ToolbarButton onClick={addYoutube} title="Add YouTube">
          YT
        </ToolbarButton>

        <span className="w-px h-4 bg-[#e5e5e0] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          ↩
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          ↪
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="px-4 py-4 bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
