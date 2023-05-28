import './env.mjs'
import '@shopify/shopify-api/adapters/node'

console.log(`--> Running in "${process.env.NODE_ENV}" mode`)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
