// app/api/admin/articles/route.ts

import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient()

    // Weryfikacja sesji
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await request.json()
    const { title, slug, excerpt, category, status, cover_image_url, content, tag_ids } = payload

    if (!title || !slug || !category) {
      return NextResponse.json({ error: 'title, slug and category are required.' }, { status: 400 })
    }

    const finalSlug = slug || slugify(title)

    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        category,
        status,
        cover_image_url: cover_image_url || null,
        content: content || null,
        published_at: status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Article insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Zapisz tagi
    if (tag_ids && tag_ids.length > 0) {
      await supabase.from('article_tags').insert(
        tag_ids.map((tag_id: string) => ({ article_id: article.id, tag_id }))
      )
    }

    return NextResponse.json({ id: article.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
