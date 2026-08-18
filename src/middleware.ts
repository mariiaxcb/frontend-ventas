import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_KEYS, ROUTES } from '@/lib/constants'

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_KEYS.AUTH_TOKEN)?.value
  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith(ROUTES.LOGIN)

  if (!token && !isAuthRoute) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (token && isAuthRoute) {
    const dashboardUrl = new URL(ROUTES.DASHBOARD, request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
