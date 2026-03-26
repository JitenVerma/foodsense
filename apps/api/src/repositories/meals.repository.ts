import type { Ingredient, SavedMeal } from "@foodsense/shared";
import type { SupabaseClient } from "@supabase/supabase-js";

import { NotFoundError } from "../lib/errors.js";

interface MealRow {
  id: string;
  user_id: string;
  title: string;
  meal_type: SavedMeal["mealType"];
  eaten_at: string;
  image_url: string | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_fat: number | null;
  total_calories: number | null;
  assumptions: unknown;
  warnings: unknown;
  created_at: string;
  updated_at: string;
  meal_ingredients?: MealIngredientRow[];
}

interface MealIngredientRow {
  id: string;
  meal_id: string;
  name: string;
  grams: number | null;
  category: Ingredient["category"];
  confidence: number | null;
  reason: string | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  calories: number | null;
}

export interface PersistedMealPayload {
  title: string;
  mealType: SavedMeal["mealType"];
  eatenAt: string;
  imageUrl?: string | null;
  ingredients: Ingredient[];
  assumptions: string[];
  warnings: string[];
  macroTotals: SavedMeal["macroTotals"];
}

export interface MealsRepository {
  createMeal(
    supabase: SupabaseClient,
    userId: string,
    payload: PersistedMealPayload,
  ): Promise<SavedMeal>;
  listMeals(supabase: SupabaseClient, userId: string): Promise<SavedMeal[]>;
  getMealById(
    supabase: SupabaseClient,
    userId: string,
    mealId: string,
  ): Promise<SavedMeal>;
  updateMeal(
    supabase: SupabaseClient,
    userId: string,
    mealId: string,
    payload: PersistedMealPayload,
  ): Promise<SavedMeal>;
  deleteMeal(
    supabase: SupabaseClient,
    userId: string,
    mealId: string,
  ): Promise<string>;
  listMealsInRange(
    supabase: SupabaseClient,
    userId: string,
    startIso: string,
    endIso: string,
  ): Promise<SavedMeal[]>;
  listMealsByDate(
    supabase: SupabaseClient,
    userId: string,
    date: string,
  ): Promise<SavedMeal[]>;
}

