// @ts-nocheck
// app/api/admin/tags/route.ts

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, slug } = await request.json()
    if (!name || !slug) return NextResponse.json({ error: 'name and slug required.' }, { status: 400 })

    const { data, error } = await supabase
      .from('tags')
      .insert({ name, slug })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
