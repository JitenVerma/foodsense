import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { FastifyRequest } from "fastify";

import type { StructuredLogger } from "../../lib/logger.js";
import { ConfigurationError, UnauthorizedError } from "../../lib/errors.js";

export interface AuthenticatedRequestContext {
  userId: string;
  email: string | null;
  accessToken: string;
}

export interface RequestAuthService {
  authenticate(
    request: FastifyRequest,
    logger?: StructuredLogger,
  ): Promise<AuthenticatedRequestContext>;
  createUserScopedClient(accessToken: string): SupabaseClient;
}

interface CreateRequestAuthServiceOptions {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
}

export function createRequestAuthService(
  options: CreateRequestAuthServiceOptions,
): RequestAuthService {
  const { supabaseUrl, supabasePublishableKey } = options;

  function assertConfigured() {
    if (!supabaseUrl || !supabasePublishableKey) {
      throw new ConfigurationError(
        "Supabase authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.",
      );
    }
  }

  function getAccessTokenFromRequest(request: FastifyRequest) {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedError();
    }

    const [scheme, token] = authorizationHeader.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token?.trim()) {
      throw new UnauthorizedError("Expected a Bearer access token.");
    }

    return token.trim();
  }

  function createUserScopedClient(accessToken: string) {
    assertConfigured();

    return createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  return {
    async authenticate(request, logger) {
      const accessToken = getAccessTokenFromRequest(request);
      const supabase = createUserScopedClient(accessToken);
      const { data, error } = await supabase.auth.getUser(accessToken);

      if (error || !data.user) {
        logger?.warn("Supabase authentication failed", {
          event: "auth.supabase.failed",
          error: error
            ? {
                name: error.name,
                message: error.message,
                status: error.status,
              }
            : null,
        });
        throw new UnauthorizedError();
      }

      return {
        userId: data.user.id,
        email: data.user.email ?? null,
        accessToken,
      };
    },
    createUserScopedClient,
  };
}
