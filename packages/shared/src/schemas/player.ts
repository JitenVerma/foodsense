import { z } from "zod";

import { IsoDateTimeSchema, MacroTotalsSchema, SavedMealSchema } from "./meals.js";

export const GoalTypeSchema = z.enum(["lose_weight", "maintain", "gain_weight"]);
export const ActivityLevelSchema = z.enum([
  "sedentary",
  "lightly_active",
  "moderately_active",
  "very_active",
]);
export const JobTypeSchema = z.enum(["desk_based", "mixed", "active"]);
export const GenderSchema = z.enum([
  "female",
  "male",
  "non_binary",
  "other",
  "prefer_not_to_say",
]);
export const QuestTypeSchema = z.enum(["daily", "weekly"]);
export const QuestStatusSchema = z.enum(["active", "completed", "failed"]);

export const DerivedTargetsSchema = z.object({
  bmr_kcal: z.number().min(0).nullable(),
  tdee_kcal: z.number().min(0).nullable(),
  calorie_target_kcal: z.number().min(0),
  protein_target_g: z.number().min(0),
  carbs_target_g: z.number().min(0),
  fat_target_g: z.number().min(0),
});

export const UserProfileSchema = z.object({
  userId: z.string().trim().min(1),
  email: z.string().trim().min(1),
  name: z.string().trim().min(1).nullable(),
  ageYears: z.number().int().min(13).max(120).nullable(),
  heightCm: z.number().positive().nullable(),
  weightKg: z.number().positive().nullable(),
  gender: GenderSchema.nullable(),
  activityLevel: ActivityLevelSchema.nullable(),
  jobType: JobTypeSchema.nullable(),
  strengthTrainingEnabled: z.boolean(),
  cardioEnabled: z.boolean(),
  sessionsPerWeek: z.number().int().min(0).max(14).nullable(),
  desiredSessionsPerWeek: z.number().int().min(0).max(14).nullable(),
  timeZone: z.string().trim().min(1),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
});

export const UpdateProfileRequestSchema = z.object({
  name: z.string().trim().min(1).nullable().optional(),
  ageYears: z.number().int().min(13).max(120).nullable().optional(),
  heightCm: z.number().positive().nullable().optional(),
  weightKg: z.number().positive().nullable().optional(),
  gender: GenderSchema.nullable().optional(),
  activityLevel: ActivityLevelSchema.nullable().optional(),
  jobType: JobTypeSchema.nullable().optional(),
  strengthTrainingEnabled: z.boolean().optional(),
  cardioEnabled: z.boolean().optional(),
  sessionsPerWeek: z.number().int().min(0).max(14).nullable().optional(),
  desiredSessionsPerWeek: z.number().int().min(0).max(14).nullable().optional(),
  timeZone: z.string().trim().min(1).optional(),
});

export const UserGoalsSchema = z.object({
  userId: z.string().trim().min(1),
  goalType: GoalTypeSchema,
  targetWeightKg: z.number().positive().nullable(),
  timeframeWeeks: z.number().int().positive().nullable(),
  targets: DerivedTargetsSchema,
  calculationVersion: z.number().int().min(1),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
});

export const UpdateGoalsRequestSchema = z.object({
  goalType: GoalTypeSchema.optional(),
  targetWeightKg: z.number().positive().nullable().optional(),
  timeframeWeeks: z.number().int().positive().nullable().optional(),
});

export const XpSummarySchema = z.object({
  totalXp: z.number().int().min(0),
  currentLevel: z.number().int().min(1),
  xpIntoCurrentLevel: z.number().int().min(0),
  xpToNextLevel: z.number().int().min(0),
  todayXp: z.number().int().min(0),
});

export const StreakSummarySchema = z.object({
  loggingCurrentStreak: z.number().int().min(0),
  loggingLongestStreak: z.number().int().min(0),
  fullDayCurrentStreak: z.number().int().min(0),
  fullDayLongestStreak: z.number().int().min(0),
  goalCurrentStreak: z.number().int().min(0),
  goalLongestStreak: z.number().int().min(0),
});

