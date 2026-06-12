import { createJiti } from 'jiti';
import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti.import('./src/env/client');
jiti.import('./src/env/server');

const nextConfig: NextConfig = {
  output: 'standalone',

  reactStrictMode: true,

  poweredByHeader: false,

  typedRoutes: true,

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
