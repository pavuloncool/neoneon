// app/api/draft-mode/disable/route.ts
// Wyłącza podgląd szkiców i wraca na stronę główną.

import { draftMode } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  ;(await draftMode()).disable()
  return NextResponse.redirect(new URL('/', request.url))
}
