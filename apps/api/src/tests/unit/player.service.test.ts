import { describe, expect, it } from "vitest";
import type { MacroTotals } from "@foodsense/shared";

import { createPlayerService } from "../../services/player/player.service.js";

function sumMacros(items: MacroTotals[]) {
  return items.reduce<MacroTotals>(
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
  );
}

describe("PlayerService", () => {
  it("derives personalized targets from the profile and goals", async () => {
    const service = createPlayerService({
      playerRepository: {
        getProfile: async () => ({
          userId: "user_123",
          email: "player@example.com",
          name: "Player",
          ageYears: 30,
          heightCm: 180,
          weightKg: 80,
          gender: "male",
          activityLevel: "moderately_active",
          jobType: "mixed",
          strengthTrainingEnabled: true,
          cardioEnabled: false,
          sessionsPerWeek: 4,
          desiredSessionsPerWeek: 5,
          timeZone: "Australia/Sydney",
          createdAt: "2026-03-27T00:00:00.000Z",
          updatedAt: "2026-03-27T00:00:00.000Z",
        }),
        getGoals: async () => ({
          userId: "user_123",
          goalType: "lose_weight",
          targetWeightKg: 75,
          timeframeWeeks: 12,
          dailyCalorieTarget: 0,
          dailyProteinTargetG: 0,
          dailyCarbsTargetG: 0,
          dailyFatTargetG: 0,
          bmrKcal: null,
          tdeeKcal: null,
          calculationVersion: 1,
          createdAt: "2026-03-27T00:00:00.000Z",
          updatedAt: "2026-03-27T00:00:00.000Z",
        }),
      } as never,
      mealsRepository: {
        listMeals: async () => [],
      } as never,
      requestAuthService: {
        createUserScopedClient: () => ({}) as never,
      } as never,
      macroCalculatorService: {
        sumMacros,
      } as never,
    });

    const result = await service.getGoals({
      accessToken: "token_123",
      userId: "user_123",
    });

    expect(result.targets.bmr_kcal).toBeGreaterThan(1700);
    expect(result.targets.tdee_kcal).toBeGreaterThan(2800);
    expect(result.targets.protein_target_g).toBeGreaterThan(170);
    expect(result.targets.calorie_target_kcal).toBeLessThan(result.targets.tdee_kcal ?? 9999);
  });

  it("completes the daily three-meal quest when enough meals are logged", async () => {
    const service = createPlayerService({
      playerRepository: {
        getProfile: async () => ({
          userId: "user_123",
          email: "player@example.com",
          name: "Player",
          ageYears: null,
          heightCm: null,
          weightKg: null,
          gender: null,
          activityLevel: null,
          jobType: null,
          strengthTrainingEnabled: false,
          cardioEnabled: false,
          sessionsPerWeek: null,
          desiredSessionsPerWeek: null,
          timeZone: "Australia/Sydney",
          createdAt: "2026-03-27T00:00:00.000Z",
          updatedAt: "2026-03-27T00:00:00.000Z",
        }),
        getGoals: async () => ({
          userId: "user_123",
          goalType: "maintain",
          targetWeightKg: null,
          timeframeWeeks: null,
          dailyCalorieTarget: 2200,
          dailyProteinTargetG: 120,
          dailyCarbsTargetG: 250,
          dailyFatTargetG: 70,
          bmrKcal: null,
          tdeeKcal: null,
          calculationVersion: 1,
          createdAt: "2026-03-27T00:00:00.000Z",
          updatedAt: "2026-03-27T00:00:00.000Z",
        }),
        listQuestDefinitions: async () => [
          {
            id: "quest_123",
            questType: "daily",
            code: "daily_log_3_meals",
            title: "Meal Machine",
            description: "Log three meals today.",
            goalMetric: "meals_logged",
            goalTarget: 3,
            xpReward: 30,
          },
        ],
      } as never,
      mealsRepository: {
        listMeals: async () => [
          {
            id: "meal_1",
            userId: "user_123",
            title: "Breakfast",
            mealType: "breakfast",
            eatenAt: "2026-03-27T00:30:00.000Z",
            imageUrl: null,
            isFavorite: false,
            isLibraryTemplate: false,
            sourceMealId: null,
            lastReusedAt: null,
            ingredients: [],
            macroTotals: { protein_g: 10, carbs_g: 20, fat_g: 5, calories_kcal: 165 },
            assumptions: [],
            warnings: [],
            createdAt: "2026-03-27T00:30:00.000Z",
            updatedAt: "2026-03-27T00:30:00.000Z",
          },
          {
            id: "meal_2",
            userId: "user_123",
            title: "Lunch",
            mealType: "lunch",
            eatenAt: "2026-03-27T03:30:00.000Z",
            imageUrl: null,
            isFavorite: false,
            isLibraryTemplate: false,
            sourceMealId: null,
            lastReusedAt: null,
            ingredients: [],
            macroTotals: { protein_g: 20, carbs_g: 30, fat_g: 10, calories_kcal: 290 },
            assumptions: [],
            warnings: [],
            createdAt: "2026-03-27T03:30:00.000Z",
            updatedAt: "2026-03-27T03:30:00.000Z",
          },
          {
            id: "meal_3",
            userId: "user_123",
            title: "Dinner",
            mealType: "dinner",
            eatenAt: "2026-03-27T08:30:00.000Z",
            imageUrl: null,
            isFavorite: false,
            isLibraryTemplate: false,
            sourceMealId: null,
            lastReusedAt: null,
            ingredients: [],
            macroTotals: { protein_g: 30, carbs_g: 40, fat_g: 12, calories_kcal: 388 },
            assumptions: [],
            warnings: [],
            createdAt: "2026-03-27T08:30:00.000Z",
            updatedAt: "2026-03-27T08:30:00.000Z",
          },
        ],
      } as never,
      requestAuthService: {
        createUserScopedClient: () => ({}) as never,
      } as never,
      macroCalculatorService: {
        sumMacros,
      } as never,
    });

    const quests = await service.getQuests({
      accessToken: "token_123",
      userId: "user_123",
      questType: "daily",
      date: "2026-03-27",
      timeZone: "Australia/Sydney",
    });

    expect(quests[0]?.status).toBe("completed");
    expect(quests[0]?.progressValue).toBe(3);
    expect(quests[0]?.completionPercentage).toBe(100);
  });

  it("builds a monthly progress range with aggregate totals and daily summaries", async () => {
    const service = createPlayerService({
      playerRepository: {
        getProfile: async () => ({
          userId: "user_123",
          email: "player@example.com",
          name: "Player",
          ageYears: 30,
          heightCm: 180,
          weightKg: 80,
          gender: "male",
          activityLevel: "moderately_active",
          jobType: "mixed",
          strengthTrainingEnabled: true,
          cardioEnabled: true,
          sessionsPerWeek: 4,
          desiredSessionsPerWeek: 5,
          timeZone: "Australia/Sydney",
          createdAt: "2026-03-01T00:00:00.000Z",
          updatedAt: "2026-03-01T00:00:00.000Z",
        }),
        getGoals: async () => ({
          userId: "user_123",
          goalType: "maintain",
          targetWeightKg: null,
          timeframeWeeks: null,
          dailyCalorieTarget: 0,
          dailyProteinTargetG: 0,
          dailyCarbsTargetG: 0,
          dailyFatTargetG: 0,
          bmrKcal: null,
          tdeeKcal: null,
          calculationVersion: 1,
          createdAt: "2026-03-01T00:00:00.000Z",
          updatedAt: "2026-03-01T00:00:00.000Z",
        }),
      } as never,
      mealsRepository: {
        listMeals: async () => [
          {
            id: "meal_1",
            userId: "user_123",
            title: "Breakfast",
            mealType: "breakfast",
            eatenAt: "2026-03-01T21:30:00.000Z",
            imageUrl: null,
            isFavorite: false,
            isLibraryTemplate: false,
            sourceMealId: null,
            lastReusedAt: null,
            ingredients: [],
            macroTotals: { protein_g: 40, carbs_g: 50, fat_g: 12, calories_kcal: 468 },
            assumptions: [],
            warnings: [],
            createdAt: "2026-03-01T21:30:00.000Z",
            updatedAt: "2026-03-01T21:30:00.000Z",
          },
          {
            id: "meal_2",
            userId: "user_123",
            title: "Dinner",
            mealType: "dinner",
            eatenAt: "2026-03-15T09:00:00.000Z",
            imageUrl: null,
            isFavorite: false,
            isLibraryTemplate: false,
            sourceMealId: null,
            lastReusedAt: null,
            ingredients: [],
            macroTotals: { protein_g: 55, carbs_g: 65, fat_g: 20, calories_kcal: 640 },
            assumptions: [],
            warnings: [],
            createdAt: "2026-03-15T09:00:00.000Z",
            updatedAt: "2026-03-15T09:00:00.000Z",
          },
        ],
      } as never,
      requestAuthService: {
        createUserScopedClient: () => ({}) as never,
      } as never,
      macroCalculatorService: {
        sumMacros,
      } as never,
    });

    const progress = await service.getProgressRange({
      accessToken: "token_123",
      userId: "user_123",
      period: "monthly",
      date: "2026-03-28",
      timeZone: "Australia/Sydney",
    });

    expect(progress.period).toBe("monthly");
    expect(progress.days).toHaveLength(31);
    expect(progress.totalMeals).toBe(2);
    expect(progress.totals.calories_kcal).toBe(1108);
    expect(progress.totalXp).toBeGreaterThan(0);
    expect(progress.days.some((day) => day.mealCount > 0)).toBe(true);
  });
});
