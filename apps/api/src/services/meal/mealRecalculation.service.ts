import type {
  Ingredient,
  RecalculateMealRequest,
  RecalculateMealResponse,
} from "@foodsense/shared";

import type { StructuredLogger } from "../../lib/logger.js";
import { logStep } from "../../lib/logger.js";
import type { NutritionLookupService } from "../nutrition/nutritionLookup.service.js";
import type { MacroCalculatorService } from "../nutrition/macroCalculator.service.js";

function zeroMacros() {
  return {
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    calories_kcal: 0,
  };
}

export interface MealRecalculationService {
  recalculate(
    input: RecalculateMealRequest & { logger?: StructuredLogger },
  ): Promise<RecalculateMealResponse>;
}

interface MealRecalculationServiceOptions {
  nutritionLookupService: NutritionLookupService;
  macroCalculatorService: MacroCalculatorService;
}

export function createMealRecalculationService(
  options: MealRecalculationServiceOptions,
): MealRecalculationService {
  return {
    async recalculate(input) {
      const logger = input.logger?.child({
        service: "mealRecalculationService",
      });
      const warnings: string[] = [];

      logger?.info("Meal recalculation started", {
        event: "recalculation.pipeline.started",
        ingredient_count: input.ingredients.length,
      });

      const ingredients: Ingredient[] = logger
        ? await logStep(
            logger,
            "recalculation_nutrition_lookup",
            async () =>
              Promise.all(
                input.ingredients.map(async (ingredient) => {
                  const nutritionMatch =
                    await options.nutritionLookupService.findIngredientNutrition(
                      ingredient.name,
                    );

                  if (!nutritionMatch) {
                    warnings.push(
                      `No nutrition match found for "${ingredient.name}".`,
                    );
                    logger.warn("Nutrition lookup miss during recalculation", {
                      event: "recalculation.nutrition_lookup.miss",
                      ingredient: ingredient.name,
                    });
                  } else if (nutritionMatch.source === "local-fallback") {
                    warnings.push(
                      `USDA lookup did not resolve "${ingredient.name}", so a local fallback nutrition mapping was used.`,
                    );
                    logger.warn(
                      "Using local nutrition fallback during recalculation",
                      {
                        event: "recalculation.nutrition_lookup.local_fallback",
                        ingredient: ingredient.name,
                      },
                    );
                  }

                  return {
                    ...ingredient,
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
              ingredient_count: input.ingredients.length,
            },
          )
        : await Promise.all(
            input.ingredients.map(async (ingredient) => {
              const nutritionMatch =
                await options.nutritionLookupService.findIngredientNutrition(
                  ingredient.name,
                );

              if (!nutritionMatch) {
                warnings.push(`No nutrition match found for "${ingredient.name}".`);
              } else if (nutritionMatch.source === "local-fallback") {
                warnings.push(
                  `USDA lookup did not resolve "${ingredient.name}", so a local fallback nutrition mapping was used.`,
                );
              }

              return {
                ...ingredient,
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

      const macroTotals = logger
        ? await logStep(
            logger,
            "recalculation_macro_total_aggregation",
            () =>
              Promise.resolve(
                options.macroCalculatorService.sumMacros(
                  ingredients.map((ingredient) => ingredient.macros ?? zeroMacros()),
                ),
              ),
            {
              ingredient_count: ingredients.length,
            },
          )
        : options.macroCalculatorService.sumMacros(
            ingredients.map((ingredient) => ingredient.macros ?? zeroMacros()),
          );

      logger?.info("Meal recalculation completed", {
        event: "recalculation.pipeline.completed",
        ingredient_count: ingredients.length,
      });

      return {
        ingredients,
        macroTotals,
        warnings: Array.from(new Set(warnings)),
      };
    },
  };
}
