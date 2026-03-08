// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminClient()
    const payload = await request.json()
    const { title, slug, excerpt, category, status, cover_image_url, content, tag_ids } = payload

    const finalSlug = slug || slugify(title)
    const published_at = status === 'published' ? new Date().toISOString() : null

    const { data: article, error } = await supabase
      .from('articles')
      .insert({ title, slug: finalSlug, excerpt: excerpt || null, category, status, cover_image_url: cover_image_url || null, content: content || null, published_at })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (tag_ids?.length > 0) {
      await supabase.from('article_tags').insert(
        tag_ids.map((tag_id: string) => ({ article_id: article.id, tag_id }))
      )
    }

    return NextResponse.json(article, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