function normalizeNumber(value: number | null | undefined) {
  return typeof value === "number" ? value : 0;
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function mapIngredientRow(row: MealIngredientRow): Ingredient {
  return {
    id: row.id,
    name: row.name,
    grams: normalizeNumber(row.grams),
    category: row.category,
    confidence: normalizeNumber(row.confidence),
    reason: row.reason ?? undefined,
    macros: {
      protein_g: normalizeNumber(row.protein),
      carbs_g: normalizeNumber(row.carbs),
      fat_g: normalizeNumber(row.fat),
      calories_kcal: normalizeNumber(row.calories),
    },
    nutritionMatch: row.name,
  };
}

function mapMealRow(row: MealRow): SavedMeal {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    mealType: row.meal_type,
    eatenAt: row.eaten_at,
    imageUrl: row.image_url,
    ingredients: (row.meal_ingredients ?? []).map(mapIngredientRow),
    macroTotals: {
      protein_g: normalizeNumber(row.total_protein),
      carbs_g: normalizeNumber(row.total_carbs),
      fat_g: normalizeNumber(row.total_fat),
      calories_kcal: normalizeNumber(row.total_calories),
    },
    assumptions: normalizeStringArray(row.assumptions),
    warnings: normalizeStringArray(row.warnings),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createIngredientInsertRows(mealId: string, ingredients: Ingredient[]) {
  return ingredients.map((ingredient) => ({
    meal_id: mealId,
    name: ingredient.name,
    grams: ingredient.grams,
    category: ingredient.category,
    confidence: ingredient.confidence,
    reason: ingredient.reason ?? null,
    protein: ingredient.macros?.protein_g ?? 0,
    carbs: ingredient.macros?.carbs_g ?? 0,
    fat: ingredient.macros?.fat_g ?? 0,
    calories: ingredient.macros?.calories_kcal ?? 0,
  }));
}

async function fetchMealOrThrow(
  supabase: SupabaseClient,
  userId: string,
  mealId: string,
) {
  const { data, error } = await supabase
    .from("meals")
    .select("*, meal_ingredients(*)")
    .eq("id", mealId)
    .eq("user_id", userId)
    .maybeSingle<MealRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new NotFoundError("Meal not found.");
  }

  return mapMealRow(data);
}

export function createMealsRepository(): MealsRepository {
  return {
    async createMeal(supabase, userId, payload) {
      const { data, error } = await supabase
        .from("meals")
        .insert({
          user_id: userId,
          title: payload.title,
          meal_type: payload.mealType,
          eaten_at: payload.eatenAt,
          image_url: payload.imageUrl ?? null,
          total_protein: payload.macroTotals.protein_g,
          total_carbs: payload.macroTotals.carbs_g,
          total_fat: payload.macroTotals.fat_g,
          total_calories: payload.macroTotals.calories_kcal,
          assumptions: payload.assumptions,
          warnings: payload.warnings,
        })
        .select("id")
        .single<{ id: string }>();

      if (error) {
        throw error;
      }

      const ingredientRows = createIngredientInsertRows(data.id, payload.ingredients);
      if (ingredientRows.length > 0) {
        const { error: ingredientError } = await supabase
          .from("meal_ingredients")
          .insert(ingredientRows);

        if (ingredientError) {
          throw ingredientError;
        }
      }

      return fetchMealOrThrow(supabase, userId, data.id);
    },
    async listMeals(supabase, userId) {
      const { data, error } = await supabase
        .from("meals")
        .select("*, meal_ingredients(*)")
        .eq("user_id", userId)
        .order("eaten_at", { ascending: false })
        .returns<MealRow[]>();

      if (error) {
        throw error;
      }

      return (data ?? []).map(mapMealRow);
    },
    async getMealById(supabase, userId, mealId) {
      return fetchMealOrThrow(supabase, userId, mealId);
    },
    async updateMeal(supabase, userId, mealId, payload) {
      const { error } = await supabase
        .from("meals")
        .update({
          title: payload.title,
          meal_type: payload.mealType,
          eaten_at: payload.eatenAt,
          image_url: payload.imageUrl ?? null,
          total_protein: payload.macroTotals.protein_g,
          total_carbs: payload.macroTotals.carbs_g,
          total_fat: payload.macroTotals.fat_g,
          total_calories: payload.macroTotals.calories_kcal,
          assumptions: payload.assumptions,
          warnings: payload.warnings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mealId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      const { error: deleteIngredientsError } = await supabase
        .from("meal_ingredients")
        .delete()
        .eq("meal_id", mealId);

      if (deleteIngredientsError) {
        throw deleteIngredientsError;
      }

      const ingredientRows = createIngredientInsertRows(mealId, payload.ingredients);
      if (ingredientRows.length > 0) {
        const { error: ingredientError } = await supabase
          .from("meal_ingredients")
          .insert(ingredientRows);

        if (ingredientError) {
          throw ingredientError;
        }
      }

      return fetchMealOrThrow(supabase, userId, mealId);
    },
    async deleteMeal(supabase, userId, mealId) {
      const { data, error } = await supabase
        .from("meals")
        .delete()
        .eq("id", mealId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle<{ id: string }>();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new NotFoundError("Meal not found.");
      }

      return data.id;
    },
    async listMealsInRange(supabase, userId, startIso, endIso) {
      const { data, error } = await supabase
        .from("meals")
        .select("*, meal_ingredients(*)")
        .eq("user_id", userId)
        .gte("eaten_at", startIso)
        .lt("eaten_at", endIso)
        .order("eaten_at", { ascending: true })
        .returns<MealRow[]>();

      if (error) {
        throw error;
      }

      return (data ?? []).map(mapMealRow);
    },
    async listMealsByDate(supabase, userId, date) {
      const startIso = `${date}T00:00:00.000Z`;
      const endDate = new Date(startIso);
      endDate.setUTCDate(endDate.getUTCDate() + 1);

      return this.listMealsInRange(
        supabase,
        userId,
        startIso,
        endDate.toISOString(),
      );
    },
  };
}
