/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true,
    domains: [
      'localhost',
      'res.cloudinary.com',
      'apnadecoration.com',
      'admin.apnadecoration.com',
      'vendor.apnadecoration.com',
      'delivery.apnadecoration.com'
    ],
  },
  // Remove rewrites for static export
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:5000/api/:path*',
  //     },
  //   ];
  // },
  // Remove redirects for static export
  // async redirects() {
  //   return [
  //     // Remove redirect to /delivery-boy to allow index.js to handle routing
  //   ];
  // },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Add alias for shared folder
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': path.resolve(__dirname, '../../shared'),
    };
    
    return config;
  },
};

module.exports = nextConfig;
