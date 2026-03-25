import type { FastifyBaseLogger } from "fastify";
import type { Ingredient, MealAnalysisResponse } from "@foodsense/shared";

import { parseMealAnalysisAiResponse } from "../ai/aiResponseParser.js";
import type { MealAnalyzerService } from "../ai/geminiMealAnalyzer.service.js";
import type { IngredientInferenceService } from "./ingredientInference.service.js";
import type { NutritionLookupService } from "../nutrition/nutritionLookup.service.js";
import type { MacroCalculatorService } from "../nutrition/macroCalculator.service.js";
import type { ImagePreprocessorService } from "../storage/imagePreprocessor.service.js";
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

      const inferredByRules = options.ingredientInferenceService.inferFromDishCandidates(
        parsedAiResponse.dishCandidates,
      );

      const combinedIngredients = [
        ...parsedAiResponse.visibleIngredients.map((ingredient) => ({
          ...ingredient,
          category: "visible" as const,
        })),
        ...parsedAiResponse.inferredIngredients.map((ingredient) => ({
          ...ingredient,
          category: "inferred" as const,
        })),
      ];

      for (const inferredIngredient of inferredByRules) {
        const exists = combinedIngredients.some(
          (ingredient) =>
            ingredient.category === "inferred" &&
            ingredient.name.toLowerCase() === inferredIngredient.name.toLowerCase(),
        );

        if (!exists) {
          combinedIngredients.push({
            ...inferredIngredient,
            category: "inferred" as const,
          });
        }
      }

      const warnings = [...parsedAiResponse.warnings];
      const enrichedIngredients: Ingredient[] = combinedIngredients.map((ingredient, index) => {
        const nutritionMatch = options.nutritionLookupService.findIngredientNutrition(
          ingredient.name,
        );

        if (!nutritionMatch) {
          warnings.push(`No nutrition match found for "${ingredient.name}". Macros set to zero.`);
          logServiceWarning(options.logger, "Nutrition lookup miss", {
            ingredient: ingredient.name,
          });
        }

        return {
          id: createIngredientId(ingredient.name, index),
          name: ingredient.name,
          grams: ingredient.grams,
          category: ingredient.category,
          confidence: ingredient.confidence,
          notes: ingredient.notes,
          nutritionMatch: nutritionMatch?.canonicalName ?? null,
          macros: nutritionMatch
            ? options.macroCalculatorService.calculateIngredientMacros({
                grams: ingredient.grams,
                nutritionPer100g: nutritionMatch,
              })
            : zeroMacros(),
        };
      });

      return {
        dishCandidates: parsedAiResponse.dishCandidates,
        visibleIngredients: enrichedIngredients.filter(
          (ingredient) => ingredient.category === "visible",
        ),
        inferredIngredients: enrichedIngredients.filter(
          (ingredient) => ingredient.category === "inferred",
        ),
        macroTotals: options.macroCalculatorService.sumMacros(
          enrichedIngredients.map((ingredient) => ingredient.macros ?? zeroMacros()),
        ),
        assumptions: parsedAiResponse.assumptions,
        warnings: Array.from(new Set(warnings)),
      };
    },
  };
}

