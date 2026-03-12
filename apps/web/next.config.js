/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@co-banking/shared'],
  experimental: { typedRoutes: false },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Co-Banking System',
  },
};
module.exports = nextConfig;
