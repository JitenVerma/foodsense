import { z } from "zod";

import {
  DEFAULT_MAX_UPLOAD_SIZE_BYTES,
  SUPPORTED_IMAGE_MIME_TYPES,
} from "../constants/file.js";

export const ConfidenceSchema = z.number().min(0).max(1);

export const DishCandidateSchema = z.object({
  name: z.string().trim().min(1),
  confidence: ConfidenceSchema,
});

export const MacroTotalsSchema = z.object({
  protein_g: z.number().min(0),
  carbs_g: z.number().min(0),
  fat_g: z.number().min(0),
  calories_kcal: z.number().min(0),
});

export const IngredientCategorySchema = z.enum(["visible", "inferred"]);

export const IngredientSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  grams: z.number().min(0),
  category: IngredientCategorySchema,
  confidence: ConfidenceSchema,
  notes: z.string().trim().min(1).optional(),
  macros: MacroTotalsSchema.optional(),
  nutritionMatch: z.string().trim().min(1).nullable().optional(),
});

export const MealAnalysisResponseSchema = z.object({
  dishCandidates: z.array(DishCandidateSchema).max(3),
  visibleIngredients: z.array(IngredientSchema),
  inferredIngredients: z.array(IngredientSchema),
  macroTotals: MacroTotalsSchema,
  assumptions: z.array(z.string().trim().min(1)),
  warnings: z.array(z.string().trim().min(1)),
});

export const RecalculateMealRequestSchema = z.object({
  ingredients: z.array(IngredientSchema).min(1),
});

export const RecalculateMealResponseSchema = z.object({
  ingredients: z.array(IngredientSchema),
  macroTotals: MacroTotalsSchema,
  warnings: z.array(z.string().trim().min(1)),
});

export const AnalyzeMealBase64RequestSchema = z.object({
  imageBase64: z.string().trim().min(1),
  mimeType: z.enum(SUPPORTED_IMAGE_MIME_TYPES),
});

export const ImageUploadMetadataSchema = z.object({
  mimeType: z.enum(SUPPORTED_IMAGE_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(DEFAULT_MAX_UPLOAD_SIZE_BYTES),
});

export type DishCandidateDto = z.infer<typeof DishCandidateSchema>;
export type MacroTotalsDto = z.infer<typeof MacroTotalsSchema>;
export type IngredientDto = z.infer<typeof IngredientSchema>;
export type MealAnalysisResponseDto = z.infer<
  typeof MealAnalysisResponseSchema
>;
export type RecalculateMealRequestDto = z.infer<
  typeof RecalculateMealRequestSchema
>;
export type RecalculateMealResponseDto = z.infer<
  typeof RecalculateMealResponseSchema
>;
