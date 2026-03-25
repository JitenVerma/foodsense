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
import { createIngredientInferenceService } from "../services/meal/ingredientInference.service.js";
import { createImagePreprocessorService } from "../services/storage/imagePreprocessor.service.js";
import { createMealAnalysisOrchestratorService } from "../services/meal/mealAnalysisOrchestrator.service.js";
import { createMealRecalculationService } from "../services/meal/mealRecalculation.service.js";
import { AppError } from "../lib/errors.js";

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
    request.log.error(error);

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
  const nutritionRepository = createNutritionRepository();
  const nutritionLookupService = createNutritionLookupService(nutritionRepository);
  const macroCalculatorService = createMacroCalculatorService();
  const imagePreprocessorService = createImagePreprocessorService();
  const ingredientInferenceService = createIngredientInferenceService();

  const analyzerMode =
    providedMealAnalyzer || env.GOOGLE_GENAI_API_KEY
      ? "gemini"
      : env.ALLOW_DEV_ANALYSIS_FALLBACK
        ? "development-fallback"
        : "gemini";

  const mealAnalyzer =
    providedMealAnalyzer ??
    (analyzerMode === "development-fallback"
      ? createDevelopmentMealAnalyzerService()
      : createGeminiMealAnalyzerService({
          apiKey: env.GOOGLE_GENAI_API_KEY,
          model: env.GOOGLE_GENAI_MODEL,
        }));

  if (analyzerMode === "development-fallback") {
    server.log.warn(
      "FoodSense API started in development fallback mode because GOOGLE_GENAI_API_KEY was not loaded.",
    );
  } else {
    server.log.info(
      { model: env.GOOGLE_GENAI_MODEL },
      "FoodSense API started with Gemini analysis enabled.",
    );
  }

  const mealAnalysisOrchestrator = createMealAnalysisOrchestratorService({
    mealAnalyzer,
    ingredientInferenceService,
    nutritionLookupService,
    macroCalculatorService,
    imagePreprocessorService,
    logger: server.log,
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
