import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /** CORS for `/sdk/*.mjs` enables runtime `import()` from other origins if needed; `urlImports` uses build-time fetch. */
  async headers() {
    return [
      {
        source: '/sdk/:file',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ]
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })
    return config
  },
}

export default nextConfig
