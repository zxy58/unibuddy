/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/unibuddy',
  assetPrefix: '/unibuddy/',
  images: { unoptimized: true },
}

module.exports = nextConfig
