import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import dotenv from "dotenv";

function loadEnvironmentFiles() {
  const cwd = process.cwd();
  const candidatePaths = [
    path.resolve(cwd, ".env.local"),
    path.resolve(cwd, ".env"),
    path.resolve(cwd, "../../.env.local"),
    path.resolve(cwd, "../../.env"),
  ];

  for (const candidatePath of candidatePaths) {
    if (existsSync(candidatePath)) {
      dotenv.config({
        path: candidatePath,
        override: false,
      });
    }
  }
}

loadEnvironmentFiles();

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@foodsense/shared"],
};

export default nextConfig;
