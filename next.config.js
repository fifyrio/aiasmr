const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'commondatastorage.googleapis.com', 'pub-a0da9daa5c8a415793ac89043f791f12.r2.dev'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },

  // 性能优化 - 移除生产环境 console
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 使用 SWC 压缩，减少构建时间和 CPU 使用
  swcMinify: true,

  // 优化产物大小和包导入
  experimental: {
    // optimizeCss 在某些情况下会导致预渲染错误，暂时禁用
    optimizePackageImports: ['remixicon', 'aos', 'swiper', 'fslightbox-react'],
  },

  // 减少运行时 CPU 负载
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = withNextIntl(nextConfig);