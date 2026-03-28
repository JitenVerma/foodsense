"use client";

import { useEffect, useState } from "react";

import type {
  GoalType,
  StreakSummary,
  UpdateGoalsRequest,
  UpdateProfileRequest,
  UserGoals,
  UserProfile,
  XpSummary,
} from "@foodsense/shared";

import {
  getGoals,
  getProfile,
  getStreaks,
  getXp,
  updateGoals,
  updateProfile,
} from "../lib/api-client";
import { formatDateKey, getBrowserTimeZone } from "../lib/date-time";
import { getSupabaseBrowserClient } from "../lib/supabase/client";
import { useAuth } from "../hooks/use-auth";
import { AuthRequiredState } from "./AuthRequiredState";
import { ErrorBanner } from "./ErrorBanner";
import { HUDHeader } from "./HUDHeader";
import { InfoTooltip } from "./InfoTooltip";

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getPlayerName(profile: UserProfile | null, email: string | undefined) {
  if (profile?.name?.trim()) {
    return profile.name.trim();
  }

  if (!email) {
    return "Player One";
  }

  return email.split("@")[0] || "Player One";
}

async function loadProfilePageData(accessToken: string, date: string, timeZone: string) {
  const [profile, goals, xp, streaks] = await Promise.all([
    getProfile(accessToken),
    getGoals(accessToken),
    getXp(accessToken, date, timeZone),
    getStreaks(accessToken, date, timeZone),
  ]);

  return {
    profile,
    goals,
    xp,
    streaks,
  };
}

