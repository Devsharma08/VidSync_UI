import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PERFORMANCE & COMPILATION SPEED
  reactCompiler: true,                 // Enables the ultra-fast auto-memoizing React Compiler
  poweredByHeader: false,             // Removes the 'X-Powered-By: Next.js' header for security & minor byte savings
  compress: true,                     // Enables gzip/brotli compression for text-based assets

  // PRODUCTION BUILD OPTIMIZATIONS
  cleanDistDir: true,                 // Cleans the .next folder before building to eliminate stale files
  productionBrowserSourceMaps: false, // Disables source maps in production to reduce bundle sizes and hide raw source code

  // IMAGES OPTIMIZATION
  images: {
    formats: ['image/avif', 'image/webp'], // Prioritizes highly compressed modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200], // Defines specific viewport sizes for srcSet responsive scaling
    minimumCacheTTL: 31536000,         // Caches optimized images on the server/CDN for 1 year
  },

  // SECURITY & NETWORKING HEADERS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;"
          }
        ],
      },
    ];
  },

  // BUNDLE TUNING (Advanced Webpack Tweaks)
  webpack: (config, { dev, isServer }) => {
    // Production-only optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          // Aggressively bundles shared React packages together
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Splits large third-party libraries out of your main layout bundles
          lib: {
            test(module) {
              return module.size() > 50000 && /node_modules/.test(module.identifier());
            },
            name(module) {
              const hash = crypto.createHash('sha1');
              hash.update(module.identifier());
              return `lib-${hash.digest('hex').slice(0, 8)}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;