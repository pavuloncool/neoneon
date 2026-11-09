import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intl = createMiddleware(routing)

export default function proxy(request: NextRequest) {
  // Adresy stron tylko małymi literami: /pl/X/Slug-ABC → 301 → /pl/x/slug-abc (bez duplikatów w Google)
  const { pathname } = request.nextUrl
  if (pathname !== pathname.toLowerCase()) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.toLowerCase()
    return NextResponse.redirect(url, 301)
  }
  return intl(request)
}

export const config = {
  matcher: [
    '/((?!api|studio|stats|_next|_vercel|.*\\..*).*)',
  ],
}
