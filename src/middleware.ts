export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/((?!login|setup|api/auth|api/health|api/admin/users/count|_next/static|_next/image|favicon.ico).*)',
  ],
}
