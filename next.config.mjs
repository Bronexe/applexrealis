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
  // Optimizaciones para desarrollo
  experimental: {
    // Reducir rebuilds innecesarios
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Mejorar rendimiento de Fast Refresh
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Configuración de webpack para mejor rendimiento
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimizar Fast Refresh
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
      
      // Reducir el número de archivos observados
      config.snapshot = {
        managedPaths: [/^(.+?[\\/]node_modules[\\/])(@.+?[\\/])?(.+?)([\\/]|$)/],
      }
    }
    
    return config
  },
  // Configuración de headers para mejor rendimiento
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
}

export default nextConfig
