import type { DishCandidate } from "@foodsense/shared";

const DISH_INFERENCE_RULES: Array<{
  match: RegExp;
  ingredients: Array<{ name: string; grams: number; confidence: number; notes: string }>;
}> = [
  {
    match: /butter chicken|chicken curry/i,
    ingredients: [
      { name: "butter", grams: 12, confidence: 0.51, notes: "Common curry fat." },
      { name: "cream", grams: 20, confidence: 0.46, notes: "Frequently used to finish butter chicken." },
      { name: "onion", grams: 20, confidence: 0.36, notes: "Common curry base ingredient." },
    ],
  },
  {
    match: /caesar salad|salad/i,
    ingredients: [
      { name: "olive oil", grams: 10, confidence: 0.42, notes: "Likely dressing fat." },
      { name: "cheddar cheese", grams: 12, confidence: 0.28, notes: "Cheese is common in composed salads." },
    ],
  },
  {
    match: /rice bowl|burrito bowl|meal prep bowl/i,
    ingredients: [
      { name: "olive oil", grams: 8, confidence: 0.34, notes: "Likely used for cooking or dressing." },
      { name: "onion", grams: 18, confidence: 0.29, notes: "Frequently used in bowl bases." },
    ],
  },
  {
    match: /pasta|carbonara|alfredo/i,
    ingredients: [
      { name: "olive oil", grams: 8, confidence: 0.31, notes: "Often used in pasta preparation." },
      { name: "garlic", grams: 5, confidence: 0.33, notes: "Common aromatic ingredient." },
    ],
  },
];

export interface IngredientInferenceService {
  inferFromDishCandidates(
    dishCandidates: DishCandidate[],
  ): Array<{ name: string; grams: number; confidence: number; notes?: string }>;
}

export function createIngredientInferenceService(): IngredientInferenceService {
  return {
    inferFromDishCandidates(dishCandidates) {
      const topDishName = dishCandidates[0]?.name ?? "";
      const matches = DISH_INFERENCE_RULES.find((rule) => rule.match.test(topDishName));
      return matches?.ingredients ?? [];
    },
  };
}

