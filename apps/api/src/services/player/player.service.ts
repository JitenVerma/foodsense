import type {
  DerivedTargets,
  MacroTotals,
  ProgressRange,
  QuestProgress,
  QuestType,
  StreakSummary,
  TodayProgress,
  UpdateGoalsRequest,
  UpdateProfileRequest,
  UserGoals,
  UserProfile,
  WeekProgress,
  XpSummary,
} from "@foodsense/shared";

import type { StructuredLogger } from "../../lib/logger.js";
import type { MealsRepository } from "../../repositories/meals.repository.js";
import type {
  PlayerRepository,
  QuestDefinition,
  StoredGoals,
} from "../../repositories/player.repository.js";
import type { RequestAuthService } from "../auth/requestAuth.service.js";
import type { MacroCalculatorService } from "../nutrition/macroCalculator.service.js";

export interface PlayerService {
  getProfile(input: {
    accessToken: string;
    userId: string;
  }): Promise<UserProfile>;
  updateProfile(input: {
    accessToken: string;
    userId: string;
    updates: UpdateProfileRequest;
    logger?: StructuredLogger;
  }): Promise<UserProfile>;
  getGoals(input: {
    accessToken: string;
    userId: string;
  }): Promise<UserGoals>;
  updateGoals(input: {
    accessToken: string;
    userId: string;
    updates: UpdateGoalsRequest;
    logger?: StructuredLogger;
  }): Promise<UserGoals>;
  getXpSummary(input: {
    accessToken: string;
    userId: string;
    date?: string;
    timeZone?: string;
  }): Promise<XpSummary>;
  getStreakSummary(input: {
    accessToken: string;
    userId: string;
    date?: string;
    timeZone?: string;
  }): Promise<StreakSummary>;
  getQuests(input: {
    accessToken: string;
    userId: string;
    questType: QuestType;
    date?: string;
    timeZone?: string;
  }): Promise<QuestProgress[]>;
  getTodayProgress(input: {
    accessToken: string;
    userId: string;
    date?: string;
    timeZone?: string;
  }): Promise<TodayProgress>;
  getWeekProgress(input: {
    accessToken: string;
    userId: string;
    date?: string;
    timeZone?: string;
  }): Promise<WeekProgress>;
  getProgressRange(input: {
    accessToken: string;
    userId: string;
    period: "weekly" | "monthly";
    date?: string;
    timeZone?: string;
  }): Promise<ProgressRange>;
}

interface CreatePlayerServiceOptions {
  playerRepository: PlayerRepository;
  mealsRepository: MealsRepository;
  requestAuthService: RequestAuthService;
  macroCalculatorService: MacroCalculatorService;
}

interface DailyComputedProgress {
  date: string;
  meals: Awaited<ReturnType<MealsRepository["listMeals"]>>;
  macroTotals: MacroTotals;
  mealCount: number;
  mealTypeCompletion: TodayProgress["mealTypeCompletion"];
  proteinGoalHit: boolean;
  calorieTargetHit: boolean;
  fullDayComplete: boolean;
  xpEarned: number;
}

const DEFAULT_TARGETS: DerivedTargets = {
  bmr_kcal: null,
  tdee_kcal: null,
  calorie_target_kcal: 2200,
  protein_target_g: 120,
  carbs_target_g: 250,
  fat_target_g: 70,
};

