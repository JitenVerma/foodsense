import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";

import { attachRequestIdHeader, createRequestLogger } from "../lib/logger.js";

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

  server.addHook("onRequest", async (request, reply) => {
    attachRequestIdHeader(request, reply);

    createRequestLogger(request).info("Request started", {
      event: "http.request.started",
    });
  });

  server.addHook("onResponse", async (request, reply) => {
    createRequestLogger(request).info("Request completed", {
      event: "http.request.completed",
      status_code: reply.statusCode,
    });
  });
}
