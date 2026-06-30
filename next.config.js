/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Generates a fully static site in /out — no Node.js server required.
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for static export (next/image has no server to optimize on).
  },
  trailingSlash: true,
};

module.exports = nextConfig;
