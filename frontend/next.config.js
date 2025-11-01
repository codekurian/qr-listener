/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  env: {
    // Authentication
    NEXT_PUBLIC_AUTH_ENABLED: process.env.NEXT_PUBLIC_AUTH_ENABLED || 'false',
    NEXT_PUBLIC_SKIP_AUTH: process.env.NEXT_PUBLIC_SKIP_AUTH || 'true',
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || 'true',
    
    // Providers
    NEXT_PUBLIC_GOOGLE_AUTH_ENABLED: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED || 'false',
    NEXT_PUBLIC_EMAIL_AUTH_ENABLED: process.env.NEXT_PUBLIC_EMAIL_AUTH_ENABLED || 'false',
    
    // API
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    
    // NextAuth (for when auth is enabled)
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'dev-client-id',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'dev-client-secret',
  },
  images: {
    domains: ['graceshoppee.tech', 'localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/qr/:path*',
        destination: 'http://backend:8080/api/qr/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://backend:8080/api/admin/:path*',
      },
      {
        source: '/api/generate/:path*',
        destination: 'http://backend:8080/api/generate/:path*',
      },
      {
        source: '/api/analytics/:path*',
        destination: 'http://backend:8080/api/analytics/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
