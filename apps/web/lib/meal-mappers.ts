import type {
  Ingredient,
  MealAnalysisResponse,
  MealType,
  SaveMealRequest,
  SavedMeal,
  UpdateMealRequest,
} from "@foodsense/shared";

function buildTitleFromAnalysis(analysis: MealAnalysisResponse) {
  return analysis.dishCandidates[0]?.name || "Untitled meal";
}

export function inferMealType(date: Date): MealType {
  const hour = date.getHours();

  if (hour < 11) {
    return "breakfast";
  }

  if (hour < 15) {
    return "lunch";
  }

  if (hour < 21) {
    return "dinner";
  }

  return "snack";
}

export function toDateTimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string) {
  return new Date(value).toISOString();
}

export function analysisToSaveMealRequest(input: {
  analysis: MealAnalysisResponse;
  title?: string;
  mealType: MealType;
  eatenAt: string;
  imageUrl?: string | null;
}): SaveMealRequest {
  const ingredients = [
    ...input.analysis.visibleIngredients,
    ...input.analysis.inferredIngredients,
  ];

  return {
    title: input.title?.trim() || buildTitleFromAnalysis(input.analysis),
    mealType: input.mealType,
    eatenAt: input.eatenAt,
    imageUrl: input.imageUrl ?? null,
    ingredients,
    assumptions: input.analysis.assumptions,
    warnings: input.analysis.warnings,
  };
}

export function savedMealToAnalysis(meal: SavedMeal): MealAnalysisResponse {
  return {
    dishCandidates: [
      {
        name: meal.title,
        confidence: 1,
      },
    ],
    visibleIngredients: meal.ingredients.filter(
      (ingredient) => ingredient.category === "visible",
    ),
    inferredIngredients: meal.ingredients.filter(
      (ingredient) => ingredient.category !== "visible",
    ),
    macroTotals: meal.macroTotals,
    assumptions: meal.assumptions,
    warnings: meal.warnings,
  };
}

export function analysisToUpdateMealRequest(input: {
  analysis: MealAnalysisResponse;
  title: string;
  mealType: MealType;
  eatenAt: string;
  imageUrl?: string | null;
}): UpdateMealRequest {
  return {
    title: input.title.trim() || buildTitleFromAnalysis(input.analysis),
    mealType: input.mealType,
    eatenAt: input.eatenAt,
    imageUrl: input.imageUrl ?? null,
    ingredients: [
      ...input.analysis.visibleIngredients,
      ...input.analysis.inferredIngredients,
    ] as Ingredient[],
    assumptions: input.analysis.assumptions,
    warnings: input.analysis.warnings,
  };
}
