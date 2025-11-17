const withNextIntl = require('next-intl/plugin')('./src/i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Remove static export to allow middleware and next-intl to work
  // output: 'export', // Commented out - incompatible with middleware and next-intl
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_PORTAL_TYPE: process.env.NEXT_PUBLIC_PORTAL_TYPE || 'citizen',
    _next_intl_trailing_slash: 'never',
  },
}

module.exports = withNextIntl(nextConfig)
