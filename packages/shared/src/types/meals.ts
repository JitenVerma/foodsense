export type IngredientCategory = "visible" | "inferred";

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
