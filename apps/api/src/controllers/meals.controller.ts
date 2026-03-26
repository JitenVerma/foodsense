import type { FastifyReply, FastifyRequest } from "fastify";

import { RecalculateMealBodySchema } from "../schemas/meal.schemas.js";
import { InvalidUploadError } from "../lib/errors.js";
import { createRequestLogger } from "../lib/logger.js";
import type { MealAnalysisOrchestratorService } from "../services/meal/mealAnalysisOrchestrator.service.js";
import type { MealRecalculationService } from "../services/meal/mealRecalculation.service.js";

interface MealsControllerOptions {
  mealAnalysisOrchestrator: MealAnalysisOrchestratorService;
  mealRecalculationService: MealRecalculationService;
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
}
