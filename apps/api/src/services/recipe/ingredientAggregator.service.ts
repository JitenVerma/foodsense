export interface AggregatedRecipeIngredient {
  name: string;
  frequency: number;
  recipeCount: number;
}

export interface IngredientAggregatorService {
  aggregate(input: {
    normalizedRecipeIngredients: string[][];
  }): AggregatedRecipeIngredient[];
}

export function createIngredientAggregatorService(): IngredientAggregatorService {
  return {
    aggregate({ normalizedRecipeIngredients }) {
      const recipeCount = normalizedRecipeIngredients.length;
      if (recipeCount === 0) {
        return [];
      }

      const counts = new Map<string, number>();

      for (const recipeIngredients of normalizedRecipeIngredients) {
        const uniqueIngredients = new Set(recipeIngredients);
        for (const ingredient of uniqueIngredients) {
          counts.set(ingredient, (counts.get(ingredient) ?? 0) + 1);
        }
      }

      return Array.from(counts.entries())
        .map(([name, count]) => ({
          name,
          recipeCount: count,
          frequency: Math.round((count / recipeCount) * 100) / 100,
        }))
        .sort((left, right) => right.frequency - left.frequency);
    },
  };
}

