import { AiProviderError } from "../../lib/errors.js";
import type { CanonicalDishCandidate } from "../meal/dishCanonicalizer.service.js";

export interface RecipeSearchResult {
  title: string;
  dishName: string;
  ingredientsRaw: string[];
}

export interface RecipeSearchService {
  searchRecipes(input: {
    dishCandidates: CanonicalDishCandidate[];
  }): Promise<{
    recipes: RecipeSearchResult[];
    warnings: string[];
  }>;
}

interface ApiNinjasRecipeSearchOptions {
  apiKey?: string;
}

function buildQueryVariants(dishName: string) {
  const normalized = dishName.toLowerCase();
  const withoutRiceTail = normalized.replace(/\s+with\s+.+$/, "").trim();

  return Array.from(new Set([normalized, withoutRiceTail])).filter(Boolean);
}

function coerceIngredients(input: unknown) {
  if (Array.isArray(input)) {
    return input.filter((item): item is string => typeof item === "string");
  }

  if (typeof input === "string") {
    return input
      .split(/\||,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function createRecipeSearchService(
  options: ApiNinjasRecipeSearchOptions,
): RecipeSearchService {
  return {
    async searchRecipes({ dishCandidates }) {
      if (!options.apiKey) {
        return {
          recipes: [],
          warnings: [
            "API Ninjas recipe enrichment is unavailable because API_NINJAS_API_KEY is not configured.",
          ],
        };
      }

      const warnings: string[] = [];
      const recipes: RecipeSearchResult[] = [];

      const candidatesToSearch = dishCandidates
        .filter((candidate) => candidate.confidence >= 0.4)
        .slice(0, 3);

      for (const candidate of candidatesToSearch) {
        for (const query of buildQueryVariants(candidate.name)) {
          const url = new URL("https://api.api-ninjas.com/v1/recipe");
          url.searchParams.set("query", query);

          const response = await fetch(url, {
            headers: {
              "X-Api-Key": options.apiKey,
            },
          });

          if (!response.ok) {
            throw new AiProviderError(
              `API Ninjas recipe search failed with ${response.status}.`,
            );
          }

          const payload = (await response.json()) as Array<{
            title?: string;
            ingredients?: string[] | string;
          }>;

          for (const recipe of payload) {
            const ingredients = coerceIngredients(recipe.ingredients);

            if (!recipe.title || ingredients.length === 0) {
              continue;
            }

            recipes.push({
              title: recipe.title,
              dishName: candidate.name,
              ingredientsRaw: ingredients,
            });
          }

          if (recipes.length >= 4) {
            break;
          }
        }

        if (recipes.length >= 4) {
          break;
        }
      }

      if (recipes.length === 0) {
        warnings.push(
          "Recipe enrichment found little recipe evidence for the detected dish candidates.",
        );
      }

      return {
        recipes,
        warnings,
      };
    },
  };
}
