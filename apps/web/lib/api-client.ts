import {
  MealAnalysisResponseSchema,
  RecalculateMealRequestSchema,
  RecalculateMealResponseSchema,
  type Ingredient,
  type MealAnalysisResponse,
  type RecalculateMealResponse,
} from "@foodsense/shared";

import { getApiBaseUrl } from "./env";

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message || "Request failed.";
  } catch {
    return "Request failed.";
  }
}

export async function analyzeMeal(file: File): Promise<MealAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/api/v1/meals/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return MealAnalysisResponseSchema.parse(await response.json());
}

export async function recalculateMeal(
  ingredients: Ingredient[],
): Promise<RecalculateMealResponse> {
  const body = RecalculateMealRequestSchema.parse({ ingredients });

  const response = await fetch(`${getApiBaseUrl()}/api/v1/meals/recalculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return RecalculateMealResponseSchema.parse(await response.json());
}

