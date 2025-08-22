import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
/* config options here */
    eslint: {
        ignoreDuringBuilds: true,
    },
    basePath: '/babyfeed',
    assetPrefix: '/babyfeed/'
};

export default nextConfig;