import type { FastifyInstance } from "fastify";

import { MealsController } from "../controllers/meals.controller.js";
import type { RequestAuthService } from "../services/auth/requestAuth.service.js";
import type { MealAnalysisOrchestratorService } from "../services/meal/mealAnalysisOrchestrator.service.js";
import type { MealPersistenceService } from "../services/meal/mealPersistence.service.js";
import type { MealRecalculationService } from "../services/meal/mealRecalculation.service.js";

interface RegisterMealRoutesOptions {
  mealAnalysisOrchestrator: MealAnalysisOrchestratorService;
  mealRecalculationService: MealRecalculationService;
  mealPersistenceService: MealPersistenceService;
  requestAuthService: RequestAuthService;
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
  server.post("/api/v1/meals", controller.saveMeal.bind(controller));
  server.get("/api/v1/meals", controller.listMeals.bind(controller));
  server.get("/api/v1/meals/:id", controller.getMealById.bind(controller));
  server.patch("/api/v1/meals/:id", controller.updateMeal.bind(controller));
  server.delete("/api/v1/meals/:id", controller.deleteMeal.bind(controller));
  server.get("/api/v1/calendar", controller.getCalendarMonth.bind(controller));
  server.get("/api/v1/meals/by-date", controller.getMealsByDate.bind(controller));
}
