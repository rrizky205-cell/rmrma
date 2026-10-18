/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/index.html',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/dashboard.html',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/admin.html',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/login.html',
        permanent: false,
      },
      {
        source: '/register',
        destination: '/register.html',
        permanent: false,
      },
      {
        source: '/budget',
        destination: '/budget.html',
        permanent: false,
      },
      {
        source: '/wallet',
        destination: '/wallet.html',
        permanent: false,
      },
      {
        source: '/laporan',
        destination: '/laporan.html',
        permanent: false,
      },
      {
        source: '/settings',
        destination: '/settings.html',
        permanent: false,
      },
      {
        source: '/transaksi',
        destination: '/dashboard.html',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
