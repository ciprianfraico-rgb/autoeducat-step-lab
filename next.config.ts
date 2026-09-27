import type { NextConfig } from "next";
import { execSync } from "node:child_process";

function commitScurt(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "local";
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT: commitScurt(),
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
  },
  // transformers.js și onnxruntime-web rulează în browser; nu le împachetăm pe server.
  serverExternalPackages: ["@huggingface/transformers", "@mlc-ai/web-llm"],
};

export default nextConfig;
