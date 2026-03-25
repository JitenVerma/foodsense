import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";

export async function registerPlugins(
  server: FastifyInstance,
  options: { maxUploadSizeBytes: number },
) {
  await server.register(cors, {
    origin: true,
  });

  await server.register(multipart, {
    limits: {
      fileSize: options.maxUploadSizeBytes,
      files: 1,
    },
  });
}

