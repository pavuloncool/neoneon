// app/api/contact/route.ts
// Wiadomość trafia mailem (Resend) i jako szkic do Sanity (widoczna tylko w Studio).

import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { writeClient } from '@/sanity/lib/client'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields required.' }, { status: 400 })
    }

    // Kopia w Sanity — błąd zapisu nie blokuje wysyłki maila (jak wcześniej w Supabase)
    try {
      await writeClient.create({
        _id: `drafts.${randomUUID()}`,
        _type: 'contactMessage',
        name: String(name),
        email: String(email),
        message: String(message),
        submittedAt: new Date().toISOString(),
      })
    } catch (e) {
      console.error('Contact save error:', e)
    }

    const { data, error } = await resend.emails.send({
      from: 'formularz@neoneon.online',
      to: 'ask@neoneon.online',
      subject: `Nowa wiadomość od ${name}`,
      html: `
        <p><strong>Imię:</strong> ${escapeHtml(String(name))}</p>
        <p><strong>Email:</strong> ${escapeHtml(String(email))}</p>
        <p><strong>Wiadomość:</strong></p>
        <p>${escapeHtml(String(message))}</p>
      `,
    })

    console.log('Resend response:', { data, error })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Contact error:', e)
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
