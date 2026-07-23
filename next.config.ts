import type { NextConfig } from "next";

//const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* config options here */
  output : 'export',
  //basePath: isProd ? '/https://npportfolio.github.io' : '',
  //assetPrefix: isProd ? '/https://npportfolio.github.io/': '',
  //basePath : '/https://npportfolio.github.io',
  //assetPrefix : '/https://npportfolio.github.io/',
  images: {
    unoptimized: true, // Required for static Next.js exports
  },
};

export default nextConfig;
