import { z } from "zod";

import {
  SaveMealRequestSchema,
  UpdateMealRequestSchema,
  DishCandidateSchema,
  RecalculateMealRequestSchema,
} from "@foodsense/shared";

export const AiIngredientSchema = z.object({
  name: z.string().trim().min(1),
  grams: z.number().min(0),
  confidence: z.number().min(0).max(1),
  notes: z.string().trim().min(1).optional(),
});

export const MealAnalysisAiResponseSchema = z.object({
  dishCandidates: z.array(DishCandidateSchema).min(1).max(3),
  visibleIngredients: z.array(AiIngredientSchema),
  assumptions: z.array(z.string().trim().min(1)).default([]),
  warnings: z.array(z.string().trim().min(1)).default([]),
});

export const RecalculateMealBodySchema = RecalculateMealRequestSchema;
export const SaveMealBodySchema = SaveMealRequestSchema;
export const UpdateMealBodySchema = UpdateMealRequestSchema;
export const CalendarMonthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  timeZone: z.string().trim().min(1).optional(),
});
export const MealsByDateQuerySchema = z.object({
  date: z.string().date(),
  timeZone: z.string().trim().min(1).optional(),
});

export type MealAnalysisAiResponse = z.infer<typeof MealAnalysisAiResponseSchema>;
