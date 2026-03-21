// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields required.' }, { status: 400 })
    }

    const supabase = await createClient()
    await supabase.from('contacts').insert({ name, email, message })

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'ask@neoneon.online',
      subject: `Nowa wiadomość od ${name}`,
      html: `
        <p><strong>Imię:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Wiadomość:</strong></p>
        <p>${message}</p>
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
