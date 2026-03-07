// app/api/comments/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const { article_id, author_name, author_email, body } = payload

    // Walidacja
    if (!article_id || !author_name || !author_email || !body) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('comments')
      .insert({
        article_id,
        author_name: author_name.trim(),
        author_email: author_email.trim().toLowerCase(),
        body: body.trim(),
      })

    if (error) {
      console.error('Comment insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save comment.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    )
  }
}
