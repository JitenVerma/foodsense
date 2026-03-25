import { describe, expect, it } from "vitest";

import { createMacroCalculatorService } from "../../services/nutrition/macroCalculator.service.js";

describe("macroCalculatorService", () => {
  it("calculates ingredient macros from grams and per-100g data", () => {
    const service = createMacroCalculatorService();

    expect(
      service.calculateIngredientMacros({
        grams: 150,
        nutritionPer100g: {
          proteinPer100g: 31,
          carbsPer100g: 0,
          fatPer100g: 3.6,
          caloriesPer100g: 165,
        },
      }),
    ).toEqual({
      protein_g: 46.5,
      carbs_g: 0,
      fat_g: 5.4,
      calories_kcal: 247.5,
    });
  });

  it("sums and rounds meal macros", () => {
    const service = createMacroCalculatorService();

    expect(
      service.sumMacros([
        {
          protein_g: 46.5,
          carbs_g: 0,
          fat_g: 5.4,
          calories_kcal: 247.5,
        },
        {
          protein_g: 4.9,
          carbs_g: 50.8,
          fat_g: 0.5,
          calories_kcal: 234.1,
        },
      ]),
    ).toEqual({
      protein_g: 51.4,
      carbs_g: 50.8,
      fat_g: 5.9,
      calories_kcal: 481.6,
    });
  });
});

