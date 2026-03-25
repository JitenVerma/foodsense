import type {
  NutritionRecord,
  NutritionRepository,
} from "../../repositories/nutrition.repository.js";

export interface NutritionLookupResult extends NutritionRecord {
  matchedAlias: string;
}

export interface NutritionLookupService {
  findIngredientNutrition(name: string): NutritionLookupResult | null;
}

function normalizeName(input: string) {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createNutritionLookupService(
  repository: NutritionRepository,
): NutritionLookupService {
  const records = repository.getAll();

  return {
    findIngredientNutrition(name) {
      const normalizedName = normalizeName(name);

      for (const record of records) {
        const candidates = [record.canonicalName, ...record.aliases];

        for (const candidate of candidates) {
          const normalizedCandidate = normalizeName(candidate);

          if (
            normalizedCandidate === normalizedName ||
            normalizedName.includes(normalizedCandidate) ||
            normalizedCandidate.includes(normalizedName)
          ) {
            return {
              ...record,
              matchedAlias: candidate,
            };
          }
        }
      }

      return null;
    },
  };
}

