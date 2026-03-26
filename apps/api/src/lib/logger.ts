import { randomUUID } from "node:crypto";

import type {
  FastifyBaseLogger,
  FastifyReply,
  FastifyRequest,
} from "fastify";

export interface StructuredLogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  child(context: Record<string, unknown>): StructuredLogger;
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}

class FastifyStructuredLogger implements StructuredLogger {
  constructor(private readonly logger: FastifyBaseLogger | Console) {}

  info(message: string, context?: Record<string, unknown>) {
    if ("info" in this.logger) {
      this.logger.info(context ?? {}, message);
    }
  }

  warn(message: string, context?: Record<string, unknown>) {
    if ("warn" in this.logger) {
      this.logger.warn(context ?? {}, message);
    }
  }

  error(message: string, context?: Record<string, unknown>) {
    if ("error" in this.logger) {
      this.logger.error(context ?? {}, message);
    }
  }

  child(context: Record<string, unknown>) {
    if ("child" in this.logger && typeof this.logger.child === "function") {
      return new FastifyStructuredLogger(this.logger.child(context));
    }

    return new FastifyStructuredLogger(this.logger);
  }
}

export function createLogger(logger: FastifyBaseLogger | Console): StructuredLogger {
  return new FastifyStructuredLogger(logger);
}

export function getRequestId(request: FastifyRequest) {
  const headerValue = request.headers["x-request-id"];
  return (
    (typeof headerValue === "string" && headerValue.trim()) ||
    request.id ||
    randomUUID()
  );
}

export function createRequestLogger(request: FastifyRequest): StructuredLogger {
  return createLogger(request.log).child({
    request_id: getRequestId(request),
    method: request.method,
    route: request.url,
  });
}

export function attachRequestIdHeader(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  reply.header("x-request-id", getRequestId(request));
}

export async function logStep<T>(
  logger: StructuredLogger,
  step: string,
  operation: () => Promise<T> | T,
  context?: Record<string, unknown>,
): Promise<T> {
  const startedAt = Date.now();
  logger.info("Step started", {
    event: "analysis.step.started",
    step,
    ...context,
  });

  try {
    const result = await operation();
    logger.info("Step completed", {
      event: "analysis.step.completed",
      step,
      duration_ms: Date.now() - startedAt,
      ...context,
    });
    return result;
  } catch (error) {
    logger.error("Step failed", {
      event: "analysis.step.failed",
      step,
      duration_ms: Date.now() - startedAt,
      error: normalizeError(error),
      ...context,
    });
    throw error;
  }
}

export function logServiceWarning(
  logger: StructuredLogger,
  message: string,
  context?: Record<string, unknown>,
) {
  logger.warn(message, {
    event: "service.warning",
    ...context,
  });
}
