import { z } from "zod";

import { DEFAULT_MAX_UPLOAD_SIZE_MB } from "@foodsense/shared";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  GEMINI_API_KEY: z.string().trim().optional(),
  GOOGLE_GENAI_API_KEY: z.string().trim().optional(),
  GEMINI_MODEL: z.string().trim().optional(),
  GOOGLE_GENAI_MODEL: z.string().trim().optional(),
  API_NINJAS_API_KEY: z.string().trim().optional(),
  USDA_API_KEY: z.string().trim().optional(),
  MAX_UPLOAD_SIZE_MB: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_MAX_UPLOAD_SIZE_MB),
  ALLOW_DEV_ANALYSIS_FALLBACK: z.coerce.boolean().default(true),
});

export interface AppEnv {
  NODE_ENV: "development" | "test" | "production";
  API_PORT: number;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;
  API_NINJAS_API_KEY?: string;
  USDA_API_KEY?: string;
  MAX_UPLOAD_SIZE_MB: number;
  ALLOW_DEV_ANALYSIS_FALLBACK: boolean;
  maxUploadSizeBytes: number;
}

let cachedEnv: AppEnv | null = null;

export function getEnv(overrides?: Partial<NodeJS.ProcessEnv>): AppEnv {
  if (!overrides && cachedEnv) {
    return cachedEnv;
  }

  const parsed = EnvSchema.parse({
    ...process.env,
    ...overrides,
  });

  const env: AppEnv = {
    NODE_ENV: parsed.NODE_ENV,
    API_PORT: parsed.API_PORT,
    GEMINI_API_KEY: parsed.GEMINI_API_KEY ?? parsed.GOOGLE_GENAI_API_KEY,
    GEMINI_MODEL: parsed.GEMINI_MODEL ?? parsed.GOOGLE_GENAI_MODEL ?? "gemini-2.5-pro",
    API_NINJAS_API_KEY: parsed.API_NINJAS_API_KEY,
    USDA_API_KEY: parsed.USDA_API_KEY,
    MAX_UPLOAD_SIZE_MB: parsed.MAX_UPLOAD_SIZE_MB,
    ALLOW_DEV_ANALYSIS_FALLBACK: parsed.ALLOW_DEV_ANALYSIS_FALLBACK,
    maxUploadSizeBytes: parsed.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  };

  if (!overrides) {
    cachedEnv = env;
  }

  return env;
}
