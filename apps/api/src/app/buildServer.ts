import { randomUUID } from "node:crypto";

import Fastify, { type FastifyInstance } from "fastify";

import { getEnv, type AppEnv } from "../config/env.js";
import { registerPlugins } from "./plugins.js";
import { registerHealthRoutes } from "../routes/health.routes.js";
import { registerMealRoutes } from "../routes/meals.routes.js";
import { createNutritionRepository } from "../repositories/nutrition.repository.js";
import { createNutritionLookupService } from "../services/nutrition/nutritionLookup.service.js";
import { createMacroCalculatorService } from "../services/nutrition/macroCalculator.service.js";
import {
  createDevelopmentMealAnalyzerService,
  createGeminiMealAnalyzerService,
  type MealAnalyzerService,
} from "../services/ai/geminiMealAnalyzer.service.js";
import { createIngredientAggregatorService } from "../services/recipe/ingredientAggregator.service.js";
import { createRecipeIngredientNormalizerService } from "../services/recipe/recipeIngredientNormalizer.service.js";
import { createRecipeSearchService } from "../services/recipe/recipeSearch.service.js";
import { createDishCanonicalizerService } from "../services/meal/dishCanonicalizer.service.js";
import { createIngredientInferenceService } from "../services/meal/ingredientInference.service.js";
import { createIngredientMergerService } from "../services/meal/ingredientMerger.service.js";
import { createPortionEstimatorService } from "../services/meal/portionEstimator.service.js";
import { createImagePreprocessorService } from "../services/storage/imagePreprocessor.service.js";
import { createMealAnalysisOrchestratorService } from "../services/meal/mealAnalysisOrchestrator.service.js";
import { createMealRecalculationService } from "../services/meal/mealRecalculation.service.js";
import { AppError } from "../lib/errors.js";
import { createLogger } from "../lib/logger.js";

interface BuildServerOptions {
  envOverrides?: Partial<NodeJS.ProcessEnv>;
  mealAnalyzer?: MealAnalyzerService;
}

export async function buildServer(
  options: BuildServerOptions = {},
): Promise<FastifyInstance> {
  const env = getEnv(options.envOverrides);

  const server = Fastify({
    logger: env.NODE_ENV !== "test",
    requestIdHeader: "x-request-id",
    genReqId(request) {
      const headerValue = request.headers["x-request-id"];
      return (typeof headerValue === "string" && headerValue.trim()) || randomUUID();
    },
  });

  await registerPlugins(server, {
    maxUploadSizeBytes: env.maxUploadSizeBytes,
  });

  const services = createServices(server, env, options.mealAnalyzer);

  await registerHealthRoutes(server);
  await registerMealRoutes(server, {
    mealAnalysisOrchestrator: services.mealAnalysisOrchestrator,
    mealRecalculationService: services.mealRecalculationService,
    maxUploadSizeBytes: env.maxUploadSizeBytes,
  });

  server.setErrorHandler((error, request, reply) => {
    const normalizedError =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : {
            message: String(error),
          };

    createLogger(request.log).error("Request failed", {
      event: "http.request.failed",
      request_id: request.id,
      method: request.method,
      route: request.url,
      status_code:
        error instanceof AppError ? error.statusCode : 500,
      error: normalizedError,
    });

    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        error: error.code,
        message: error.message,
      });
    }

    return reply.code(500).send({
      error: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong while processing the request.",
    });
  });

  return server;
}

function createServices(
  server: FastifyInstance,
  env: AppEnv,
  providedMealAnalyzer?: MealAnalyzerService,
) {
  const appLogger = createLogger(server.log);
  const nutritionRepository = createNutritionRepository();
  const nutritionLookupService = createNutritionLookupService({
    repository: nutritionRepository,
    usdaApiKey: env.USDA_API_KEY,
  });
  const macroCalculatorService = createMacroCalculatorService();
  const imagePreprocessorService = createImagePreprocessorService();
  const dishCanonicalizerService = createDishCanonicalizerService();
  const recipeSearchService = createRecipeSearchService({
    apiKey: env.API_NINJAS_API_KEY,
  });
  const recipeIngredientNormalizerService =
    createRecipeIngredientNormalizerService();
  const ingredientAggregatorService = createIngredientAggregatorService();
  const ingredientInferenceService = createIngredientInferenceService();
  const ingredientMergerService = createIngredientMergerService();
  const portionEstimatorService = createPortionEstimatorService();

  const analyzerMode =
    providedMealAnalyzer || env.GEMINI_API_KEY
      ? "gemini"
      : env.ALLOW_DEV_ANALYSIS_FALLBACK
        ? "development-fallback"
        : "gemini";

  const mealAnalyzer =
    providedMealAnalyzer ??
    (analyzerMode === "development-fallback"
      ? createDevelopmentMealAnalyzerService()
      : createGeminiMealAnalyzerService({
          apiKey: env.GEMINI_API_KEY,
          model: env.GEMINI_MODEL,
        }));

  if (analyzerMode === "development-fallback") {
    appLogger.warn(
      "FoodSense API started in development fallback mode because GEMINI_API_KEY was not loaded.",
      {
        event: "app.analysis_mode",
        analysis_mode: analyzerMode,
      },
    );
  } else {
    appLogger.info("FoodSense API started with Gemini analysis enabled.", {
      event: "app.analysis_mode",
      analysis_mode: analyzerMode,
      model: env.GEMINI_MODEL,
      recipe_enrichment_enabled: Boolean(env.API_NINJAS_API_KEY),
      usda_enabled: Boolean(env.USDA_API_KEY),
    });
  }

  if (!env.API_NINJAS_API_KEY) {
    appLogger.warn("API Ninjas recipe enrichment is not configured.", {
      event: "app.integration.missing_config",
      integration: "api_ninjas",
    });
  }

  if (!env.USDA_API_KEY) {
    appLogger.warn("USDA nutrition lookup is not configured; local fallback mappings will be used.", {
      event: "app.integration.missing_config",
      integration: "usda",
    });
  }

  if (!env.GEMINI_API_KEY && analyzerMode !== "development-fallback") {
    appLogger.error("Gemini analysis was requested without a GEMINI_API_KEY.", {
      event: "app.integration.missing_config",
      integration: "gemini",
    });
  }

  const mealAnalysisOrchestrator = createMealAnalysisOrchestratorService({
    mealAnalyzer,
    dishCanonicalizerService,
    recipeSearchService,
    recipeIngredientNormalizerService,
    ingredientAggregatorService,
    ingredientMergerService,
    portionEstimatorService,
    ingredientInferenceService,
    nutritionLookupService,
    macroCalculatorService,
    imagePreprocessorService,
    logger: appLogger,
  });

  const mealRecalculationService = createMealRecalculationService({
    nutritionLookupService,
    macroCalculatorService,
  });

  return {
    mealAnalysisOrchestrator,
    mealRecalculationService,
    analyzerMode,
  };
}
