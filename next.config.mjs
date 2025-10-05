/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  // Enable static generation optimizations
  generateEtags: false,
  poweredByHeader: false,
  // Disable static optimization for API routes
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Optimize for deployment
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: [],
  },
  // Optimize images and assets
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

export default nextConfig
