"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type {
  QuestProgress,
  SavedMeal,
  StreakSummary,
  TodayProgress,
  UserGoals,
  UserProfile,
  XpSummary,
} from "@foodsense/shared";

import {
  getDailyQuests,
  getProfile,
  getStreaks,
  getTodayProgress,
  getXp,
} from "../lib/api-client";
import { formatDateKey, getBrowserTimeZone } from "../lib/date-time";
import { getSupabaseBrowserClient } from "../lib/supabase/client";
import { useAuth } from "../hooks/use-auth";
import { AuthRequiredState } from "./AuthRequiredState";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { FloatingAddButton } from "./FloatingAddButton";
import { HUDHeader } from "./HUDHeader";
import { MealGroupSection } from "./MealGroupSection";
import { QuestPanel } from "./QuestPanel";
import { StatPanel } from "./StatPanel";

interface DashboardState {
  profile: UserProfile;
  todayProgress: TodayProgress;
  xp: XpSummary;
  streaks: StreakSummary;
  dailyQuests: QuestProgress[];
}

const mealTypeOrder: Array<SavedMeal["mealType"]> = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

function getTodayDateKey() {
  return formatDateKey(new Date());
}

function groupMealsByType(meals: SavedMeal[]) {
  return mealTypeOrder.map((mealType) => ({
    mealType,
    meals: meals.filter((meal) => meal.mealType === mealType),
  }));
}

function getPlayerName(profile: UserProfile | null, email: string | undefined) {
  if (profile?.name?.trim()) {
    return profile.name.trim();
  }

  if (!email) {
    return "Player One";
  }

  const [name] = email.split("@");
  return name
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : "Player One";
}

