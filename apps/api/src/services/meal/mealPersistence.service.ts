import type {
  CalendarMonthResponse,
  Ingredient,
  MealsByDateResponse,
  SaveMealRequest,
  SavedMeal,
  UpdateMealRequest,
} from "@foodsense/shared";

import type { StructuredLogger } from "../../lib/logger.js";
import type { MealsRepository } from "../../repositories/meals.repository.js";
import type { MacroCalculatorService } from "../nutrition/macroCalculator.service.js";
import type { RequestAuthService } from "../auth/requestAuth.service.js";

export interface MealPersistenceService {
  createMeal(input: {
    accessToken: string;
    userId: string;
    meal: SaveMealRequest;
    logger?: StructuredLogger;
  }): Promise<SavedMeal>;
  listMeals(input: {
    accessToken: string;
    userId: string;
  }): Promise<SavedMeal[]>;
  getMealById(input: {
    accessToken: string;
    userId: string;
    mealId: string;
  }): Promise<SavedMeal>;
  updateMeal(input: {
    accessToken: string;
    userId: string;
    mealId: string;
    updates: UpdateMealRequest;
    logger?: StructuredLogger;
  }): Promise<SavedMeal>;
  deleteMeal(input: {
    accessToken: string;
    userId: string;
    mealId: string;
    logger?: StructuredLogger;
  }): Promise<string>;
  getCalendarMonth(input: {
    accessToken: string;
    userId: string;
    month: string;
    timeZone?: string;
  }): Promise<CalendarMonthResponse>;
  getMealsByDate(input: {
    accessToken: string;
    userId: string;
    date: string;
    timeZone?: string;
  }): Promise<MealsByDateResponse>;
}

interface CreateMealPersistenceServiceOptions {
  mealsRepository: MealsRepository;
  requestAuthService: RequestAuthService;
  macroCalculatorService: MacroCalculatorService;
}

function computeMacroTotals(
  macroCalculatorService: MacroCalculatorService,
  ingredients: Ingredient[],
) {
  return macroCalculatorService.sumMacros(
    ingredients.map((ingredient) => ingredient.macros ?? {
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      calories_kcal: 0,
    }),
  );
}

function startOfMonth(month: string) {
  return new Date(`${month}-01T00:00:00.000Z`);
}

