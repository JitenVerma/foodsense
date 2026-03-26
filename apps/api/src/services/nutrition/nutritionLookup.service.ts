import type {
  NutritionRecord,
  NutritionRepository,
} from "../../repositories/nutrition.repository.js";

export interface NutritionLookupResult extends NutritionRecord {
  matchedAlias: string;
  source: "usda" | "local-fallback";
  fdcId?: number;
  fdcDescription?: string;
}

export interface NutritionLookupService {
  findIngredientNutrition(name: string): Promise<NutritionLookupResult | null>;
}

interface NutritionLookupServiceOptions {
  repository: NutritionRepository;
  usdaApiKey?: string;
}

interface UsdaSearchResponse {
  foods?: Array<{
    fdcId?: number;
    description?: string;
    dataType?: string;
  }>;
}

function normalizeName(input: string) {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getFallbackMatch(records: NutritionRecord[], name: string) {
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
          source: "local-fallback" as const,
        };
      }
    }
  }

  return null;
}

function scoreUsdaCandidate(
  ingredientName: string,
  candidate: { description?: string; dataType?: string },
) {
  const normalizedIngredient = normalizeName(ingredientName);
  const normalizedDescription = normalizeName(candidate.description ?? "");

  let score = 0;
  if (normalizedDescription === normalizedIngredient) {
    score += 10;
  }

  if (normalizedDescription.includes(normalizedIngredient)) {
    score += 5;
  }

  if (normalizedIngredient.includes(normalizedDescription)) {
    score += 3;
  }

  if (/Foundation|Survey|SR Legacy/i.test(candidate.dataType ?? "")) {
    score += 2;
  }

  if (/Branded/i.test(candidate.dataType ?? "")) {
    score -= 2;
  }

  return score;
}

function readNutrientValue(
  nutrients: Array<{
    amount?: number;
    nutrient?: { number?: string; name?: string };
    nutrientNumber?: string;
    nutrientName?: string;
  }>,
  nutrientMatchers: Array<{ number?: string; nameIncludes?: string }>,
) {
  for (const nutrient of nutrients) {
    const nutrientNumber = nutrient.nutrient?.number ?? nutrient.nutrientNumber;
    const nutrientName = (
      nutrient.nutrient?.name ??
      nutrient.nutrientName ??
      ""
    ).toLowerCase();

    const matcher = nutrientMatchers.find(
      (candidate) =>
        (candidate.number && candidate.number === nutrientNumber) ||
        (candidate.nameIncludes && nutrientName.includes(candidate.nameIncludes)),
    );

    if (matcher) {
      return nutrient.amount ?? 0;
    }
  }

  return 0;
}

async function searchUsdaFood(apiKey: string, ingredientName: string) {
  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: ingredientName,
        pageSize: 5,
      }),
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as UsdaSearchResponse;
  const foods = payload.foods ?? [];
  if (foods.length === 0) {
    return null;
  }

  const bestMatch = foods
    .filter((food): food is Required<Pick<typeof food, "fdcId" | "description">> & typeof food =>
      typeof food.fdcId === "number" && typeof food.description === "string",
    )
    .sort(
      (left, right) =>
        scoreUsdaCandidate(ingredientName, right) -
        scoreUsdaCandidate(ingredientName, left),
    )[0];

  return bestMatch ?? null;
}

async function fetchUsdaFoodDetails(apiKey: string, fdcId: number) {
  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${encodeURIComponent(apiKey)}`,
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as {
    description?: string;
    foodNutrients?: Array<{
      amount?: number;
      nutrient?: { number?: string; name?: string };
      nutrientNumber?: string;
      nutrientName?: string;
    }>;
  };
}

export function createNutritionLookupService(
  options: NutritionLookupServiceOptions,
): NutritionLookupService {
  const fallbackRecords = options.repository.getAll();

  return {
    async findIngredientNutrition(name) {
      if (options.usdaApiKey) {
        const searchMatch = await searchUsdaFood(options.usdaApiKey, name);

        if (searchMatch?.fdcId) {
          const details = await fetchUsdaFoodDetails(
            options.usdaApiKey,
            searchMatch.fdcId,
          );

          const nutrients = details?.foodNutrients ?? [];
          if (nutrients.length > 0) {
            return {
              canonicalName: normalizeName(name),
              aliases: [],
              matchedAlias: searchMatch.description ?? name,
              source: "usda",
              fdcId: searchMatch.fdcId,
              fdcDescription: details?.description ?? searchMatch.description,
              proteinPer100g: readNutrientValue(nutrients, [
                { number: "1003" },
                { nameIncludes: "protein" },
              ]),
              carbsPer100g: readNutrientValue(nutrients, [
                { number: "1005" },
                { nameIncludes: "carbohydrate" },
              ]),
              fatPer100g: readNutrientValue(nutrients, [
                { number: "1004" },
                { nameIncludes: "fat" },
              ]),
              caloriesPer100g: readNutrientValue(nutrients, [
                { number: "1008" },
                { nameIncludes: "energy" },
              ]),
            };
          }
        }
      }

      return getFallbackMatch(fallbackRecords, name);
    },
  };
}
