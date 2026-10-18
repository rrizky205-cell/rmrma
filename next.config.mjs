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
  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
      { source: '/dashboard', destination: '/dashboard.html' },
      { source: '/admin', destination: '/admin.html' },
      { source: '/login', destination: '/login.html' },
      { source: '/register', destination: '/register.html' },
      { source: '/budget', destination: '/budget.html' },
      { source: '/wallet', destination: '/wallet.html' },
      { source: '/laporan', destination: '/laporan.html' },
      { source: '/settings', destination: '/settings.html' },
      { source: '/transaksi', destination: '/dashboard.html' },
    ];
  },
};

export default nextConfig;
