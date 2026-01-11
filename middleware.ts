import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes protection
    if (pathname.startsWith('/admin') && token?.email !== 'admin@wordflow.ge') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes
        if (
          pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/forgot-password') ||
          pathname.startsWith('/reset-password') ||
          pathname.startsWith('/api/auth')
        ) {
          return true
        }

        // Protected routes require token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/courses/:path*',
    '/learn/:path*',
    '/achievements/:path*',
    '/leaderboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/mistakes/:path*',
    '/admin/:path*',
  ],
}
