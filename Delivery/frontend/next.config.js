/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: false,

  swcMinify: true,

  output: "export",

  trailingSlash: true,

  distDir: "out",

  images: {
    unoptimized: true,

    domains: [
      "localhost",
      "res.cloudinary.com",
      "apnadecoration.com",
      "admin.apnadecoration.com",
      "vendor.apnadecoration.com",
      "delivery.apnadecoration.com",
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      "@shared": path.resolve(__dirname, "../../shared"),
    };

    return config;
  },
};

module.exports = nextConfig;
