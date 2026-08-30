import { createJiti } from 'jiti';
import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti.import('./src/env/client');
jiti.import('./src/env/server');

const isDevelopment = process.env.NODE_ENV === 'development';
const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL!);

const nextConfig: NextConfig = {
  output: 'standalone',

  reactStrictMode: true,

  poweredByHeader: false,

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  images: {
    dangerouslyAllowLocalIP: isDevelopment,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: appUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: appUrl.hostname,
        port: appUrl.port || '',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
