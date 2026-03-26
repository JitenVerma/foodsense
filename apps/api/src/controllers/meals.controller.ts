import type { FastifyReply, FastifyRequest } from "fastify";

import { RecalculateMealBodySchema } from "../schemas/meal.schemas.js";
import { InvalidUploadError } from "../lib/errors.js";
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
    const file = await request.file();
    if (!file) {
      throw new InvalidUploadError("Please attach an image file to analyze.");
    }

    const buffer = await file.toBuffer();
    const result = await this.options.mealAnalysisOrchestrator.analyze({
      mimeType: file.mimetype,
      imageBuffer: buffer,
      maxUploadSizeBytes: this.options.maxUploadSizeBytes,
    });

    return reply.code(200).send(result);
  }

  async recalculateMeal(request: FastifyRequest, reply: FastifyReply) {
    const parsed = RecalculateMealBodySchema.parse(request.body);
    const result = await this.options.mealRecalculationService.recalculate(parsed);
    return reply.code(200).send(result);
  }
}
