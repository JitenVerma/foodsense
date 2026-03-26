import type { FastifyReply, FastifyRequest } from "fastify";

import {
  CalendarMonthQuerySchema,
  MealsByDateQuerySchema,
  RecalculateMealBodySchema,
  SaveMealBodySchema,
  UpdateMealBodySchema,
} from "../schemas/meal.schemas.js";
import { InvalidUploadError } from "../lib/errors.js";
import { createRequestLogger } from "../lib/logger.js";
import type { MealAnalysisOrchestratorService } from "../services/meal/mealAnalysisOrchestrator.service.js";
import type { MealPersistenceService } from "../services/meal/mealPersistence.service.js";
import type { MealRecalculationService } from "../services/meal/mealRecalculation.service.js";
import type { RequestAuthService } from "../services/auth/requestAuth.service.js";

interface MealsControllerOptions {
  mealAnalysisOrchestrator: MealAnalysisOrchestratorService;
  mealRecalculationService: MealRecalculationService;
  mealPersistenceService: MealPersistenceService;
  requestAuthService: RequestAuthService;
  maxUploadSizeBytes: number;
}

export class MealsController {
  constructor(private readonly options: MealsControllerOptions) {}

  async analyzeMeal(request: FastifyRequest, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "meals.analyze",
    });

    const file = await request.file();
    if (!file) {
      logger.error("Analyze request missing file upload", {
        event: "meals.analyze.invalid_upload",
      });
      throw new InvalidUploadError("Please attach an image file to analyze.");
    }

    const buffer = await file.toBuffer();
    logger.info("Analyze request accepted upload", {
      event: "meals.analyze.upload_received",
      mime_type: file.mimetype,
      size_bytes: buffer.byteLength,
      filename: file.filename,
    });

    const result = await this.options.mealAnalysisOrchestrator.analyze({
      mimeType: file.mimetype,
      imageBuffer: buffer,
      maxUploadSizeBytes: this.options.maxUploadSizeBytes,
      logger,
    });

    logger.info("Analyze request returning response", {
      event: "meals.analyze.response_ready",
      visible_ingredient_count: result.visibleIngredients.length,
      inferred_ingredient_count: result.inferredIngredients.length,
      dish_candidate_count: result.dishCandidates.length,
    });

    return reply.code(200).send(result);
  }

  async recalculateMeal(request: FastifyRequest, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "meals.recalculate",
    });

    const parsed = RecalculateMealBodySchema.parse(request.body);
    logger.info("Recalculate request accepted", {
      event: "meals.recalculate.request_received",
      ingredient_count: parsed.ingredients.length,
    });

    const result = await this.options.mealRecalculationService.recalculate({
      ...parsed,
      logger,
    });

    logger.info("Recalculate request returning response", {
      event: "meals.recalculate.response_ready",
      ingredient_count: result.ingredients.length,
    });

    return reply.code(200).send(result);
  }

  async saveMeal(request: FastifyRequest, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "meals.save",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const payload = SaveMealBodySchema.parse(request.body);

    logger.info("Save meal request accepted", {
      event: "meals.save.request_received",
      user_id: auth.userId,
      ingredient_count: payload.ingredients.length,
    });

    const savedMeal = await this.options.mealPersistenceService.createMeal({
      accessToken: auth.accessToken,
      userId: auth.userId,
      meal: payload,
      logger,
    });

    return reply.code(201).send(savedMeal);
  }

  async listMeals(request: FastifyRequest, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "meals.list",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const meals = await this.options.mealPersistenceService.listMeals({
      accessToken: auth.accessToken,
      userId: auth.userId,
    });

    logger.info("List meals response ready", {
      event: "meals.list.response_ready",
      user_id: auth.userId,
      meal_count: meals.length,
    });

    return reply.code(200).send(meals);
  }

  async getMealById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const logger = createRequestLogger(request).child({
      operation: "meals.get_by_id",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const meal = await this.options.mealPersistenceService.getMealById({
      accessToken: auth.accessToken,
      userId: auth.userId,
      mealId: request.params.id,
    });

    return reply.code(200).send(meal);
  }

  async updateMeal(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const logger = createRequestLogger(request).child({
      operation: "meals.update",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const payload = UpdateMealBodySchema.parse(request.body);
    const meal = await this.options.mealPersistenceService.updateMeal({
      accessToken: auth.accessToken,
      userId: auth.userId,
      mealId: request.params.id,
      updates: payload,
      logger,
    });

    return reply.code(200).send(meal);
  }

  async deleteMeal(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const logger = createRequestLogger(request).child({
      operation: "meals.delete",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const deletedMealId = await this.options.mealPersistenceService.deleteMeal({
      accessToken: auth.accessToken,
      userId: auth.userId,
      mealId: request.params.id,
      logger,
    });

    logger.info("Delete meal response ready", {
      event: "meals.delete.response_ready",
      user_id: auth.userId,
      meal_id: deletedMealId,
    });

    return reply.code(200).send({
      id: deletedMealId,
      deleted: true,
    });
  }

  async getCalendarMonth(
    request: FastifyRequest<{ Querystring: { month: string; timeZone?: string } }>,
    reply: FastifyReply,
  ) {
    const logger = createRequestLogger(request).child({
      operation: "calendar.month",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const query = CalendarMonthQuerySchema.parse(request.query);
    const response = await this.options.mealPersistenceService.getCalendarMonth({
      accessToken: auth.accessToken,
      userId: auth.userId,
      month: query.month,
      timeZone: query.timeZone,
    });

    return reply.code(200).send(response);
  }

  async getMealsByDate(
    request: FastifyRequest<{ Querystring: { date: string; timeZone?: string } }>,
    reply: FastifyReply,
  ) {
    const logger = createRequestLogger(request).child({
      operation: "meals.by_date",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const query = MealsByDateQuerySchema.parse(request.query);
    const response = await this.options.mealPersistenceService.getMealsByDate({
      accessToken: auth.accessToken,
      userId: auth.userId,
      date: query.date,
      timeZone: query.timeZone,
    });

    return reply.code(200).send(response);
  }
}
