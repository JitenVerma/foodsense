import type {
  Ingredient,
  RecalculateMealRequest,
  RecalculateMealResponse,
} from "@foodsense/shared";

import type { NutritionLookupService } from "../nutrition/nutritionLookup.service.js";
import type { MacroCalculatorService } from "../nutrition/macroCalculator.service.js";

function zeroMacros() {
  return {
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    calories_kcal: 0,
  };
}

export interface MealRecalculationService {
  recalculate(input: RecalculateMealRequest): RecalculateMealResponse;
}

interface MealRecalculationServiceOptions {
  nutritionLookupService: NutritionLookupService;
  macroCalculatorService: MacroCalculatorService;
}

export function createMealRecalculationService(
  options: MealRecalculationServiceOptions,
): MealRecalculationService {
  return {
    recalculate(input) {
      const warnings: string[] = [];

      const ingredients: Ingredient[] = input.ingredients.map((ingredient) => {
        const nutritionMatch = options.nutritionLookupService.findIngredientNutrition(
          ingredient.name,
        );

        if (!nutritionMatch) {
          warnings.push(`No nutrition match found for "${ingredient.name}".`);
        }

        return {
          ...ingredient,
          nutritionMatch: nutritionMatch?.canonicalName ?? null,
          macros: nutritionMatch
            ? options.macroCalculatorService.calculateIngredientMacros({
                grams: ingredient.grams,
                nutritionPer100g: nutritionMatch,
              })
            : zeroMacros(),
        };
      });

      return {
        ingredients,
        macroTotals: options.macroCalculatorService.sumMacros(
          ingredients.map((ingredient) => ingredient.macros ?? zeroMacros()),
        ),
        warnings: Array.from(new Set(warnings)),
      };
    },
  };
}

