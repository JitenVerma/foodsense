import type { FastifyInstance } from "fastify";

import { MealsController } from "../controllers/meals.controller.js";
import type { MealAnalysisOrchestratorService } from "../services/meal/mealAnalysisOrchestrator.service.js";
import type { MealRecalculationService } from "../services/meal/mealRecalculation.service.js";

interface RegisterMealRoutesOptions {
  mealAnalysisOrchestrator: MealAnalysisOrchestratorService;
  mealRecalculationService: MealRecalculationService;
  maxUploadSizeBytes: number;
}

export async function registerMealRoutes(
  server: FastifyInstance,
  options: RegisterMealRoutesOptions,
) {
  const controller = new MealsController(options);

  server.post("/api/v1/meals/analyze", controller.analyzeMeal.bind(controller));
  server.post(
    "/api/v1/meals/recalculate",
    controller.recalculateMeal.bind(controller),
  );
}

