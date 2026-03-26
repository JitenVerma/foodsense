import { describe, expect, it } from "vitest";
import type { MacroTotals } from "@foodsense/shared";

import { createMealPersistenceService } from "../../services/meal/mealPersistence.service.js";

describe("MealPersistenceService timezone handling", () => {
  it("groups a UTC timestamp under the correct local day", async () => {
    const service = createMealPersistenceService({
      mealsRepository: {
        listMealsInRange: async () => [
          {
            id: "meal_123",
            userId: "user_123",
            title: "Late dinner",
            mealType: "dinner",
            eatenAt: "2026-03-25T13:30:00.000Z",
            imageUrl: null,
            ingredients: [],
            macroTotals: {
              protein_g: 10,
              carbs_g: 20,
              fat_g: 5,
              calories_kcal: 165,
            },
            assumptions: [],
            warnings: [],
            createdAt: "2026-03-25T13:31:00.000Z",
            updatedAt: "2026-03-25T13:31:00.000Z",
          },
        ],
      } as never,
      requestAuthService: {
        createUserScopedClient: () => ({}) as never,
      } as never,
      macroCalculatorService: {
        sumMacros: (items: MacroTotals[]) =>
          items.reduce<MacroTotals>(
            (totals, item) => ({
              protein_g: totals.protein_g + item.protein_g,
              carbs_g: totals.carbs_g + item.carbs_g,
              fat_g: totals.fat_g + item.fat_g,
              calories_kcal: totals.calories_kcal + item.calories_kcal,
            }),
            {
              protein_g: 0,
              carbs_g: 0,
              fat_g: 0,
              calories_kcal: 0,
            },
          ),
      } as never,
    });

    const result = await service.getMealsByDate({
      accessToken: "token_123",
      userId: "user_123",
      date: "2026-03-26",
      timeZone: "Australia/Sydney",
    });

    expect(result.meals).toHaveLength(1);
    expect(result.meals[0]?.id).toBe("meal_123");
  });
});
