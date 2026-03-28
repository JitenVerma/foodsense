export type IngredientCategory = "visible" | "inferred" | "manual";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface DishCandidate {
  name: string;
  confidence: number;
}

export interface MacroTotals {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  calories_kcal: number;
}

export interface Ingredient {
  id: string;
  name: string;
  grams: number;
  category: IngredientCategory;
  confidence: number;
  reason?: string;
  notes?: string;
  macros?: MacroTotals;
  nutritionMatch?: string | null;
}

export interface MealAnalysisResponse {
  dishCandidates: DishCandidate[];
  visibleIngredients: Ingredient[];
  inferredIngredients: Ingredient[];
  macroTotals: MacroTotals;
  assumptions: string[];
  warnings: string[];
}

export interface RecalculateMealRequest {
  ingredients: Ingredient[];
}

export interface RecalculateMealResponse {
  ingredients: Ingredient[];
  macroTotals: MacroTotals;
  warnings: string[];
}

export interface SavedMeal {
  id: string;
  userId: string;
  title: string;
  mealType: MealType;
  eatenAt: string;
  imageUrl: string | null;
  isFavorite: boolean;
  isLibraryTemplate: boolean;
  sourceMealId: string | null;
  lastReusedAt: string | null;
  ingredients: Ingredient[];
  macroTotals: MacroTotals;
  assumptions: string[];
  warnings: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SaveMealRequest {
  title: string;
  mealType: MealType;
  eatenAt: string;
  imageUrl?: string | null;
  isFavorite?: boolean;
  isLibraryTemplate?: boolean;
  sourceMealId?: string | null;
  ingredients: Ingredient[];
  assumptions: string[];
  warnings: string[];
}

export interface UpdateMealRequest {
  title?: string;
  mealType?: MealType;
  eatenAt?: string;
  imageUrl?: string | null;
  isFavorite?: boolean;
  isLibraryTemplate?: boolean;
  sourceMealId?: string | null;
  ingredients?: Ingredient[];
  assumptions?: string[];
  warnings?: string[];
}

export interface DailyMealSummary {
  date: string;
  mealCount: number;
  macroTotals: MacroTotals;
}

export interface CalendarMonthResponse {
  month: string;
  days: DailyMealSummary[];
}

export interface MealsByDateResponse {
  date: string;
  meals: SavedMeal[];
  macroTotals: MacroTotals;
}
