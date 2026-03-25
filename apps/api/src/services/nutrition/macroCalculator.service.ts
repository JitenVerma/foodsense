import type { MacroTotals } from "@foodsense/shared";

import { clampNumber, roundTo } from "../../utils/math.js";

export interface MacroCalculatorService {
  calculateIngredientMacros(input: {
    grams: number;
    nutritionPer100g: {
      proteinPer100g: number;
      carbsPer100g: number;
      fatPer100g: number;
      caloriesPer100g: number;
    };
  }): MacroTotals;
  sumMacros(items: MacroTotals[]): MacroTotals;
}

export function createMacroCalculatorService(): MacroCalculatorService {
  return {
    calculateIngredientMacros({ grams, nutritionPer100g }) {
      const scale = clampNumber(grams) / 100;

      return {
        protein_g: roundTo(nutritionPer100g.proteinPer100g * scale),
        carbs_g: roundTo(nutritionPer100g.carbsPer100g * scale),
        fat_g: roundTo(nutritionPer100g.fatPer100g * scale),
        calories_kcal: roundTo(nutritionPer100g.caloriesPer100g * scale),
      };
    },
    sumMacros(items) {
      const totals = items.reduce<MacroTotals>(
        (accumulator, item) => ({
          protein_g: accumulator.protein_g + item.protein_g,
          carbs_g: accumulator.carbs_g + item.carbs_g,
          fat_g: accumulator.fat_g + item.fat_g,
          calories_kcal: accumulator.calories_kcal + item.calories_kcal,
        }),
        {
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          calories_kcal: 0,
        },
      );

      return {
        protein_g: roundTo(totals.protein_g),
        carbs_g: roundTo(totals.carbs_g),
        fat_g: roundTo(totals.fat_g),
        calories_kcal: roundTo(totals.calories_kcal),
      };
    },
  };
}