export const QuestProgressSchema = z.object({
  id: z.string().trim().min(1),
  code: z.string().trim().min(1),
  questType: QuestTypeSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  goalMetric: z.string().trim().min(1),
  goalTarget: z.number().int().positive(),
  xpReward: z.number().int().min(0),
  status: QuestStatusSchema,
  progressValue: z.number().int().min(0),
  targetValue: z.number().int().min(0),
  completionPercentage: z.number().min(0).max(100),
});

export const TodayProgressSchema = z.object({
  date: z.string().date(),
  timeZone: z.string().trim().min(1),
  macroTotals: MacroTotalsSchema,
  targets: DerivedTargetsSchema,
  mealCount: z.number().int().min(0),
  meals: z.array(SavedMealSchema),
  mealTypeCompletion: z.object({
    breakfast: z.boolean(),
    lunch: z.boolean(),
    dinner: z.boolean(),
    snack: z.boolean(),
  }),
  proteinGoalHit: z.boolean(),
  calorieTargetHit: z.boolean(),
  fullDayComplete: z.boolean(),
  xpEarned: z.number().int().min(0),
  insights: z.array(z.string().trim().min(1)),
});

export const DailyProgressSummarySchema = z.object({
  date: z.string().date(),
  macroTotals: MacroTotalsSchema,
  mealCount: z.number().int().min(0),
  xpEarned: z.number().int().min(0),
  calorieTargetHit: z.boolean(),
  proteinGoalHit: z.boolean(),
  fullDayComplete: z.boolean(),
});

export const WeekProgressSchema = z.object({
  weekStart: z.string().date(),
  weekEnd: z.string().date(),
  timeZone: z.string().trim().min(1),
  totals: MacroTotalsSchema,
  averageDailyCalories: z.number().min(0),
  averageDailyProtein: z.number().min(0),
  loggedDays: z.number().int().min(0),
  calorieTargetDays: z.number().int().min(0),
  proteinGoalDays: z.number().int().min(0),
  days: z.array(DailyProgressSummarySchema),
});

export const ProgressRangeSchema = z.object({
  period: z.enum(["weekly", "monthly"]),
  startDate: z.string().date(),
  endDate: z.string().date(),
  timeZone: z.string().trim().min(1),
  totals: MacroTotalsSchema,
  averageDailyCalories: z.number().min(0),
  averageDailyProtein: z.number().min(0),
  loggedDays: z.number().int().min(0),
  calorieTargetDays: z.number().int().min(0),
  proteinGoalDays: z.number().int().min(0),
  totalMeals: z.number().int().min(0),
  totalXp: z.number().int().min(0),
  days: z.array(DailyProgressSummarySchema),
});

export type GoalTypeDto = z.infer<typeof GoalTypeSchema>;
export type ActivityLevelDto = z.infer<typeof ActivityLevelSchema>;
export type JobTypeDto = z.infer<typeof JobTypeSchema>;
export type GenderDto = z.infer<typeof GenderSchema>;
export type QuestTypeDto = z.infer<typeof QuestTypeSchema>;
export type QuestStatusDto = z.infer<typeof QuestStatusSchema>;
export type DerivedTargetsDto = z.infer<typeof DerivedTargetsSchema>;
export type UserProfileDto = z.infer<typeof UserProfileSchema>;
export type UpdateProfileRequestDto = z.infer<typeof UpdateProfileRequestSchema>;
export type UserGoalsDto = z.infer<typeof UserGoalsSchema>;
export type UpdateGoalsRequestDto = z.infer<typeof UpdateGoalsRequestSchema>;
export type XpSummaryDto = z.infer<typeof XpSummarySchema>;
export type StreakSummaryDto = z.infer<typeof StreakSummarySchema>;
export type QuestProgressDto = z.infer<typeof QuestProgressSchema>;
export type TodayProgressDto = z.infer<typeof TodayProgressSchema>;
export type DailyProgressSummaryDto = z.infer<typeof DailyProgressSummarySchema>;
export type WeekProgressDto = z.infer<typeof WeekProgressSchema>;
export type ProgressRangeDto = z.infer<typeof ProgressRangeSchema>;
