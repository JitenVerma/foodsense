import type { Ingredient, MacroTotals } from "@foodsense/shared";

function zeroMacros(): MacroTotals {
  return {
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    calories_kcal: 0,
  };
}

function roundTo(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function estimateIngredientMacros(
  ingredient: Ingredient,
  nextGrams: number,
): MacroTotals {
  if (!ingredient.macros) {
    return zeroMacros();
  }

  if (ingredient.grams <= 0) {
    return ingredient.macros;
  }

  const scale = nextGrams / ingredient.grams;

  return {
    protein_g: roundTo(ingredient.macros.protein_g * scale),
    carbs_g: roundTo(ingredient.macros.carbs_g * scale),
    fat_g: roundTo(ingredient.macros.fat_g * scale),
    calories_kcal: roundTo(ingredient.macros.calories_kcal * scale),
  };
}

export function sumIngredientMacros(ingredients: Ingredient[]): MacroTotals {
  return ingredients.reduce<MacroTotals>(
    (totals, ingredient) => ({
      protein_g: roundTo(totals.protein_g + (ingredient.macros?.protein_g ?? 0)),
      carbs_g: roundTo(totals.carbs_g + (ingredient.macros?.carbs_g ?? 0)),
      fat_g: roundTo(totals.fat_g + (ingredient.macros?.fat_g ?? 0)),
      calories_kcal: roundTo(
        totals.calories_kcal + (ingredient.macros?.calories_kcal ?? 0),
      ),
    }),
    zeroMacros(),
  );
}

export function ingredientSignature(ingredients: Ingredient[]) {
  return ingredients
    .map((ingredient) => `${ingredient.id}:${ingredient.name}:${ingredient.grams}`)
    .join("|");
}

