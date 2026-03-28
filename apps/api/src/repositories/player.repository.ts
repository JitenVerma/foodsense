import type {
  GoalType,
  QuestType,
  UserProfile,
} from "@foodsense/shared";
import type { SupabaseClient } from "@supabase/supabase-js";

interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  age_years: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  gender: UserProfile["gender"];
  activity_level: UserProfile["activityLevel"];
  job_type: UserProfile["jobType"];
  strength_training_enabled: boolean | null;
  cardio_enabled: boolean | null;
  sessions_per_week: number | null;
  desired_sessions_per_week: number | null;
  time_zone: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoredGoals {
  userId: string;
  goalType: GoalType;
  targetWeightKg: number | null;
  timeframeWeeks: number | null;
  dailyCalorieTarget: number;
  dailyProteinTargetG: number;
  dailyCarbsTargetG: number;
  dailyFatTargetG: number;
  bmrKcal: number | null;
  tdeeKcal: number | null;
  calculationVersion: number;
  createdAt: string;
  updatedAt: string;
}

interface UserGoalsRow {
  user_id: string;
  goal_type: GoalType;
  target_weight_kg: number | null;
  timeframe_weeks: number | null;
  daily_calorie_target: number | null;
  daily_protein_target_g: number | null;
  daily_carbs_target_g: number | null;
  daily_fat_target_g: number | null;
  bmr_kcal: number | null;
  tdee_kcal: number | null;
  calculation_version: number | null;
  created_at: string;
  updated_at: string;
}

export interface QuestDefinition {
  id: string;
  questType: QuestType;
  code: string;
  title: string;
  description: string;
  goalMetric: string;
  goalTarget: number;
  xpReward: number;
}

interface QuestDefinitionRow {
  id: string;
  quest_type: QuestType;
  code: string;
  title: string;
  description: string;
  goal_metric: string;
  goal_target: number;
  xp_reward: number;
}

export interface PlayerRepository {
  getProfile(supabase: SupabaseClient, userId: string): Promise<UserProfile>;
  updateProfile(
    supabase: SupabaseClient,
    userId: string,
    updates: Partial<Omit<UserProfile, "userId" | "createdAt" | "updatedAt">>,
  ): Promise<UserProfile>;
  getGoals(supabase: SupabaseClient, userId: string): Promise<StoredGoals>;
  upsertGoals(
    supabase: SupabaseClient,
    userId: string,
    updates: Partial<StoredGoals>,
  ): Promise<StoredGoals>;
  listQuestDefinitions(
    supabase: SupabaseClient,
    questType: QuestType,
  ): Promise<QuestDefinition[]>;
}

function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    userId: row.id,
    email: row.email,
    name: row.name,
    ageYears: row.age_years,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    gender: row.gender ?? null,
    activityLevel: row.activity_level ?? null,
    jobType: row.job_type ?? null,
    strengthTrainingEnabled: Boolean(row.strength_training_enabled),
    cardioEnabled: Boolean(row.cardio_enabled),
    sessionsPerWeek: row.sessions_per_week,
    desiredSessionsPerWeek: row.desired_sessions_per_week,
    timeZone: row.time_zone ?? "UTC",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGoalsRow(row: UserGoalsRow): StoredGoals {
  return {
    userId: row.user_id,
    goalType: row.goal_type,
    targetWeightKg: row.target_weight_kg,
    timeframeWeeks: row.timeframe_weeks,
    dailyCalorieTarget: row.daily_calorie_target ?? 0,
    dailyProteinTargetG: row.daily_protein_target_g ?? 0,
    dailyCarbsTargetG: row.daily_carbs_target_g ?? 0,
    dailyFatTargetG: row.daily_fat_target_g ?? 0,
    bmrKcal: row.bmr_kcal,
    tdeeKcal: row.tdee_kcal,
    calculationVersion: row.calculation_version ?? 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapQuestDefinitionRow(row: QuestDefinitionRow): QuestDefinition {
  return {
    id: row.id,
    questType: row.quest_type,
    code: row.code,
    title: row.title,
    description: row.description,
    goalMetric: row.goal_metric,
    goalTarget: row.goal_target,
    xpReward: row.xp_reward,
  };
}

async function fetchProfileOrCreate(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw error;
  }

  if (data) {
    return mapProfileRow(data);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email: "",
    })
    .select("*")
    .single<ProfileRow>();

  if (insertError) {
    throw insertError;
  }

  return mapProfileRow(inserted);
}

