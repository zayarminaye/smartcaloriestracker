/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  // PWA configuration
  experimental: {
    scrollRestoration: true,
  },
}

module.exports = nextConfig
