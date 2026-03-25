import { InvalidAiResponseError } from "../../lib/errors.js";
import {
  MealAnalysisAiResponseSchema,
  type MealAnalysisAiResponse,
} from "../../schemas/meal.schemas.js";

function extractJsonString(raw: unknown) {
  if (typeof raw === "string") {
    return raw
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");
  }

  if (raw && typeof raw === "object") {
    return JSON.stringify(raw);
  }

  throw new InvalidAiResponseError("Gemini returned an unsupported payload shape.");
}

export function parseMealAnalysisAiResponse(raw: unknown): MealAnalysisAiResponse {
  const jsonString = extractJsonString(raw);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (error) {
    throw new InvalidAiResponseError(
      `Gemini returned invalid JSON: ${error instanceof Error ? error.message : "Unknown parse error"}`,
    );
  }

  const result = MealAnalysisAiResponseSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new InvalidAiResponseError(
      `Gemini response failed schema validation: ${result.error.issues[0]?.message ?? "Unknown schema error"}`,
    );
  }

  return result.data;
}

