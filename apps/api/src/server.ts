import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

import { buildServer } from "./app/buildServer.js";
import { getEnv } from "./config/env.js";

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

const env = getEnv();
const server = await buildServer();

try {
  await server.listen({
    port: env.API_PORT,
    host: "0.0.0.0",
  });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
