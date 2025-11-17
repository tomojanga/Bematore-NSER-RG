const withNextIntl = require('next-intl/plugin')('./src/i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Disable image optimization  
  images: {
    unoptimized: true,
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_PORTAL_TYPE: process.env.NEXT_PUBLIC_PORTAL_TYPE || 'public',
  },
}

module.exports = withNextIntl(nextConfig)
