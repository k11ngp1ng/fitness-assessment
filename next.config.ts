import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath =
  process.env.GITHUB_ACTIONS === "true" && repositoryName
    ? `/${repositoryName}`
    : undefined;

const config: NextConfig = {
  basePath,
  devIndicators: false,
  images: { unoptimized: true },
  output: "export",
  trailingSlash: true,
};
export default config;
