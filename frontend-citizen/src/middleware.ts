/**
 * i18n Middleware for Next.js
 * Handles language routing and locale detection
 */
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/i18n.config'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)'
  ]
}
