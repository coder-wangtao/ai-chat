import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 开启 Next.js 的实验性功能 PPR（Partial Page Rendering）
    // PPR 可以让页面只渲染变化的部分，而不是整个页面重新渲染，提高页面响应速度
    ppr: true,
  },
  images: {
    // 配置 Next.js Image 组件 (next/image) 可以加载的远程图片域名
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        //https://nextjs.org/docs/messages/next-image-unconfigured-host
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
