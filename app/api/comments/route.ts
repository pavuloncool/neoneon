// app/api/comments/route.ts
// Zapisuje komentarz w Sanity jako szkic (niepubliczny) — pojawi się na stronie
// po zaznaczeniu „Zatwierdzony” w Studio. Chronione przez Cloudflare Turnstile;
// po zapisie wysyła powiadomienie mailem (Resend).

import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { client, writeClient } from '@/sanity/lib/client'
import { clientIp, verifyTurnstile } from '@/lib/turnstile'
import { escapeHtml } from '@/lib/utils'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { article_id, author_name, author_email, body, turnstileToken } = await request.json()

    if (!(await verifyTurnstile(turnstileToken, clientIp(request)))) {
      return NextResponse.json({ error: 'captcha' }, { status: 403 })
    }

    // Walidacja
    if (!article_id || !author_name || !author_email || !body) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }
    if (String(author_name).length > 100 || String(author_email).length > 200 || String(body).length > 5000) {
      return NextResponse.json({ error: 'Too long.' }, { status: 400 })
    }

    // Komentować można tylko opublikowany artykuł
    const articleTitle = await client.fetch<string | null>(
      '*[_type == "article" && _id == $id][0].title',
      { id: String(article_id) }
    )
    if (!articleTitle) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 })
    }

    const commentId = randomUUID()
    const comment = {
      authorName: String(author_name).trim(),
      authorEmail: String(author_email).trim().toLowerCase(),
      body: String(body).trim(),
    }

    try {
      await writeClient.create({
        _id: `drafts.${commentId}`,
        _type: 'comment',
        approved: false,
        article: { _type: 'reference', _ref: String(article_id), _weak: true },
        ...comment,
        submittedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Comment insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save comment.' },
        { status: 500 }
      )
    }

    // Powiadomienie — komentarz jest już zapisany, więc błąd maila tylko logujemy
    const studioUrl = `https://neoneon.online/studio/intent/edit/id=${commentId};type=comment`
    try {
      const { error } = await resend.emails.send({
        from: 'formularz@neoneon.online',
        to: 'ask@neoneon.online',
        subject: `Nowy komentarz: ${articleTitle}`,
        html: `
          <p><strong>Artykuł:</strong> ${escapeHtml(articleTitle)}</p>
          <p><strong>Autor:</strong> ${escapeHtml(comment.authorName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(comment.authorEmail)}</p>
          <p><strong>Komentarz:</strong></p>
          <p>${escapeHtml(comment.body)}</p>
          <p><a href="${studioUrl}">Otwórz w Studio, aby zatwierdzić lub usunąć →</a></p>
        `,
      })
      if (error) console.error('Comment notification error:', error)
    } catch (error) {
      console.error('Comment notification error:', error)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    )
  }
}