function roundNumber(value: number) {
  return Math.round(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekStart(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(dateKey, mondayOffset);
}

function createTimeZoneDateFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function toDateKeyInTimeZone(isoString: string, timeZone: string) {
  const formatter = createTimeZoneDateFormatter(timeZone);
  const parts = formatter.formatToParts(new Date(isoString));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(`Unable to format date key for timezone ${timeZone}.`);
  }

  return `${year}-${month}-${day}`;
}

function computeBmr(profile: UserProfile) {
  if (!profile.ageYears || !profile.heightCm || !profile.weightKg) {
    return null;
  }

  const base =
    10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.ageYears;
  const genderAdjustment =
    profile.gender === "male"
      ? 5
      : profile.gender === "female"
        ? -161
        : 0;

  return roundNumber(base + genderAdjustment);
}

function computeTdee(profile: UserProfile, bmr: number | null) {
  if (!bmr) {
    return null;
  }

  const activityMultiplier =
    profile.activityLevel === "very_active"
      ? 1.725
      : profile.activityLevel === "moderately_active"
        ? 1.55
        : profile.activityLevel === "lightly_active"
          ? 1.375
          : 1.2;
  const jobAdjustment =
    profile.jobType === "active"
      ? 0.12
      : profile.jobType === "mixed"
        ? 0.05
        : 0;
  const exerciseTypes =
    Number(profile.strengthTrainingEnabled) + Number(profile.cardioEnabled);
  const exerciseAdjustment =
    (profile.sessionsPerWeek ?? 0) * 0.0125 * Math.max(1, exerciseTypes);

  return roundNumber(
    bmr * clamp(activityMultiplier + jobAdjustment + exerciseAdjustment, 1.2, 2.2),
  );
}

function buildDerivedTargets(profile: UserProfile, goals: StoredGoals): DerivedTargets {
  const bmr = computeBmr(profile);
  const tdee = computeTdee(profile, bmr);

  if (!profile.weightKg || !tdee) {
    return {
      ...DEFAULT_TARGETS,
      bmr_kcal: bmr,
      tdee_kcal: tdee,
    };
  }

  const calorieAdjustment =
    goals.goalType === "lose_weight"
      ? -400
      : goals.goalType === "gain_weight"
        ? 300
        : 0;
  const calorieTarget = Math.max(1200, roundNumber(tdee + calorieAdjustment));
  const proteinMultiplier =
    goals.goalType === "lose_weight"
      ? 2
      : goals.goalType === "gain_weight"
        ? 1.8
        : 1.6;
  const proteinBoost = profile.strengthTrainingEnabled ? 0.2 : 0;
  const proteinTarget = roundNumber(profile.weightKg * (proteinMultiplier + proteinBoost));
  const fatTarget = roundNumber((calorieTarget * 0.27) / 9);
  const carbsTarget = roundNumber(
    Math.max(0, (calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4),
  );

  return {
    bmr_kcal: bmr,
    tdee_kcal: tdee,
    calorie_target_kcal: calorieTarget,
    protein_target_g: proteinTarget,
    carbs_target_g: carbsTarget,
    fat_target_g: fatTarget,
  };
}

function mapGoals(stored: StoredGoals, targets: DerivedTargets): UserGoals {
  return {
    userId: stored.userId,
    goalType: stored.goalType,
    targetWeightKg: stored.targetWeightKg,
    timeframeWeeks: stored.timeframeWeeks,
    targets,
    calculationVersion: stored.calculationVersion,
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt,
  };
}

function calculateDailyXp(input: {
  mealCount: number;
  proteinGoalHit: boolean;
  calorieTargetHit: boolean;
  fullDayComplete: boolean;
}) {
  let total = input.mealCount * 10;

  if (input.proteinGoalHit) {
    total += 20;
  }

  if (input.calorieTargetHit) {
    total += 30;
  }

  if (input.fullDayComplete) {
    total += 50;
  }

  return total;
}

function buildInsights(
  macroTotals: MacroTotals,
  targets: DerivedTargets,
  proteinGoalHit: boolean,
  calorieTargetHit: boolean,
  fullDayComplete: boolean,
) {
  const insights: string[] = [];

  if (!proteinGoalHit) {
    insights.push("You are still below your protein target today.");
  } else {
    insights.push("Protein goal cleared. Great recovery fuel.");
  }

  if (!calorieTargetHit) {
    insights.push("Calories are currently outside your target lane.");
  } else {
    insights.push("Calories are tracking inside your target range.");
  }

  if (!fullDayComplete) {
    insights.push("Logging breakfast, lunch, and dinner will unlock your full-day bonus.");
  } else {
    insights.push("Full-day meal coverage complete. Bonus XP secured.");
  }

  if (macroTotals.fat_g > targets.fat_target_g && targets.fat_target_g > 0) {
    insights.push("Fat intake is trending above target today.");
  }

  return insights.slice(0, 4);
}

function buildDailyProgress(
  date: string,
  meals: Awaited<ReturnType<MealsRepository["listMeals"]>>,
  targets: DerivedTargets,
  macroCalculatorService: MacroCalculatorService,
): DailyComputedProgress {
  const mealTypeCompletion = {
    breakfast: meals.some((meal) => meal.mealType === "breakfast"),
    lunch: meals.some((meal) => meal.mealType === "lunch"),
    dinner: meals.some((meal) => meal.mealType === "dinner"),
    snack: meals.some((meal) => meal.mealType === "snack"),
  };
  const macroTotals = macroCalculatorService.sumMacros(
    meals.map((meal) => meal.macroTotals),
  );
  const proteinGoalHit =
    targets.protein_target_g > 0
      ? macroTotals.protein_g >= targets.protein_target_g
      : false;
  const calorieTargetHit =
    targets.calorie_target_kcal > 0
      ? Math.abs(macroTotals.calories_kcal - targets.calorie_target_kcal) <= 200
      : false;
  const fullDayComplete =
    mealTypeCompletion.breakfast &&
    mealTypeCompletion.lunch &&
    mealTypeCompletion.dinner;

  return {
    date,
    meals,
    macroTotals,
    mealCount: meals.length,
    mealTypeCompletion,
    proteinGoalHit,
    calorieTargetHit,
    fullDayComplete,
    xpEarned: calculateDailyXp({
      mealCount: meals.length,
      proteinGoalHit,
      calorieTargetHit,
      fullDayComplete,
    }),
  };
}

function computeCurrentStreak(
  dates: string[],
  predicate: (date: string) => boolean,
  anchorDate: string,
) {
  let streak = 0;
  let cursor = anchorDate;

  while (dates.includes(cursor) && predicate(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function computeLongestStreak(
  dates: string[],
  predicate: (date: string) => boolean,
) {
  let longest = 0;
  let current = 0;

  for (const date of dates) {
    if (predicate(date)) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

function buildLevelProgress(totalXp: number) {
  const thresholds = [0, 100, 250, 500, 850, 1250];
  let currentLevel = 1;

  for (let index = 1; index < thresholds.length; index += 1) {
    if (totalXp >= thresholds[index]!) {
      currentLevel = index + 1;
    }
  }

  const currentLevelThreshold = thresholds[currentLevel - 1] ?? 0;
  const nextLevelThreshold =
    thresholds[currentLevel] ?? currentLevelThreshold + 450 + (currentLevel - 6) * 150;

  return {
    currentLevel,
    xpIntoCurrentLevel: totalXp - currentLevelThreshold,
    xpToNextLevel: Math.max(0, nextLevelThreshold - totalXp),
  };
}

function resolveQuestProgressValue(
  definition: QuestDefinition,
  today: DailyComputedProgress,
  week: WeekProgress,
) {
  switch (definition.goalMetric) {
    case "meals_logged":
      return definition.questType === "daily"
        ? today.mealCount
        : week.days.reduce((total, day) => total + day.mealCount, 0);
    case "protein_goal_hit":
      return today.proteinGoalHit ? 1 : 0;
    case "calorie_target_hit":
      return today.calorieTargetHit ? 1 : 0;
    case "logged_days":
      return week.loggedDays;
    case "calorie_target_days":
      return week.calorieTargetDays;
    default:
      return 0;
  }
}

export function createPlayerService(
  options: CreatePlayerServiceOptions,
): PlayerService {
  const {
    playerRepository,
    mealsRepository,
    requestAuthService,
    macroCalculatorService,
  } = options;

  async function loadProfileAndGoals(accessToken: string, userId: string) {
    const supabase = requestAuthService.createUserScopedClient(accessToken);
    const [profile, storedGoals] = await Promise.all([
      playerRepository.getProfile(supabase, userId),
      playerRepository.getGoals(supabase, userId),
    ]);
    const targets = buildDerivedTargets(profile, storedGoals);

    return {
      supabase,
      profile,
      storedGoals,
      targets,
      goals: mapGoals(storedGoals, targets),
    };
  }

  async function listMealsGroupedByLocalDate(
    accessToken: string,
    userId: string,
    timeZone: string,
  ) {
    const meals = await mealsRepository.listMeals(
      requestAuthService.createUserScopedClient(accessToken),
      userId,
    );
    const grouped = new Map<string, typeof meals>();

    for (const meal of meals) {
      const dateKey = toDateKeyInTimeZone(meal.eatenAt, timeZone);
      const existing = grouped.get(dateKey) ?? [];
      existing.push(meal);
      grouped.set(dateKey, existing);
    }

    return grouped;
  }

  async function buildTodayProgressInternal(input: {
    accessToken: string;
    userId: string;
    date?: string;
    timeZone?: string;
  }) {
    const { supabase, profile, targets } = await loadProfileAndGoals(
      input.accessToken,
      input.userId,
    );
    const effectiveTimeZone = input.timeZone ?? profile.timeZone ?? "UTC";
    const groupedMeals = await listMealsGroupedByLocalDate(
      input.accessToken,
      input.userId,
      effectiveTimeZone,
    );
    const date = input.date ?? getTodayDateKey();
    const todayMeals = groupedMeals.get(date) ?? [];
    const today = buildDailyProgress(
      date,
      todayMeals,
      targets,
      macroCalculatorService,
    );

    return {
      profile,
      supabase,
      targets,
      groupedMeals,
      today,
      response: {
        date,
        timeZone: effectiveTimeZone,
        macroTotals: today.macroTotals,
        targets,
        mealCount: today.mealCount,
        meals: [...todayMeals].sort((left, right) =>
          right.eatenAt.localeCompare(left.eatenAt),
        ),
        mealTypeCompletion: today.mealTypeCompletion,
        proteinGoalHit: today.proteinGoalHit,
        calorieTargetHit: today.calorieTargetHit,
        fullDayComplete: today.fullDayComplete,
        xpEarned: today.xpEarned,
        insights: buildInsights(
          today.macroTotals,
          targets,
          today.proteinGoalHit,
          today.calorieTargetHit,
          today.fullDayComplete,
        ),
      } satisfies TodayProgress,
    };
  }

  async function buildWeekProgressInternal(input: {
    accessToken: string;
    userId: string;
    date?: string;
    timeZone?: string;
  }) {
    const todayState = await buildTodayProgressInternal(input);
    const date = input.date ?? getTodayDateKey();
    const weekStart = getWeekStart(date);
    const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
    const daySummaries = days.map((day) =>
      buildDailyProgress(
        day,
        todayState.groupedMeals.get(day) ?? [],
        todayState.targets,
        macroCalculatorService,
      ),
    );
    const totals = macroCalculatorService.sumMacros(
      daySummaries.map((day) => day.macroTotals),
    );

    return {
      ...todayState,
      week: {
        weekStart,
        weekEnd: days.at(-1)!,
        timeZone: todayState.response.timeZone,
        totals,
        averageDailyCalories: roundNumber(totals.calories_kcal / 7),
        averageDailyProtein: roundNumber(totals.protein_g / 7),
        loggedDays: daySummaries.filter((day) => day.mealCount > 0).length,
        calorieTargetDays: daySummaries.filter((day) => day.calorieTargetHit).length,
        proteinGoalDays: daySummaries.filter((day) => day.proteinGoalHit).length,
        days: daySummaries.map((day) => ({
          date: day.date,
          macroTotals: day.macroTotals,
          mealCount: day.mealCount,
          xpEarned: day.xpEarned,
          calorieTargetHit: day.calorieTargetHit,
          proteinGoalHit: day.proteinGoalHit,
          fullDayComplete: day.fullDayComplete,
        })),
      } satisfies WeekProgress,
      daySummaries,
    };
  }

  async function buildProgressRangeInternal(input: {
    accessToken: string;
    userId: string;
    period: "weekly" | "monthly";
    date?: string;
    timeZone?: string;
  }) {
    const todayState = await buildTodayProgressInternal(input);
    const endDate = input.date ?? getTodayDateKey();
    const dayCount = input.period === "monthly" ? 31 : 7;
    const startDate = addDays(endDate, -(dayCount - 1));
    const days = Array.from({ length: dayCount }, (_, index) =>
      addDays(startDate, index),
    );
    const daySummaries = days.map((day) =>
      buildDailyProgress(
        day,
        todayState.groupedMeals.get(day) ?? [],
        todayState.targets,
        macroCalculatorService,
      ),
    );
    const totals = macroCalculatorService.sumMacros(
      daySummaries.map((day) => day.macroTotals),
    );

    return {
      ...todayState,
      range: {
        period: input.period,
        startDate,
        endDate,
        timeZone: todayState.response.timeZone,
        totals,
        averageDailyCalories: roundNumber(totals.calories_kcal / dayCount),
        averageDailyProtein: roundNumber(totals.protein_g / dayCount),
        loggedDays: daySummaries.filter((day) => day.mealCount > 0).length,
        calorieTargetDays: daySummaries.filter((day) => day.calorieTargetHit).length,
        proteinGoalDays: daySummaries.filter((day) => day.proteinGoalHit).length,
        totalMeals: daySummaries.reduce((total, day) => total + day.mealCount, 0),
        totalXp: daySummaries.reduce((total, day) => total + day.xpEarned, 0),
        days: daySummaries.map((day) => ({
          date: day.date,
          macroTotals: day.macroTotals,
          mealCount: day.mealCount,
          xpEarned: day.xpEarned,
          calorieTargetHit: day.calorieTargetHit,
          proteinGoalHit: day.proteinGoalHit,
          fullDayComplete: day.fullDayComplete,
        })),
      } satisfies ProgressRange,
    };
  }

  return {
    async getProfile({ accessToken, userId }) {
      const supabase = requestAuthService.createUserScopedClient(accessToken);
      return playerRepository.getProfile(supabase, userId);
    },
    async updateProfile({ accessToken, userId, updates, logger }) {
      const { supabase, storedGoals } = await loadProfileAndGoals(accessToken, userId);

      logger?.info("Updating player profile", {
        event: "player.profile.update.started",
        user_id: userId,
      });

      const profile = await playerRepository.updateProfile(supabase, userId, updates);
      const targets = buildDerivedTargets(profile, storedGoals);
      await playerRepository.upsertGoals(supabase, userId, {
        ...storedGoals,
        dailyCalorieTarget: targets.calorie_target_kcal,
        dailyProteinTargetG: targets.protein_target_g,
        dailyCarbsTargetG: targets.carbs_target_g,
        dailyFatTargetG: targets.fat_target_g,
        bmrKcal: targets.bmr_kcal,
        tdeeKcal: targets.tdee_kcal,
      });

      logger?.info("Updated player profile", {
        event: "player.profile.update.completed",
        user_id: userId,
      });

      return profile;
    },
    async getGoals({ accessToken, userId }) {
      const { goals } = await loadProfileAndGoals(accessToken, userId);
      return goals;
    },
    async updateGoals({ accessToken, userId, updates, logger }) {
      const { supabase, profile, storedGoals } = await loadProfileAndGoals(
        accessToken,
        userId,
      );

      logger?.info("Updating player goals", {
        event: "player.goals.update.started",
        user_id: userId,
      });

      const merged: StoredGoals = {
        ...storedGoals,
        goalType: updates.goalType ?? storedGoals.goalType,
        targetWeightKg:
          updates.targetWeightKg === undefined
            ? storedGoals.targetWeightKg
            : updates.targetWeightKg,
        timeframeWeeks:
          updates.timeframeWeeks === undefined
            ? storedGoals.timeframeWeeks
            : updates.timeframeWeeks,
      };
      const targets = buildDerivedTargets(profile, merged);
      const savedGoals = await playerRepository.upsertGoals(supabase, userId, {
        ...merged,
        dailyCalorieTarget: targets.calorie_target_kcal,
        dailyProteinTargetG: targets.protein_target_g,
        dailyCarbsTargetG: targets.carbs_target_g,
        dailyFatTargetG: targets.fat_target_g,
        bmrKcal: targets.bmr_kcal,
        tdeeKcal: targets.tdee_kcal,
      });

      logger?.info("Updated player goals", {
        event: "player.goals.update.completed",
        user_id: userId,
      });

      return mapGoals(savedGoals, buildDerivedTargets(profile, savedGoals));
    },
    async getXpSummary({ accessToken, userId, date, timeZone }) {
      const { groupedMeals, targets } = await buildTodayProgressInternal({
        accessToken,
        userId,
        date,
        timeZone,
      });
      const anchorDate = date ?? getTodayDateKey();
      const dateKeys = Array.from(groupedMeals.keys()).sort();
      if (!dateKeys.includes(anchorDate)) {
        dateKeys.push(anchorDate);
        dateKeys.sort();
      }
      const dailySummaries = dateKeys.map((dateKey) =>
        buildDailyProgress(
          dateKey,
          groupedMeals.get(dateKey) ?? [],
          targets,
          macroCalculatorService,
        ),
      );
      const baseXp = dailySummaries.reduce((total, day) => total + day.xpEarned, 0);
      const loggingCurrentStreak = computeCurrentStreak(
        dateKeys,
        (key) => (groupedMeals.get(key) ?? []).length > 0,
        anchorDate,
      );
      const streakBonus = Math.max(0, (loggingCurrentStreak - 1) * 5);
      const totalXp = baseXp + streakBonus;
      const levelProgress = buildLevelProgress(totalXp);
      const todaySummary = buildDailyProgress(
        anchorDate,
        groupedMeals.get(anchorDate) ?? [],
        targets,
        macroCalculatorService,
      );

      return {
        totalXp,
        currentLevel: levelProgress.currentLevel,
        xpIntoCurrentLevel: levelProgress.xpIntoCurrentLevel,
        xpToNextLevel: levelProgress.xpToNextLevel,
        todayXp: todaySummary.xpEarned + streakBonus,
      };
    },
    async getStreakSummary({ accessToken, userId, date, timeZone }) {
      const { groupedMeals, targets } = await buildTodayProgressInternal({
        accessToken,
        userId,
        date,
        timeZone,
      });
      const anchorDate = date ?? getTodayDateKey();
      const firstMealDate = Array.from(groupedMeals.keys()).sort().at(0) ?? anchorDate;
      const dates: string[] = [];
      for (
        let cursor = firstMealDate;
        cursor <= anchorDate;
        cursor = addDays(cursor, 1)
      ) {
        dates.push(cursor);
      }
      const summaries = new Map(
        dates.map((dateKey) => [
          dateKey,
          buildDailyProgress(
            dateKey,
            groupedMeals.get(dateKey) ?? [],
            targets,
            macroCalculatorService,
          ),
        ]),
      );

      return {
        loggingCurrentStreak: computeCurrentStreak(
          dates,
          (dateKey) => (summaries.get(dateKey)?.mealCount ?? 0) > 0,
          anchorDate,
        ),
        loggingLongestStreak: computeLongestStreak(
          dates,
          (dateKey) => (summaries.get(dateKey)?.mealCount ?? 0) > 0,
        ),
        fullDayCurrentStreak: computeCurrentStreak(
          dates,
          (dateKey) => summaries.get(dateKey)?.fullDayComplete ?? false,
          anchorDate,
        ),
        fullDayLongestStreak: computeLongestStreak(
          dates,
          (dateKey) => summaries.get(dateKey)?.fullDayComplete ?? false,
        ),
        goalCurrentStreak: computeCurrentStreak(
          dates,
          (dateKey) => summaries.get(dateKey)?.calorieTargetHit ?? false,
          anchorDate,
        ),
        goalLongestStreak: computeLongestStreak(
          dates,
          (dateKey) => summaries.get(dateKey)?.calorieTargetHit ?? false,
        ),
      };
    },
    async getQuests({ accessToken, userId, questType, date, timeZone }) {
      const { supabase, response, today, week } = await buildWeekProgressInternal({
        accessToken,
        userId,
        date,
        timeZone,
      });
      const definitions = await playerRepository.listQuestDefinitions(
        supabase,
        questType,
      );

      return definitions.map((definition) => {
        const progressValue = resolveQuestProgressValue(definition, today, week);
        return {
          id: `${definition.id}:${questType === "daily" ? response.date : week.weekStart}`,
          code: definition.code,
          questType: definition.questType,
          title: definition.title,
          description: definition.description,
          goalMetric: definition.goalMetric,
          goalTarget: definition.goalTarget,
          xpReward: definition.xpReward,
          status: progressValue >= definition.goalTarget ? "completed" : "active",
          progressValue,
          targetValue: definition.goalTarget,
          completionPercentage: clamp(
            Math.round((progressValue / definition.goalTarget) * 100),
            0,
            100,
          ),
        };
      });
    },
    async getTodayProgress({ accessToken, userId, date, timeZone }) {
      const state = await buildTodayProgressInternal({
        accessToken,
        userId,
        date,
        timeZone,
      });
      return state.response;
    },
    async getWeekProgress({ accessToken, userId, date, timeZone }) {
      const state = await buildWeekProgressInternal({
        accessToken,
        userId,
        date,
        timeZone,
      });
      return state.week;
    },
    async getProgressRange({ accessToken, userId, period, date, timeZone }) {
      const state = await buildProgressRangeInternal({
        accessToken,
        userId,
        period,
        date,
        timeZone,
      });
      return state.range;
    },
  };
}
