import {
  UpdateGoalsRequestSchema,
  UpdateProfileRequestSchema,
} from "@foodsense/shared";
import { z } from "zod";

export const UpdateProfileBodySchema = UpdateProfileRequestSchema;
export const UpdateGoalsBodySchema = UpdateGoalsRequestSchema;

export const PlayerDateQuerySchema = z.object({
  date: z.string().date().optional(),
  timeZone: z.string().trim().min(1).optional(),
});

export const PlayerProgressRangeQuerySchema = PlayerDateQuerySchema.extend({
  period: z.enum(["weekly", "monthly"]),
});
