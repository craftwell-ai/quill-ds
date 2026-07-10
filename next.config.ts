import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // The static Storybook build lives in public/storybook and is served under
  // /storybook/. Its assets are referenced relative to the document URL, so the
  // canonical URL must keep the trailing slash — hence trailingSlash + rewrite.
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: "/storybook/",
        destination: "/storybook/index.html",
      },
    ];
  },
};

export default nextConfig;
