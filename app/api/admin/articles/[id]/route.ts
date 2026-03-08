// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminClient()
    const payload = await request.json()
    const { title, slug, excerpt, category, status, cover_image_url, content, tag_ids } = payload

    const { data: existing } = await supabase
      .from('articles')
      .select('published_at, status')
      .eq('id', id)
      .single()

    const prevStatus = existing ? existing.status : null
    const prevPublishedAt = existing ? existing.published_at : null
    const published_at = status === 'published' && prevStatus !== 'published'
      ? new Date().toISOString()
      : prevPublishedAt

    const { error } = await supabase
      .from('articles')
      .update({ title, slug, excerpt: excerpt || null, category, status, cover_image_url: cover_image_url || null, content: content || null, published_at })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('article_tags').delete().eq('article_id', id)
    if (tag_ids?.length > 0) {
      await supabase.from('article_tags').insert(
        tag_ids.map((tag_id: string) => ({ article_id: id, tag_id }))
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
