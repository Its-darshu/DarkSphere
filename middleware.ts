import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

// Routes that don't require authentication (exact match)
const publicPaths = new Set(['/signin', '/signup', '/'])

// Routes that require admin role
const adminPaths = new Set([
  '/admin',
  '/admin/users',
  '/admin/posts',
  '/admin/reports',
  '/admin/logs',
  '/admin/roles',
])

function isAdminPath(pathname: string): boolean {
  return adminPaths.has(pathname) || pathname.startsWith('/admin/')
}

// Routes that require authentication
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const token = request.cookies.get('auth-token')?.value

  // Allow API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow public paths (exact match)
  if (publicPaths.has(pathname) || pathname === '/auth/callback') {
    // If user is already logged in, redirect them away from signin/signup
    if (token && (pathname === '/signin' || pathname === '/signup' || pathname === '/')) {
      const user = verifyToken(token)
      if (user) {
        return NextResponse.redirect(new URL(`/feed`, request.url)) // Or redirect to dashboard profile
      }
    }
    return NextResponse.next()
  }

  if (!token) {
    // Redirect to signin if not authenticated
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Check if this is an admin route
  if (isAdminPath(pathname)) {
    // Verify token and check role
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    // For admin routes, we can't check the role directly here
    // because that would require a database query in middleware
    // Instead, let the page component handle the authorization check
    // and redirect to /feed if not admin
  }

  // Token exists, proceed (API routes will verify token validity)
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protect all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
