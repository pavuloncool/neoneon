'use client'

// components/admin/ImageUpload.tsx

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onUpload: (url: string) => void
  label?: string
}

export function ImageUpload({ onUpload, label = 'Upload image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Max file size is 5MB.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filename, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('images').getPublicUrl(filename)
      onUpload(data.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border border-dashed border-border px-6 py-5 text-center cursor-pointer transition-colors hover:border-ink',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
        <p className="text-xs tracking-widest text-muted uppercase">
          {uploading ? 'Uploading...' : label}
        </p>
        <p className="text-xs text-muted/60 mt-1">Click or drag & drop · max 5MB</p>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
