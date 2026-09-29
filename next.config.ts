import type { NextConfig } from "next";

const basePath = process.env.EXPORT_BASE_PATH || undefined;

const config: NextConfig = {
  basePath,
  devIndicators: false,
  images: { unoptimized: true },
  output: "export",
  trailingSlash: true,
};
export default config;