export function DashboardPageClient() {
  const { user, session, loading } = useAuth();
  const [state, setState] = useState<DashboardState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const date = getTodayDateKey();
    const timeZone = getBrowserTimeZone();

    Promise.all([
      getProfile(session.access_token),
      getTodayProgress(session.access_token, date, timeZone),
      getXp(session.access_token, date, timeZone),
      getStreaks(session.access_token, date, timeZone),
      getDailyQuests(session.access_token, date, timeZone),
    ])
      .then(([profile, todayProgress, xp, streaks, dailyQuests]) => {
        setState({
          profile,
          todayProgress,
          xp,
          streaks,
          dailyQuests,
        });
        setError(null);
      })
      .catch((nextError) => {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load your dashboard.",
        );
      });
  }, [session?.access_token]);

  const playerName = getPlayerName(state?.profile ?? null, user?.email);
  const groupedMeals = useMemo(
    () => groupMealsByType(state?.todayProgress.meals ?? []),
    [state?.todayProgress.meals],
  );
  const mealCount = state?.todayProgress.mealCount ?? 0;
  const totals = state?.todayProgress.macroTotals ?? {
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    calories_kcal: 0,
  };
  const targets = state?.todayProgress.targets ?? {
    calorie_target_kcal: 2200,
    protein_target_g: 120,
    carbs_target_g: 250,
    fat_target_g: 70,
    bmr_kcal: null,
    tdee_kcal: null,
  };

  if (loading) {
    return <main className="px-6 py-12 text-[var(--color-text-primary)]">Loading dashboard...</main>;
  }

  if (!user || !session) {
    return <AuthRequiredState />;
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
      <HUDHeader
        playerName={playerName}
        mealCount={mealCount}
        currentLevel={state?.xp.currentLevel}
        xpIntoCurrentLevel={state?.xp.xpIntoCurrentLevel}
        xpToNextLevel={state?.xp.xpToNextLevel}
        loggingStreak={state?.streaks.loggingCurrentStreak}
        onSignOut={() => void getSupabaseBrowserClient().auth.signOut()}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <div className="arcade-panel-elevated rounded-xl p-6">
            <p className="arcade-label text-[var(--color-brand-highlight)]">Daily Status</p>
            <h1 className="mt-4 text-2xl leading-snug text-[var(--color-text-primary)]">
              {playerName}, your daily nutrition run is live.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
              Profile-driven targets, streaks, XP, quests, and editable meal logs now
              feed the same progression loop.
            </p>
            {state ? (
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="arcade-panel rounded-lg px-4 py-4">
                  <p className="arcade-label text-[var(--color-text-muted)]">Goal</p>
                  <p className="mt-2 text-sm text-[var(--color-text-primary)]">
                    {state.profile.weightKg ? `${state.profile.weightKg} kg tracked` : "Set your weight"}
                  </p>
                </div>
                <div className="arcade-panel rounded-lg px-4 py-4">
                  <p className="arcade-label text-[var(--color-text-muted)]">TDEE</p>
                  <p className="mt-2 text-sm text-[var(--color-text-primary)]">
                    {targets.tdee_kcal ? `${targets.tdee_kcal} kcal` : "Awaiting profile inputs"}
                  </p>
                </div>
                <div className="arcade-panel rounded-lg px-4 py-4">
                  <p className="arcade-label text-[var(--color-text-muted)]">Today XP</p>
                  <p className="mt-2 text-sm text-[var(--color-text-primary)]">
                    +{state.xp.todayXp}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {error ? <ErrorBanner className="arcade-panel rounded-xl border-[var(--color-error)] bg-[rgba(255,77,109,0.08)] text-[var(--color-text-primary)]" message={error} /> : null}

          <div className="grid gap-5 md:grid-cols-2">
            <StatPanel
              label="Protein"
              value={`${totals.protein_g}g`}
              target={`${targets.protein_target_g}g`}
              progressValue={totals.protein_g}
              progressTarget={targets.protein_target_g}
              tone="protein"
            />
            <StatPanel
              label="Carbs"
              value={`${totals.carbs_g}g`}
              target={`${targets.carbs_target_g}g`}
              progressValue={totals.carbs_g}
              progressTarget={targets.carbs_target_g}
              tone="carbs"
            />
            <StatPanel
              label="Fat"
              value={`${totals.fat_g}g`}
              target={`${targets.fat_target_g}g`}
              progressValue={totals.fat_g}
              progressTarget={targets.fat_target_g}
              tone="fat"
            />
            <StatPanel
              label="Calories"
              value={`${totals.calories_kcal}`}
              target={`${targets.calorie_target_kcal}`}
              progressValue={totals.calories_kcal}
              progressTarget={targets.calorie_target_kcal}
              tone="calories"
            />
          </div>

          <div className="arcade-panel rounded-xl p-5">
            <p className="arcade-label text-[var(--color-brand-secondary)]">Insights</p>
            <div className="mt-4 grid gap-3">
              {(state?.todayProgress.insights ?? [
                "Set up your profile to unlock personalized targets.",
              ]).map((insight) => (
                <div
                  key={insight}
                  className="rounded-lg border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
                >
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>

        <QuestPanel
          playerName={playerName}
          mealCount={mealCount}
          calories={totals.calories_kcal}
          proteinProgress={Math.min(
            100,
            Math.round((totals.protein_g / Math.max(targets.protein_target_g, 1)) * 100),
          )}
          dailyQuests={state?.dailyQuests}
          currentLevel={state?.xp.currentLevel}
          todayXp={state?.xp.todayXp}
          loggingStreak={state?.streaks.loggingCurrentStreak}
        />
      </section>

      <section className="mt-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="arcade-label text-[var(--color-brand-secondary)]">Meal Inventory</p>
            <h2 className="mt-3 text-xl leading-snug text-[var(--color-text-primary)]">
              Today&apos;s collected meals
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/library" className="arcade-button-secondary hidden xl:inline-flex">
              Open library
            </Link>
            <Link href="/analyze" className="arcade-button-primary hidden xl:inline-flex">
              + Add Meal
            </Link>
          </div>
        </div>

        {mealCount > 0 ? (
          <div className="space-y-8">
            {groupedMeals.map((group) => (
              <MealGroupSection
                key={group.mealType}
                title={group.mealType}
                meals={group.meals}
              />
            ))}
          </div>
        ) : (
          <div className="arcade-panel rounded-xl p-4">
            <EmptyState
              title="Inventory empty"
              description="Analyze your first meal to start today's retro progression loop."
              action={
                <Link href="/analyze" className="arcade-button-primary">
                  Analyze a meal
                </Link>
              }
            />
          </div>
        )}
      </section>

      <FloatingAddButton />
    </main>
  );
}
