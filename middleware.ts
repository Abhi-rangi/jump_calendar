import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isSchedulePage = request.nextUrl.pathname.startsWith('/schedule')
  const isApiPage = request.nextUrl.pathname.startsWith('/api')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')

  // Allow public access to scheduling pages
  if (isSchedulePage) {
    return NextResponse.next()
  }

  // Redirect authenticated users from auth pages to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect dashboard pages
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Allow API routes to handle their own authentication
  if (isApiPage) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/schedule/:path*',
    '/api/:path*'
  ]
} 