import { describe, expect, it } from "vitest";

import { MealAnalysisResponseSchema, SavedMealSchema } from "./meals.js";

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

  it("accepts Supabase timestamp offsets in saved meals", () => {
    const result = SavedMealSchema.parse({
      id: "meal_123",
      userId: "user_123",
      title: "Chicken bowl",
      mealType: "lunch",
      eatenAt: "2026-03-26T12:30:00+00:00",
      imageUrl: null,
      ingredients: [],
      macroTotals: {
        protein_g: 40,
        carbs_g: 55,
        fat_g: 12,
        calories_kcal: 480,
      },
      assumptions: [],
      warnings: [],
      createdAt: "2026-03-26T12:31:00+00:00",
      updatedAt: "2026-03-26T12:31:00+00:00",
    });

    expect(result.eatenAt).toBe("2026-03-26T12:30:00+00:00");
  });
});
