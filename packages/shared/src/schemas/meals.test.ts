import { describe, expect, it } from "vitest";

import { MealAnalysisResponseSchema } from "./meals.js";

describe("MealAnalysisResponseSchema", () => {
  it("parses a valid normalized meal analysis payload", () => {
    const result = MealAnalysisResponseSchema.parse({
      dishCandidates: [{ name: "salmon bowl", confidence: 0.82 }],
      visibleIngredients: [
        {
          id: "ing_salmon",
          name: "salmon",
          grams: 150,
          category: "visible",
          confidence: 0.91,
          macros: {
            protein_g: 37.5,
            carbs_g: 0,
            fat_g: 21,
            calories_kcal: 309,
          },
        },
      ],
      inferredIngredients: [],
      macroTotals: {
        protein_g: 37.5,
        carbs_g: 0,
        fat_g: 21,
        calories_kcal: 309,
      },
      assumptions: ["Portion size estimated visually"],
      warnings: ["Hidden oils may differ from recipe to recipe"],
    });

    expect(result.macroTotals.calories_kcal).toBe(309);
  });

  it("rejects invalid confidence values", () => {
    expect(() =>
      MealAnalysisResponseSchema.parse({
        dishCandidates: [{ name: "salmon bowl", confidence: 1.5 }],
        visibleIngredients: [],
        inferredIngredients: [],
        macroTotals: {
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          calories_kcal: 0,
        },
        assumptions: [],
        warnings: [],
      }),
    ).toThrowError(/too_big/i);
  });
});