function nextMonthKey(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const nextMonthDate = new Date(Date.UTC(year!, monthIndex!, 1));
  return `${nextMonthDate.getUTCFullYear()}-${String(
    nextMonthDate.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
}

function shiftIsoStringByDays(isoString: string, days: number) {
  const date = new Date(isoString);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function createTimeZoneDateFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function toDateKeyInTimeZone(isoString: string, timeZone: string) {
  const formatter = createTimeZoneDateFormatter(timeZone);
  const parts = formatter.formatToParts(new Date(isoString));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(`Unable to format date key for timezone ${timeZone}.`);
  }

  return `${year}-${month}-${day}`;
}

function getQueryWindowForLocalDate(date: string) {
  return {
    startIso: shiftIsoStringByDays(`${date}T00:00:00.000Z`, -1),
    endIso: shiftIsoStringByDays(`${date}T00:00:00.000Z`, 2),
  };
}

function getQueryWindowForLocalMonth(month: string) {
  const monthStartIso = `${month}-01T00:00:00.000Z`;
  const nextMonthStartIso = `${nextMonthKey(month)}-01T00:00:00.000Z`;

  return {
    startIso: shiftIsoStringByDays(monthStartIso, -1),
    endIso: shiftIsoStringByDays(nextMonthStartIso, 1),
  };
}

export function createMealPersistenceService(
  options: CreateMealPersistenceServiceOptions,
): MealPersistenceService {
  const { mealsRepository, requestAuthService, macroCalculatorService } = options;
  const defaultTimeZone = "UTC";

  return {
    async createMeal({ accessToken, userId, meal, logger }) {
      logger?.info("Persisting analyzed meal", {
        event: "meals.persistence.create.started",
        ingredient_count: meal.ingredients.length,
        meal_type: meal.mealType,
      });

      const savedMeal = await mealsRepository.createMeal(
        requestAuthService.createUserScopedClient(accessToken),
        userId,
        {
          ...meal,
          macroTotals: computeMacroTotals(macroCalculatorService, meal.ingredients),
        },
      );

      logger?.info("Persisted analyzed meal", {
        event: "meals.persistence.create.completed",
        meal_id: savedMeal.id,
      });

      return savedMeal;
    },
    async listMeals({ accessToken, userId }) {
      return mealsRepository.listMeals(
        requestAuthService.createUserScopedClient(accessToken),
        userId,
      );
    },
    async getMealById({ accessToken, userId, mealId }) {
      return mealsRepository.getMealById(
        requestAuthService.createUserScopedClient(accessToken),
        userId,
        mealId,
      );
    },
    async updateMeal({ accessToken, userId, mealId, updates, logger }) {
      const existingMeal = await mealsRepository.getMealById(
        requestAuthService.createUserScopedClient(accessToken),
        userId,
        mealId,
      );

      const ingredients = updates.ingredients ?? existingMeal.ingredients;
      logger?.info("Updating persisted meal", {
        event: "meals.persistence.update.started",
        meal_id: mealId,
        ingredient_count: ingredients.length,
      });

      const savedMeal = await mealsRepository.updateMeal(
        requestAuthService.createUserScopedClient(accessToken),
        userId,
        mealId,
        {
          title: updates.title ?? existingMeal.title,
          mealType: updates.mealType ?? existingMeal.mealType,
          eatenAt: updates.eatenAt ?? existingMeal.eatenAt,
          imageUrl:
            updates.imageUrl === undefined ? existingMeal.imageUrl : updates.imageUrl,
          assumptions: updates.assumptions ?? existingMeal.assumptions,
          warnings: updates.warnings ?? existingMeal.warnings,
          ingredients,
          macroTotals: computeMacroTotals(macroCalculatorService, ingredients),
        },
      );

      logger?.info("Updated persisted meal", {
        event: "meals.persistence.update.completed",
        meal_id: mealId,
      });

      return savedMeal;
    },
    async deleteMeal({ accessToken, userId, mealId, logger }) {
      logger?.info("Deleting persisted meal", {
        event: "meals.persistence.delete.started",
        meal_id: mealId,
      });

      const deletedMealId = await mealsRepository.deleteMeal(
        requestAuthService.createUserScopedClient(accessToken),
        userId,
        mealId,
      );

      logger?.info("Deleted persisted meal", {
        event: "meals.persistence.delete.completed",
        meal_id: deletedMealId,
      });

      return deletedMealId;
    },
    async getCalendarMonth({ accessToken, userId, month, timeZone }) {
      const effectiveTimeZone = timeZone ?? defaultTimeZone;
      const { startIso, endIso } = getQueryWindowForLocalMonth(month);
      const meals = await mealsRepository.listMealsInRange(
        requestAuthService.createUserScopedClient(accessToken),
        userId,
        startIso,
        endIso,
      );

      const dayMap = new Map<string, SavedMeal[]>();
      for (const meal of meals) {
        const dateKey = toDateKeyInTimeZone(meal.eatenAt, effectiveTimeZone);
        if (!dateKey.startsWith(`${month}-`)) {
          continue;
        }
        const existing = dayMap.get(dateKey) ?? [];
        existing.push(meal);
        dayMap.set(dateKey, existing);
      }

      return {
        month,
        days: Array.from(dayMap.entries()).map(([date, dayMeals]) => ({
          date,
          mealCount: dayMeals.length,
          macroTotals: macroCalculatorService.sumMacros(
            dayMeals.map((meal) => meal.macroTotals),
          ),
        })),
      };
    },
    async getMealsByDate({ accessToken, userId, date, timeZone }) {
      const effectiveTimeZone = timeZone ?? defaultTimeZone;
      const { startIso, endIso } = getQueryWindowForLocalDate(date);
      const meals = await mealsRepository.listMealsInRange(
        requestAuthService.createUserScopedClient(accessToken),
        userId,
        startIso,
        endIso,
      );
      const mealsOnDate = meals.filter(
        (meal) => toDateKeyInTimeZone(meal.eatenAt, effectiveTimeZone) === date,
      );

      return {
        date,
        meals: mealsOnDate,
        macroTotals: macroCalculatorService.sumMacros(
          mealsOnDate.map((meal) => meal.macroTotals),
        ),
      };
    },
  };
}
