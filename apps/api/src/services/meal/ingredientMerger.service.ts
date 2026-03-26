import type { MealAnalysisAiResponse } from "../../schemas/meal.schemas.js";
import type { AggregatedRecipeIngredient } from "../recipe/ingredientAggregator.service.js";

export interface MergedIngredientCandidate {
  name: string;
  grams: number;
  category: "visible" | "inferred";
  confidence: number;
  notes?: string;
  reason?: string;
}

export interface IngredientMergerService {
  merge(input: {
    visibleIngredients: MealAnalysisAiResponse["visibleIngredients"];
    aggregatedRecipeIngredients: AggregatedRecipeIngredient[];
    fallbackInferredIngredients: Array<{
      name: string;
      grams: number;
      confidence: number;
      notes?: string;
    }>;
    inferGrams: (ingredientName: string) => number;
  }): MergedIngredientCandidate[];
}

const MACRO_HEAVY_INGREDIENTS = [
  "oil",
  "olive oil",
  "butter",
  "cream",
  "cheese",
  "dressing",
  "sugar",
] as const;

function normalizeName(input: string) {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isMacroHeavy(input: string) {
  const normalized = normalizeName(input);
  return MACRO_HEAVY_INGREDIENTS.some((item) => normalized.includes(item));
}

export function createIngredientMergerService(): IngredientMergerService {
  return {
    merge({
      visibleIngredients,
      aggregatedRecipeIngredients,
      fallbackInferredIngredients,
      inferGrams,
    }) {
      const merged: MergedIngredientCandidate[] = visibleIngredients.map((ingredient) => ({
        name: ingredient.name,
        grams: ingredient.grams,
        category: "visible",
        confidence: ingredient.confidence,
        notes: ingredient.notes,
      }));

      const seenVisible = new Set(visibleIngredients.map((ingredient) => normalizeName(ingredient.name)));

      for (const ingredient of aggregatedRecipeIngredients) {
        const normalizedName = normalizeName(ingredient.name);
        if (seenVisible.has(normalizedName)) {
          continue;
        }

        const includeIngredient =
          ingredient.frequency >= 0.7 ||
          (ingredient.frequency >= 0.45 && isMacroHeavy(ingredient.name));

        if (!includeIngredient) {
          continue;
        }

        merged.push({
          name: ingredient.name,
          grams: inferGrams(ingredient.name),
          category: "inferred",
          confidence: Math.min(0.9, Math.max(0.35, ingredient.frequency)),
          reason:
            ingredient.frequency >= 0.7
              ? "Found in a high share of matched recipes."
              : "Included because it frequently appears in recipes and materially affects macros.",
        });
      }

      for (const ingredient of fallbackInferredIngredients) {
        const normalizedName = normalizeName(ingredient.name);
        const alreadyIncluded = merged.some(
          (candidate) => normalizeName(candidate.name) === normalizedName,
        );

        if (!alreadyIncluded) {
          merged.push({
            name: ingredient.name,
            grams: ingredient.grams,
            category: "inferred",
            confidence: ingredient.confidence,
            notes: ingredient.notes,
            reason: "Added from dish-pattern fallback rules.",
          });
        }
      }

      return merged;
    },
  };
}