export function ProfilePageClient() {
  const { user, session, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [xp, setXp] = useState<XpSummary | null>(null);
  const [streaks, setStreaks] = useState<StreakSummary | null>(null);
  const [name, setName] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderately_active");
  const [jobType, setJobType] = useState("desk_based");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [strengthTrainingEnabled, setStrengthTrainingEnabled] = useState(false);
  const [cardioEnabled, setCardioEnabled] = useState(false);
  const [sessionsPerWeek, setSessionsPerWeek] = useState("");
  const [desiredSessionsPerWeek, setDesiredSessionsPerWeek] = useState("");
  const [timeZone, setTimeZone] = useState(getBrowserTimeZone());
  const [goalType, setGoalType] = useState<GoalType>("maintain");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [timeframeWeeks, setTimeframeWeeks] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const date = formatDateKey(new Date());
    const currentTimeZone = getBrowserTimeZone();
    loadProfilePageData(session.access_token, date, currentTimeZone)
      .then(({ profile: nextProfile, goals: nextGoals, xp: nextXp, streaks: nextStreaks }) => {
        setProfile(nextProfile);
        setGoals(nextGoals);
        setXp(nextXp);
        setStreaks(nextStreaks);
        setName(nextProfile.name ?? "");
        setAgeYears(nextProfile.ageYears?.toString() ?? "");
        setHeightCm(nextProfile.heightCm?.toString() ?? "");
        setWeightKg(nextProfile.weightKg?.toString() ?? "");
        setActivityLevel(nextProfile.activityLevel ?? "moderately_active");
        setJobType(nextProfile.jobType ?? "desk_based");
        setGender(nextProfile.gender ?? "prefer_not_to_say");
        setStrengthTrainingEnabled(nextProfile.strengthTrainingEnabled);
        setCardioEnabled(nextProfile.cardioEnabled);
        setSessionsPerWeek(nextProfile.sessionsPerWeek?.toString() ?? "");
        setDesiredSessionsPerWeek(nextProfile.desiredSessionsPerWeek?.toString() ?? "");
        setTimeZone(nextProfile.timeZone ?? currentTimeZone);
        setGoalType(nextGoals.goalType);
        setTargetWeightKg(nextGoals.targetWeightKg?.toString() ?? "");
        setTimeframeWeeks(nextGoals.timeframeWeeks?.toString() ?? "");
        setError(null);
      })
      .catch((nextError) => {
        setError(
          nextError instanceof Error ? nextError.message : "Unable to load your profile.",
        );
      });
  }, [session?.access_token]);

  async function handleSave() {
    if (!session?.access_token) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const profilePayload: UpdateProfileRequest = {
        name: name.trim() || null,
        ageYears: parseOptionalNumber(ageYears),
        heightCm: parseOptionalNumber(heightCm),
        weightKg: parseOptionalNumber(weightKg),
        activityLevel: activityLevel as UpdateProfileRequest["activityLevel"],
        jobType: jobType as UpdateProfileRequest["jobType"],
        gender: gender as UpdateProfileRequest["gender"],
        strengthTrainingEnabled,
        cardioEnabled,
        sessionsPerWeek: parseOptionalNumber(sessionsPerWeek),
        desiredSessionsPerWeek: parseOptionalNumber(desiredSessionsPerWeek),
        timeZone,
      };
      const goalsPayload: UpdateGoalsRequest = {
        goalType,
        targetWeightKg: parseOptionalNumber(targetWeightKg),
        timeframeWeeks: parseOptionalNumber(timeframeWeeks),
      };

      await updateProfile(profilePayload, session.access_token);
      await updateGoals(goalsPayload, session.access_token);

      const snapshotDate = formatDateKey(new Date());
      const effectiveTimeZone = profilePayload.timeZone ?? getBrowserTimeZone();
      const { profile: nextProfile, goals: nextGoals, xp: nextXp, streaks: nextStreaks } =
        await loadProfilePageData(session.access_token, snapshotDate, effectiveTimeZone);

      setProfile(nextProfile);
      setGoals(nextGoals);
      setXp(nextXp);
      setStreaks(nextStreaks);
      setTimeZone(nextProfile.timeZone ?? effectiveTimeZone);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save your profile right now.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="px-6 py-12 text-[var(--color-text-primary)]">Loading profile...</main>;
  }

  if (!user || !session) {
    return <AuthRequiredState />;
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
      <HUDHeader
        playerName={getPlayerName(profile, user.email)}
        mealCount={0}
        currentLevel={xp?.currentLevel}
        xpIntoCurrentLevel={xp?.xpIntoCurrentLevel}
        xpToNextLevel={xp?.xpToNextLevel}
        loggingStreak={streaks?.loggingCurrentStreak}
        onSignOut={() => void getSupabaseBrowserClient().auth.signOut()}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="arcade-panel-elevated rounded-xl p-6">
            <p className="arcade-label text-[var(--color-brand-highlight)]">Player Profile</p>
            <h1 className="mt-4 text-2xl text-[var(--color-text-primary)]">
              Tune your health build
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              These inputs drive BMR, TDEE, macro targets, streak logic, and the quest loop.
            </p>
          </div>

          {error ? <ErrorBanner className="arcade-panel rounded-xl border-[var(--color-error)] bg-[rgba(255,77,109,0.08)] text-[var(--color-text-primary)]" message={error} /> : null}

          <section className="arcade-panel rounded-xl p-6">
            <p className="arcade-label text-[var(--color-brand-secondary)]">Identity + Lifestyle</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-[var(--color-text-secondary)]">Name<input value={name} onChange={(event) => setName(event.target.value)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3" /></label>
              <label className="block text-sm text-[var(--color-text-secondary)]">Age<input value={ageYears} onChange={(event) => setAgeYears(event.target.value)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3" /></label>
              <label className="block text-sm text-[var(--color-text-secondary)]">Height (cm)<input value={heightCm} onChange={(event) => setHeightCm(event.target.value)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3" /></label>
              <label className="block text-sm text-[var(--color-text-secondary)]">Weight (kg)<input value={weightKg} onChange={(event) => setWeightKg(event.target.value)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3" /></label>
              <label className="block text-sm text-[var(--color-text-secondary)]">Gender<select value={gender} onChange={(event) => setGender(event.target.value)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3"><option value="prefer_not_to_say">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="non_binary">Non-binary</option><option value="other">Other</option></select></label>
              <label className="block text-sm text-[var(--color-text-secondary)]">Activity Level<select value={activityLevel} onChange={(event) => setActivityLevel(event.target.value)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3"><option value="sedentary">Sedentary</option><option value="lightly_active">Lightly active</option><option value="moderately_active">Moderately active</option><option value="very_active">Very active</option></select></label>
              <label className="block text-sm text-[var(--color-text-secondary)]">Job Type<select value={jobType} onChange={(event) => setJobType(event.target.value)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3"><option value="desk_based">Desk-based</option><option value="mixed">Mixed</option><option value="active">Active</option></select></label>
              <label className="block text-sm text-[var(--color-text-secondary)]">Time Zone<input value={timeZone} onChange={(event) => setTimeZone(event.target.value)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3" /></label>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]"><input type="checkbox" checked={strengthTrainingEnabled} onChange={(event) => setStrengthTrainingEnabled(event.target.checked)} />Strength training</label>
              <label className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]"><input type="checkbox" checked={cardioEnabled} onChange={(event) => setCardioEnabled(event.target.checked)} />Cardio</label>
              <label className="block text-sm text-[var(--color-text-secondary)]">Sessions per week<input value={sessionsPerWeek} onChange={(event) => setSessionsPerWeek(event.target.value)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3" /></label>
              <label className="block text-sm text-[var(--color-text-secondary)]">Desired sessions per week<input value={desiredSessionsPerWeek} onChange={(event) => setDesiredSessionsPerWeek(event.target.value)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3" /></label>
            </div>
          </section>

          <section className="arcade-panel rounded-xl p-6">
            <p className="arcade-label text-[var(--color-brand-accent)]">Goals</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="block text-sm text-[var(--color-text-secondary)]">Goal Type<select value={goalType} onChange={(event) => setGoalType(event.target.value as GoalType)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3"><option value="lose_weight">Lose weight</option><option value="maintain">Maintain</option><option value="gain_weight">Gain weight</option></select></label>
              <label className="block text-sm text-[var(--color-text-secondary)]">Target weight (kg)<input value={targetWeightKg} onChange={(event) => setTargetWeightKg(event.target.value)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3" /></label>
              <label className="block text-sm text-[var(--color-text-secondary)]">Timeframe (weeks)<input value={timeframeWeeks} onChange={(event) => setTimeframeWeeks(event.target.value)} className="arcade-input mt-2 w-full rounded-lg px-4 py-3" /></label>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="arcade-panel-elevated rounded-xl p-6">
            <p className="arcade-label text-[var(--color-brand-highlight)]">Derived Targets</p>
            <div className="mt-5 grid gap-4">
              <div className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="arcade-label text-[var(--color-text-muted)]">BMR</p>
                  <InfoTooltip
                    label="What is BMR?"
                    title="Basal Metabolic Rate"
                    description="BMR is the energy your body uses at rest to keep you alive, covering basics like breathing, circulation, and organ function."
                    detail="It is estimated from your weight, height, age, and gender marker. It helps anchor your calorie target so your plan is not guesswork."
                  />
                </div>
                <p className="mt-2 text-lg text-[var(--color-text-primary)]">
                  {goals?.targets.bmr_kcal ? `${goals.targets.bmr_kcal} kcal` : "Need more profile data"}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="arcade-label text-[var(--color-text-muted)]">TDEE</p>
                  <InfoTooltip
                    label="What is TDEE?"
                    title="Total Daily Energy Expenditure"
                    description="TDEE estimates how many calories you burn across a normal day once activity, work style, and training load are factored in."
                    detail="It starts with your BMR, then applies activity and exercise adjustments. This is the main number used to shape your calorie goal for fat loss, maintenance, or gain."
                  />
                </div>
                <p className="mt-2 text-lg text-[var(--color-text-primary)]">
                  {goals?.targets.tdee_kcal ? `${goals.targets.tdee_kcal} kcal` : "Need more profile data"}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-4 text-sm text-[var(--color-text-secondary)]"><p>Calories: {goals?.targets.calorie_target_kcal ?? 0}</p><p>Protein: {goals?.targets.protein_target_g ?? 0}g</p><p>Carbs: {goals?.targets.carbs_target_g ?? 0}g</p><p>Fat: {goals?.targets.fat_target_g ?? 0}g</p></div>
            </div>
            <button type="button" onClick={handleSave} disabled={saving} className="arcade-button-primary mt-6 w-full">
              {saving ? "Saving..." : "Save profile + goals"}
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
