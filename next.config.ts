import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Prevent trailing slash redirect loops when proxied from parent project
  trailingSlash: false,
  images: {
    // 允許載入 Google OAuth 頭像來源
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    // 若你的部署走經反向代理且不希望使用 Next 內建影像優化，可啟用以下設定
    // 這樣 <Image> 會直接輸出 <img>，避免經過 /_next/image
    unoptimized: true,
  },
  basePath: '/babyfeed',
};

export default nextConfig;
