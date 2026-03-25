import { z } from "zod";

import { DEFAULT_MAX_UPLOAD_SIZE_MB } from "@foodsense/shared";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  GOOGLE_GENAI_API_KEY: z.string().trim().optional(),
  GOOGLE_GENAI_MODEL: z.string().trim().default("gemini-2.5-flash"),
  MAX_UPLOAD_SIZE_MB: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_MAX_UPLOAD_SIZE_MB),
  ALLOW_DEV_ANALYSIS_FALLBACK: z.coerce.boolean().default(true),
});

export type AppEnv = z.infer<typeof EnvSchema> & {
  maxUploadSizeBytes: number;
};

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
    ...parsed,
    maxUploadSizeBytes: parsed.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  };

  if (!overrides) {
    cachedEnv = env;
  }

  return env;
}

