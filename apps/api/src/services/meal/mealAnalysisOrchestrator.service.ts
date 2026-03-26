import type { FastifyBaseLogger } from "fastify";
import type { Ingredient, MealAnalysisResponse } from "@foodsense/shared";

import { parseMealAnalysisAiResponse } from "../ai/aiResponseParser.js";
import type { MealAnalyzerService } from "../ai/geminiMealAnalyzer.service.js";
import type { DishCanonicalizerService } from "./dishCanonicalizer.service.js";
import type { IngredientInferenceService } from "./ingredientInference.service.js";
import type { NutritionLookupService } from "../nutrition/nutritionLookup.service.js";
import type { MacroCalculatorService } from "../nutrition/macroCalculator.service.js";
import type { ImagePreprocessorService } from "../storage/imagePreprocessor.service.js";
import type { RecipeSearchService } from "../recipe/recipeSearch.service.js";
import type { RecipeIngredientNormalizerService } from "../recipe/recipeIngredientNormalizer.service.js";
import type { IngredientAggregatorService } from "../recipe/ingredientAggregator.service.js";
import type { IngredientMergerService } from "./ingredientMerger.service.js";
import type { PortionEstimatorService } from "./portionEstimator.service.js";
import { createIngredientId } from "../../utils/ids.js";
import { logServiceWarning } from "../../lib/logger.js";

export interface MealAnalysisOrchestratorService {
  analyze(input: {
    mimeType: string;
    imageBuffer: Buffer;
    maxUploadSizeBytes: number;
  }): Promise<MealAnalysisResponse>;
}

interface MealAnalysisOrchestratorOptions {
  mealAnalyzer: MealAnalyzerService;
  dishCanonicalizerService: DishCanonicalizerService;
  recipeSearchService: RecipeSearchService;
  recipeIngredientNormalizerService: RecipeIngredientNormalizerService;
  ingredientAggregatorService: IngredientAggregatorService;
  ingredientMergerService: IngredientMergerService;
  portionEstimatorService: PortionEstimatorService;
  ingredientInferenceService: IngredientInferenceService;
  nutritionLookupService: NutritionLookupService;
  macroCalculatorService: MacroCalculatorService;
  imagePreprocessorService: ImagePreprocessorService;
  logger: FastifyBaseLogger | Console;
}

function zeroMacros() {
  return {
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    calories_kcal: 0,
  };
}

export function createMealAnalysisOrchestratorService(
  options: MealAnalysisOrchestratorOptions,
): MealAnalysisOrchestratorService {
  return {
    async analyze({ mimeType, imageBuffer, maxUploadSizeBytes }) {
      const preprocessedImage = options.imagePreprocessorService.preprocess({
        buffer: imageBuffer,
        mimeType,
        maxUploadSizeBytes,
      });

      const rawAiResponse = await options.mealAnalyzer.analyzeMealImage(preprocessedImage);
      const parsedAiResponse = parseMealAnalysisAiResponse(rawAiResponse);

      const canonicalDishCandidates = options.dishCanonicalizerService.canonicalize(
        parsedAiResponse.dishCandidates,
      );

      const recipeSearchResult = await options.recipeSearchService.searchRecipes({
        dishCandidates: canonicalDishCandidates,
      });

      const normalizedRecipeIngredients = recipeSearchResult.recipes.map((recipe) =>
        options.recipeIngredientNormalizerService.normalizeIngredientList(
          recipe.ingredientsRaw,
        ),
      );

      const aggregatedRecipeIngredients =
        options.ingredientAggregatorService.aggregate({
          normalizedRecipeIngredients,
        });

      const inferredByRules = options.ingredientInferenceService.inferFromDishCandidates(
        canonicalDishCandidates,
      );

      const mergedIngredients = options.ingredientMergerService.merge({
        visibleIngredients: parsedAiResponse.visibleIngredients,
        aggregatedRecipeIngredients,
        fallbackInferredIngredients: inferredByRules,
        inferGrams: (ingredientName) =>
          options.portionEstimatorService.estimateInferredIngredientGrams({
            ingredientName,
            dishNames: canonicalDishCandidates.map((candidate) => candidate.name),
          }),
      });

      const warnings = [...parsedAiResponse.warnings, ...recipeSearchResult.warnings];
      const assumptions = [...parsedAiResponse.assumptions];

      if (mergedIngredients.some((ingredient) => ingredient.category === "inferred")) {
        assumptions.push(
          "Some hidden ingredients were inferred from recipe evidence or dish patterns.",
        );
      }

      const enrichedIngredients: Ingredient[] = await Promise.all(
        mergedIngredients.map(async (ingredient, index) => {
          const nutritionMatch =
            await options.nutritionLookupService.findIngredientNutrition(
              ingredient.name,
            );

          if (!nutritionMatch) {
            warnings.push(
              `No nutrition match found for "${ingredient.name}". Macros set to zero.`,
            );
            logServiceWarning(options.logger, "Nutrition lookup miss", {
              ingredient: ingredient.name,
            });
          } else if (nutritionMatch.source === "local-fallback") {
            warnings.push(
              `USDA lookup did not resolve "${ingredient.name}", so a local fallback nutrition mapping was used.`,
            );
          }

          return {
            id: createIngredientId(ingredient.name, index),
            name: ingredient.name,
            grams: ingredient.grams,
            category: ingredient.category,
            confidence: ingredient.confidence,
            reason: ingredient.reason,
            notes: ingredient.notes,
            nutritionMatch:
              nutritionMatch?.fdcDescription ??
              nutritionMatch?.canonicalName ??
              null,
            macros: nutritionMatch
              ? options.macroCalculatorService.calculateIngredientMacros({
                  grams: ingredient.grams,
                  nutritionPer100g: nutritionMatch,
                })
              : zeroMacros(),
          };
        }),
      );

      return {
        dishCandidates: canonicalDishCandidates.map((candidate) => ({
          name: candidate.name,
          confidence: candidate.confidence,
        })),
        visibleIngredients: enrichedIngredients.filter(
          (ingredient) => ingredient.category === "visible",
        ),
        inferredIngredients: enrichedIngredients.filter(
          (ingredient) => ingredient.category === "inferred",
        ),
        macroTotals: options.macroCalculatorService.sumMacros(
          enrichedIngredients.map((ingredient) => ingredient.macros ?? zeroMacros()),
        ),
        assumptions: Array.from(new Set(assumptions)),
        warnings: Array.from(new Set(warnings)),
      };
    },
  };
}
