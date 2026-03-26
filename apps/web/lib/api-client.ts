import {
  CalendarMonthResponseSchema,
  MealsByDateResponseSchema,
  MealAnalysisResponseSchema,
  RecalculateMealRequestSchema,
  RecalculateMealResponseSchema,
  SaveMealRequestSchema,
  SavedMealSchema,
  UpdateMealRequestSchema,
  type CalendarMonthResponse,
  type Ingredient,
  type MealsByDateResponse,
  type MealAnalysisResponse,
  type SaveMealRequest,
  type SavedMeal,
  type UpdateMealRequest,
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

function createAuthHeaders(accessToken?: string, includeJson = false) {
  const headers = new Headers();

  if (includeJson) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
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

export async function saveMeal(
  payload: SaveMealRequest,
  accessToken: string,
): Promise<SavedMeal> {
  const body = SaveMealRequestSchema.parse(payload);
  const response = await fetch(`${getApiBaseUrl()}/api/v1/meals`, {
    method: "POST",
    headers: createAuthHeaders(accessToken, true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return SavedMealSchema.parse(await response.json());
}

export async function listMeals(accessToken: string): Promise<SavedMeal[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/meals`, {
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return SavedMealSchema.array().parse(await response.json());
}

export async function getMeal(
  mealId: string,
  accessToken: string,
): Promise<SavedMeal> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/meals/${mealId}`, {
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return SavedMealSchema.parse(await response.json());
}

export async function updateMeal(
  mealId: string,
  updates: UpdateMealRequest,
  accessToken: string,
): Promise<SavedMeal> {
  const body = UpdateMealRequestSchema.parse(updates);
  const response = await fetch(`${getApiBaseUrl()}/api/v1/meals/${mealId}`, {
    method: "PATCH",
    headers: createAuthHeaders(accessToken, true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return SavedMealSchema.parse(await response.json());
}

export async function deleteMeal(
  mealId: string,
  accessToken: string,
): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/meals/${mealId}`, {
    method: "DELETE",
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function getCalendarMonth(
  month: string,
  accessToken: string,
  timeZone?: string,
): Promise<CalendarMonthResponse> {
  const params = new URLSearchParams({
    month,
  });

  if (timeZone) {
    params.set("timeZone", timeZone);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/calendar?${params.toString()}`,
    {
      headers: createAuthHeaders(accessToken),
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return CalendarMonthResponseSchema.parse(await response.json());
}

export async function getMealsByDate(
  date: string,
  accessToken: string,
  timeZone?: string,
): Promise<MealsByDateResponse> {
  const params = new URLSearchParams({
    date,
  });

  if (timeZone) {
    params.set("timeZone", timeZone);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/meals/by-date?${params.toString()}`,
    {
      headers: createAuthHeaders(accessToken),
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return MealsByDateResponseSchema.parse(await response.json());
}
