import type { NextConfig } from "next";

// GitHub Pages serves the site under /<repo>/. CI sets NEXT_PUBLIC_BASE_PATH
// (see .github/workflows/deploy.yml); locally it is empty so `npm run dev`
// serves from http://localhost:3000/.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // Every route exports as <route>/index.html, so /option-b/ and
  // /synthetic/option-b/ work on GitHub Pages without rewrites.
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
