/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@sentinelai/shared",
    "@sentinelai/sdk",
    "@sentinelai/ui",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "@sentinelai/shared",
      "@sentinelai/sdk",
      "@sentinelai/ui",
    ],
  },
};

module.exports = nextConfig;
