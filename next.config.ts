import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // a purely static build
  images: {
    unoptimized: true
  }
};

export default nextConfig;
