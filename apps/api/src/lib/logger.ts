import type { FastifyBaseLogger } from "fastify";

export function logServiceWarning(
  logger: FastifyBaseLogger | Console,
  message: string,
  context?: Record<string, unknown>,
) {
  if ("warn" in logger) {
    logger.warn(context ?? {}, message);
  }
}

