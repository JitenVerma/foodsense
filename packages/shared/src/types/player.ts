import type { MacroTotals, SavedMeal } from "./meals.js";

export type GoalType = "lose_weight" | "maintain" | "gain_weight";
export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active";
export type JobType = "desk_based" | "mixed" | "active";
export type Gender =
  | "female"
  | "male"
  | "non_binary"
  | "other"
  | "prefer_not_to_say";
export type QuestType = "daily" | "weekly";
export type QuestStatus = "active" | "completed" | "failed";

export interface DerivedTargets {
  bmr_kcal: number | null;
  tdee_kcal: number | null;
  calorie_target_kcal: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string | null;
  ageYears: number | null;
  heightCm: number | null;
  weightKg: number | null;
  gender: Gender | null;
  activityLevel: ActivityLevel | null;
  jobType: JobType | null;
  strengthTrainingEnabled: boolean;
  cardioEnabled: boolean;
  sessionsPerWeek: number | null;
  desiredSessionsPerWeek: number | null;
  timeZone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string | null;
  ageYears?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  gender?: Gender | null;
  activityLevel?: ActivityLevel | null;
  jobType?: JobType | null;
  strengthTrainingEnabled?: boolean;
  cardioEnabled?: boolean;
  sessionsPerWeek?: number | null;
  desiredSessionsPerWeek?: number | null;
  timeZone?: string;
}

export interface UserGoals {
  userId: string;
  goalType: GoalType;
  targetWeightKg: number | null;
  timeframeWeeks: number | null;
  targets: DerivedTargets;
  calculationVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateGoalsRequest {
  goalType?: GoalType;
  targetWeightKg?: number | null;
  timeframeWeeks?: number | null;
}

export interface XpSummary {
  totalXp: number;
  currentLevel: number;
  xpIntoCurrentLevel: number;
  xpToNextLevel: number;
  todayXp: number;
}

export interface StreakSummary {
  loggingCurrentStreak: number;
  loggingLongestStreak: number;
  fullDayCurrentStreak: number;
  fullDayLongestStreak: number;
  goalCurrentStreak: number;
  goalLongestStreak: number;
}

export interface QuestProgress {
  id: string;
  code: string;
  questType: QuestType;
  title: string;
  description: string;
  goalMetric: string;
  goalTarget: number;
  xpReward: number;
  status: QuestStatus;
  progressValue: number;
  targetValue: number;
  completionPercentage: number;
}

export interface TodayProgress {
  date: string;
  timeZone: string;
  macroTotals: MacroTotals;
  targets: DerivedTargets;
  mealCount: number;
  meals: SavedMeal[];
  mealTypeCompletion: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snack: boolean;
  };
  proteinGoalHit: boolean;
  calorieTargetHit: boolean;
  fullDayComplete: boolean;
  xpEarned: number;
  insights: string[];
}

export interface DailyProgressSummary {
  date: string;
  macroTotals: MacroTotals;
  mealCount: number;
  xpEarned: number;
  calorieTargetHit: boolean;
  proteinGoalHit: boolean;
  fullDayComplete: boolean;
}

export interface WeekProgress {
  weekStart: string;
  weekEnd: string;
  timeZone: string;
  totals: MacroTotals;
  averageDailyCalories: number;
  averageDailyProtein: number;
  loggedDays: number;
  calorieTargetDays: number;
  proteinGoalDays: number;
  days: DailyProgressSummary[];
}

export interface ProgressRange {
  period: "weekly" | "monthly";
  startDate: string;
  endDate: string;
  timeZone: string;
  totals: MacroTotals;
  averageDailyCalories: number;
  averageDailyProtein: number;
  loggedDays: number;
  calorieTargetDays: number;
  proteinGoalDays: number;
  totalMeals: number;
  totalXp: number;
  days: DailyProgressSummary[];
}
