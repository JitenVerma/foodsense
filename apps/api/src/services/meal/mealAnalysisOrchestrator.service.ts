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
import {
  type StructuredLogger,
  logServiceWarning,
  logStep,
} from "../../lib/logger.js";

export interface MealAnalysisOrchestratorService {
  analyze(input: {
    mimeType: string;
    imageBuffer: Buffer;
    maxUploadSizeBytes: number;
    logger: StructuredLogger;
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
  logger: StructuredLogger | FastifyBaseLogger | Console;
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
    async analyze({ mimeType, imageBuffer, maxUploadSizeBytes, logger }) {
      const serviceLogger = logger.child({
        service: "mealAnalysisOrchestrator",
      });

      serviceLogger.info("Meal analysis pipeline started", {
        event: "analysis.pipeline.started",
        mime_type: mimeType,
        image_size_bytes: imageBuffer.byteLength,
      });

      const preprocessedImage = await logStep(
        serviceLogger,
        "image_preprocessing",
        () =>
          options.imagePreprocessorService.preprocess({
            buffer: imageBuffer,
            mimeType,
            maxUploadSizeBytes,
          }),
        {
          mime_type: mimeType,
        },
      );

      const rawAiResponse = await logStep(
        serviceLogger,
        "gemini_meal_analysis",
        () => options.mealAnalyzer.analyzeMealImage(preprocessedImage),
        {
          model_stage: "gemini",
        },
      );

      const parsedAiResponse = await logStep(
        serviceLogger,
        "ai_response_parsing",
        () => Promise.resolve(parseMealAnalysisAiResponse(rawAiResponse)),
      );

      const canonicalDishCandidates = await logStep(
        serviceLogger,
        "dish_canonicalization",
        () =>
          Promise.resolve(
            options.dishCanonicalizerService.canonicalize(
              parsedAiResponse.dishCandidates,
            ),
          ),
        {
          dish_candidate_count: parsedAiResponse.dishCandidates.length,
        },
      );

      const recipeSearchResult = await logStep(
        serviceLogger,
        "recipe_search",
        () =>
          options.recipeSearchService.searchRecipes({
            dishCandidates: canonicalDishCandidates,
          }),
        {
          canonical_dish_candidate_count: canonicalDishCandidates.length,
        },
      );

      const normalizedRecipeIngredients = await logStep(
        serviceLogger,
        "recipe_ingredient_normalization",
        () =>
          Promise.resolve(
            recipeSearchResult.recipes.map((recipe) =>
              options.recipeIngredientNormalizerService.normalizeIngredientList(
                recipe.ingredientsRaw,
              ),
            ),
          ),
        {
          recipe_count: recipeSearchResult.recipes.length,
        },
      );

      const aggregatedRecipeIngredients = await logStep(
        serviceLogger,
        "recipe_ingredient_aggregation",
        () =>
          Promise.resolve(
            options.ingredientAggregatorService.aggregate({
              normalizedRecipeIngredients,
            }),
          ),
        {
          normalized_recipe_count: normalizedRecipeIngredients.length,
        },
      );

      const inferredByRules = await logStep(
        serviceLogger,
        "fallback_ingredient_inference",
        () =>
          Promise.resolve(
            options.ingredientInferenceService.inferFromDishCandidates(
              canonicalDishCandidates,
            ),
          ),
        {
          canonical_dish_candidate_count: canonicalDishCandidates.length,
        },
      );

      const mergedIngredients = await logStep(
        serviceLogger,
        "ingredient_merging",
        () =>
          Promise.resolve(
            options.ingredientMergerService.merge({
              visibleIngredients: parsedAiResponse.visibleIngredients,
              aggregatedRecipeIngredients,
              fallbackInferredIngredients: inferredByRules,
              inferGrams: (ingredientName) =>
                options.portionEstimatorService.estimateInferredIngredientGrams({
                  ingredientName,
                  dishNames: canonicalDishCandidates.map(
                    (candidate) => candidate.name,
                  ),
                }),
            }),
          ),
        {
          visible_ingredient_count: parsedAiResponse.visibleIngredients.length,
          aggregated_recipe_ingredient_count: aggregatedRecipeIngredients.length,
        },
      );

      const warnings = [...parsedAiResponse.warnings, ...recipeSearchResult.warnings];
      const assumptions = [...parsedAiResponse.assumptions];

      if (mergedIngredients.some((ingredient) => ingredient.category === "inferred")) {
        assumptions.push(
          "Some hidden ingredients were inferred from recipe evidence or dish patterns.",
        );
      }

      const enrichedIngredients: Ingredient[] = await logStep(
        serviceLogger,
        "nutrition_lookup_and_macro_calculation",
        async () =>
          Promise.all(
            mergedIngredients.map(async (ingredient, index) => {
              const nutritionMatch =
                await options.nutritionLookupService.findIngredientNutrition(
                  ingredient.name,
                );

              if (!nutritionMatch) {
                warnings.push(
                  `No nutrition match found for "${ingredient.name}". Macros set to zero.`,
                );
                logServiceWarning(serviceLogger, "Nutrition lookup miss", {
                  ingredient: ingredient.name,
                  step: "nutrition_lookup_and_macro_calculation",
                });
              } else if (nutritionMatch.source === "local-fallback") {
                warnings.push(
                  `USDA lookup did not resolve "${ingredient.name}", so a local fallback nutrition mapping was used.`,
                );
                serviceLogger.warn("Using local nutrition fallback", {
                  event: "nutrition.lookup.local_fallback",
                  ingredient: ingredient.name,
                });
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
          ),
        {
          merged_ingredient_count: mergedIngredients.length,
        },
      );

      const macroTotals = await logStep(
        serviceLogger,
        "macro_total_aggregation",
        () =>
          Promise.resolve(
            options.macroCalculatorService.sumMacros(
              enrichedIngredients.map(
                (ingredient) => ingredient.macros ?? zeroMacros(),
              ),
            ),
          ),
        {
          ingredient_count: enrichedIngredients.length,
        },
      );

      serviceLogger.info("Meal analysis pipeline completed", {
        event: "analysis.pipeline.completed",
        visible_ingredient_count: enrichedIngredients.filter(
          (ingredient) => ingredient.category === "visible",
        ).length,
        inferred_ingredient_count: enrichedIngredients.filter(
          (ingredient) => ingredient.category === "inferred",
        ).length,
      });

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
        macroTotals,
        assumptions: Array.from(new Set(assumptions)),
        warnings: Array.from(new Set(warnings)),
      };
    },
  };
}
