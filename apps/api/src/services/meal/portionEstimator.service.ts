export interface PortionEstimatorService {
  estimateInferredIngredientGrams(input: {
    ingredientName: string;
    dishNames: string[];
  }): number;
}

const DEFAULT_GRAMS_BY_INGREDIENT: Array<{ match: RegExp; grams: number }> = [
  { match: /butter/i, grams: 12 },
  { match: /cream/i, grams: 18 },
  { match: /olive oil|oil|dressing/i, grams: 8 },
  { match: /garlic/i, grams: 5 },
  { match: /onion/i, grams: 20 },
  { match: /tomato sauce|tomato puree|curry sauce/i, grams: 30 },
  { match: /cheese/i, grams: 16 },
  { match: /sugar/i, grams: 6 },
];

export function createPortionEstimatorService(): PortionEstimatorService {
  return {
    estimateInferredIngredientGrams({ ingredientName, dishNames }) {
      const dishContext = dishNames.join(" ").toLowerCase();

      if (/salad/.test(dishContext) && /dressing|oil/.test(ingredientName)) {
        return 12;
      }

      if (/pasta/.test(dishContext) && /cheese/.test(ingredientName)) {
        return 20;
      }

      const rule = DEFAULT_GRAMS_BY_INGREDIENT.find((candidate) =>
        candidate.match.test(ingredientName),
      );

      return rule?.grams ?? 15;
    },
  };
}