async function fetchGoalsOrCreate(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<UserGoalsRow>();

  if (error) {
    throw error;
  }

  if (data) {
    return mapGoalsRow(data);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("user_goals")
    .upsert({
      user_id: userId,
    })
    .select("*")
    .single<UserGoalsRow>();

  if (insertError) {
    throw insertError;
  }

  return mapGoalsRow(inserted);
}

export function createPlayerRepository(): PlayerRepository {
  return {
    async getProfile(supabase, userId) {
      return fetchProfileOrCreate(supabase, userId);
    },
    async updateProfile(supabase, userId, updates) {
      const existing = await fetchProfileOrCreate(supabase, userId);
      const { data, error } = await supabase
        .from("profiles")
        .update({
          email: existing.email,
          name: updates.name === undefined ? existing.name : updates.name,
          age_years:
            updates.ageYears === undefined ? existing.ageYears : updates.ageYears,
          height_cm:
            updates.heightCm === undefined ? existing.heightCm : updates.heightCm,
          weight_kg:
            updates.weightKg === undefined ? existing.weightKg : updates.weightKg,
          gender: updates.gender === undefined ? existing.gender : updates.gender,
          activity_level:
            updates.activityLevel === undefined
              ? existing.activityLevel
              : updates.activityLevel,
          job_type:
            updates.jobType === undefined ? existing.jobType : updates.jobType,
          strength_training_enabled:
            updates.strengthTrainingEnabled === undefined
              ? existing.strengthTrainingEnabled
              : updates.strengthTrainingEnabled,
          cardio_enabled:
            updates.cardioEnabled === undefined
              ? existing.cardioEnabled
              : updates.cardioEnabled,
          sessions_per_week:
            updates.sessionsPerWeek === undefined
              ? existing.sessionsPerWeek
              : updates.sessionsPerWeek,
          desired_sessions_per_week:
            updates.desiredSessionsPerWeek === undefined
              ? existing.desiredSessionsPerWeek
              : updates.desiredSessionsPerWeek,
          time_zone:
            updates.timeZone === undefined ? existing.timeZone : updates.timeZone,
        })
        .eq("id", userId)
        .select("*")
        .single<ProfileRow>();

      if (error) {
        throw error;
      }

      return mapProfileRow(data);
    },
    async getGoals(supabase, userId) {
      return fetchGoalsOrCreate(supabase, userId);
    },
    async upsertGoals(supabase, userId, updates) {
      const existing = await fetchGoalsOrCreate(supabase, userId);
      const { data, error } = await supabase
        .from("user_goals")
        .update({
          goal_type: updates.goalType ?? existing.goalType,
          target_weight_kg:
            updates.targetWeightKg === undefined
              ? existing.targetWeightKg
              : updates.targetWeightKg,
          timeframe_weeks:
            updates.timeframeWeeks === undefined
              ? existing.timeframeWeeks
              : updates.timeframeWeeks,
          daily_calorie_target:
            updates.dailyCalorieTarget ?? existing.dailyCalorieTarget,
          daily_protein_target_g:
            updates.dailyProteinTargetG ?? existing.dailyProteinTargetG,
          daily_carbs_target_g:
            updates.dailyCarbsTargetG ?? existing.dailyCarbsTargetG,
          daily_fat_target_g:
            updates.dailyFatTargetG ?? existing.dailyFatTargetG,
          bmr_kcal: updates.bmrKcal === undefined ? existing.bmrKcal : updates.bmrKcal,
          tdee_kcal:
            updates.tdeeKcal === undefined ? existing.tdeeKcal : updates.tdeeKcal,
          calculation_version:
            updates.calculationVersion ?? existing.calculationVersion,
        })
        .eq("user_id", userId)
        .select("*")
        .single<UserGoalsRow>();

      if (error) {
        throw error;
      }

      return mapGoalsRow(data);
    },
    async listQuestDefinitions(supabase, questType) {
      const { data, error } = await supabase
        .from("quest_definitions")
        .select("id, quest_type, code, title, description, goal_metric, goal_target, xp_reward")
        .eq("quest_type", questType)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .returns<QuestDefinitionRow[]>();

      if (error) {
        throw error;
      }

      return (data ?? []).map(mapQuestDefinitionRow);
    },
  };
}
