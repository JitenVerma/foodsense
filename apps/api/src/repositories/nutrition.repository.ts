import nutritionReference from "../data/nutrition-reference.json" with { type: "json" };

export interface NutritionRecord {
  canonicalName: string;
  aliases: string[];
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  caloriesPer100g: number;
}

export interface NutritionRepository {
  getAll(): NutritionRecord[];
}

export function createNutritionRepository(): NutritionRepository {
  const records = nutritionReference as NutritionRecord[];

  return {
    getAll() {
      return records;
    },
  };
}

