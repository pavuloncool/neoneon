// app/api/comments/route.ts
// Zapisuje komentarz w Sanity jako szkic — pojawi się na stronie po „Publish” w Studio.

import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { client, writeClient } from '@/sanity/lib/client'

export async function POST(request: Request) {
  try {
    const { article_id, author_name, author_email, body } = await request.json()

    // Walidacja
    if (!article_id || !author_name || !author_email || !body) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }

    // Komentować można tylko opublikowany artykuł
    const articleExists = await client.fetch<boolean>(
      'defined(*[_type == "article" && _id == $id][0]._id)',
      { id: String(article_id) }
    )
    if (!articleExists) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 })
    }

    try {
      await writeClient.create({
        _id: `drafts.${randomUUID()}`,
        _type: 'comment',
        article: { _type: 'reference', _ref: String(article_id), _weak: true },
        authorName: String(author_name).trim(),
        authorEmail: String(author_email).trim().toLowerCase(),
        body: String(body).trim(),
        submittedAt: new Date().toISOString(),
      })
    } catch (error) {
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
