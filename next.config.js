/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/pages/tours.html', destination: '/tours', permanent: true },
      { source: '/pages/login.html', destination: '/login', permanent: true },
      { source: '/pages/register.html', destination: '/register', permanent: true },
      { source: '/pages/my-bookings.html', destination: '/my-bookings', permanent: true },
      { source: '/pages/booking-detail.html', destination: '/my-bookings', permanent: true },
      { source: '/pages/tour-detail.html', destination: '/tours', permanent: false },
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/admin/index.html', destination: '/admin', permanent: true },
      { source: '/admin/login.html', destination: '/admin/login', permanent: true },
      { source: '/admin/pages/:path*.html', destination: '/admin/:path*', permanent: true },
    ];
  },
};

module.exports = nextConfig;
