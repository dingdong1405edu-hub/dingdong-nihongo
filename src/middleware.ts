import { auth } from '@/lib/auth'

export default auth((req) => {
  const { nextUrl } = req
  // req.auth is the Session | null provided by NextAuth v5
  const session = req.auth
  const isLoggedIn = !!session

  const protectedPaths = [
    '/dashboard',
    '/vocab',
    '/grammar',
    '/kanji',
    '/kana',
    '/reading',
    '/listening',
    '/writing',
    '/speaking',
  ]
  const adminPaths = ['/admin']

  const isProtected = protectedPaths.some((p) => nextUrl.pathname.startsWith(p))
  const isAdmin = adminPaths.some((p) => nextUrl.pathname.startsWith(p))

  // Admin routes: must be logged in AND have ADMIN role
  if (isAdmin) {
    if (!isLoggedIn || session?.user?.role !== 'ADMIN') {
      return Response.redirect(new URL('/dashboard', nextUrl))
    }
  }

  // Protected routes: must be logged in
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return Response.redirect(loginUrl)
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|audio).*)'],
}
