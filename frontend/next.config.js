/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  turbopack: {
    root: __dirname,
  },
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  async rewrites() {
    const apiPath = (process.env.NEXT_PUBLIC_API_ENDPOINT || '/api').replace(/\/+$/, '');
    const backendUrl = (process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000')).replace(/\/+$/, '');
    const destination =
      apiPath === '/api' && backendUrl
        ? `${backendUrl}/api/:path*`
        : `${apiPath}/:path*`;
    return [
      {
        source: '/api/:path*',
        destination,
      },
    ];
  },
};

module.exports = nextConfig;
