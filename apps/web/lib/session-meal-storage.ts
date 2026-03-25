import {
  MealAnalysisResponseSchema,
  type MealAnalysisResponse,
} from "@foodsense/shared";

const ACTIVE_ANALYSIS_KEY = "foodsense.active-analysis";
const SAVED_MEALS_KEY = "foodsense.saved-meals";

export interface ActiveMealSession {
  imageDataUrl: string;
  analysis: MealAnalysisResponse;
  updatedAt: string;
}

export interface SavedMealSnapshot extends ActiveMealSession {
  id: string;
}

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function saveActiveMealSession(session: ActiveMealSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(ACTIVE_ANALYSIS_KEY, JSON.stringify(session));
}

export function loadActiveMealSession(): ActiveMealSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const parsed = parseJson<ActiveMealSession>(
    window.sessionStorage.getItem(ACTIVE_ANALYSIS_KEY),
  );

  if (!parsed) {
    return null;
  }

  try {
    return {
      ...parsed,
      analysis: MealAnalysisResponseSchema.parse(parsed.analysis),
    };
  } catch {
    return null;
  }
}

export function saveMealSnapshot(snapshot: ActiveMealSession) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = parseJson<SavedMealSnapshot[]>(
    window.localStorage.getItem(SAVED_MEALS_KEY),
  ) ?? [];

  const next: SavedMealSnapshot[] = [
    {
      ...snapshot,
      id: crypto.randomUUID(),
    },
    ...existing,
  ].slice(0, 12);

  window.localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(next));
}

