import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(server: FastifyInstance) {
  server.get("/api/v1/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));
}

