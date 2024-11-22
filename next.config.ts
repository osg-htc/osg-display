import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // a purely static build
  images: {
    unoptimized: true,
  },
  assetPrefix: "/osg-display", // while being deployed on a test github pages
  basePath: "/osg-display", // while being deployed on a test github pages
};

export default nextConfig;
