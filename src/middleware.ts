export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/((?!login|setup|api/auth|api/health|_next/static|_next/image|favicon.ico).*)',
  ],
}
