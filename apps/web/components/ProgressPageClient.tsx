"use client";

import { useEffect, useState } from "react";

import type {
  ProgressRange,
  StreakSummary,
  UserProfile,
  XpSummary,
} from "@foodsense/shared";

import { getProfile, getProgressRange, getStreaks, getXp } from "../lib/api-client";
import { formatDateKey, getBrowserTimeZone } from "../lib/date-time";
import { useAuth } from "../hooks/use-auth";
import { getSupabaseBrowserClient } from "../lib/supabase/client";
import { AuthRequiredState } from "./AuthRequiredState";
import { ErrorBanner } from "./ErrorBanner";
import { HUDHeader } from "./HUDHeader";
import { ProgressTrendChart } from "./ProgressTrendChart";

function getPlayerName(profile: UserProfile | null, email: string | undefined) {
  return profile?.name?.trim() || email?.split("@")[0] || "Player One";
}

function getRangeLabel(period: ProgressRange["period"]) {
  return period === "monthly" ? "Last 31 days" : "Last 7 days";
}

export function ProgressPageClient() {
  const { user, session, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<ProgressRange | null>(null);
  const [xp, setXp] = useState<XpSummary | null>(null);
  const [streaks, setStreaks] = useState<StreakSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [period, setPeriod] = useState<ProgressRange["period"]>("weekly");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const timeZone = getBrowserTimeZone();
    Promise.all([
      getProfile(session.access_token),
      getProgressRange(session.access_token, period, selectedDate, timeZone),
      getXp(session.access_token, selectedDate, timeZone),
      getStreaks(session.access_token, selectedDate, timeZone),
    ])
      .then(([nextProfile, nextProgress, nextXp, nextStreaks]) => {
        setProfile(nextProfile);
        setProgress(nextProgress);
        setXp(nextXp);
        setStreaks(nextStreaks);
        setError(null);
      })
      .catch((nextError) => {
        setError(
          nextError instanceof Error ? nextError.message : "Unable to load progress.",
        );
      });
  }, [period, selectedDate, session?.access_token]);

  if (loading) {
    return (
      <main className="px-6 py-12 text-[var(--color-text-primary)]">
        Loading progress...
      </main>
    );
  }

  if (!user || !session) {
    return <AuthRequiredState />;
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
      <HUDHeader
        playerName={getPlayerName(profile, user.email)}
        mealCount={progress?.totalMeals ?? 0}
        currentLevel={xp?.currentLevel}
        xpIntoCurrentLevel={xp?.xpIntoCurrentLevel}
        xpToNextLevel={xp?.xpToNextLevel}
        loggingStreak={streaks?.loggingCurrentStreak}
        onSignOut={() => void getSupabaseBrowserClient().auth.signOut()}
      />

      <section className="mt-8 space-y-6">
        <div className="arcade-panel-elevated rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="arcade-label text-[var(--color-brand-highlight)]">
                Progress Overview
              </p>
              <h1 className="mt-4 text-2xl text-[var(--color-text-primary)]">
                Trend lines for your nutrition and momentum
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
                Track calories and macros over time, then use meals and XP as quick
                context for how the week or month is unfolding.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full border border-[var(--color-border-subtle)] p-1">
                {(["weekly", "monthly"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPeriod(option)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      period === option
                        ? "bg-[var(--color-brand-highlight)] text-[var(--color-surface-base)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {option === "weekly" ? "Weekly" : "Monthly"}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="arcade-input rounded-lg px-4 py-3"
              />
            </div>
          </div>
        </div>

        {error ? (
          <ErrorBanner
            className="arcade-panel rounded-xl border-[var(--color-error)] bg-[rgba(255,77,109,0.08)] text-[var(--color-text-primary)]"
            message={error}
          />
        ) : null}

        <div className="grid gap-5 md:grid-cols-4">
          <div className="arcade-panel rounded-xl p-5">
            <p className="arcade-label text-[var(--color-text-muted)]">
              {getRangeLabel(period)} Calories
            </p>
            <p className="mt-3 text-xl text-[var(--color-text-primary)]">
              {progress?.totals.calories_kcal ?? 0}
            </p>
          </div>
          <div className="arcade-panel rounded-xl p-5">
            <p className="arcade-label text-[var(--color-text-muted)]">
              Average Daily Calories
            </p>
            <p className="mt-3 text-xl text-[var(--color-text-primary)]">
              {progress?.averageDailyCalories ?? 0}
            </p>
          </div>
          <div className="arcade-panel rounded-xl p-5">
            <p className="arcade-label text-[var(--color-text-muted)]">Logged Days</p>
            <p className="mt-3 text-xl text-[var(--color-text-primary)]">
              {progress?.loggedDays ?? 0}/{period === "monthly" ? 31 : 7}
            </p>
          </div>
          <div className="arcade-panel rounded-xl p-5">
            <p className="arcade-label text-[var(--color-text-muted)]">Protein Goal Days</p>
            <p className="mt-3 text-xl text-[var(--color-text-primary)]">
              {progress?.proteinGoalDays ?? 0}
            </p>
          </div>
        </div>

        <section className="arcade-panel rounded-xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="arcade-label text-[var(--color-brand-secondary)]">
                Nutrition Trend Graph
              </p>
              <h2 className="mt-3 text-xl text-[var(--color-text-primary)]">
                {getRangeLabel(period)}
              </h2>
            </div>
            <div className="grid gap-2 text-sm text-[var(--color-text-secondary)] sm:text-right">
              <p>
                Range: {progress ? `${progress.startDate} to ${progress.endDate}` : "--"}
              </p>
              <p>Average protein: {progress?.averageDailyProtein ?? 0} g per day</p>
            </div>
          </div>

          <div className="mt-6">
            {progress ? (
              <ProgressTrendChart progress={progress} />
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)]">
                No progress data is available yet for this range.
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[var(--color-border-subtle)] px-4 py-4">
              <p className="arcade-label text-[var(--color-text-muted)]">Meals Logged</p>
              <p className="mt-3 text-lg text-[var(--color-text-primary)]">
                {progress?.totalMeals ?? 0}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Useful for spotting whether low macro days came from under-eating or
                simply missing logs.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border-subtle)] px-4 py-4">
              <p className="arcade-label text-[var(--color-text-muted)]">XP Earned</p>
              <p className="mt-3 text-lg text-[var(--color-text-primary)]">
                +{progress?.totalXp ?? 0}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Momentum score across logging, target hits, and full-day completion.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border-subtle)] px-4 py-4">
              <p className="arcade-label text-[var(--color-text-muted)]">
                Calorie Range Days
              </p>
              <p className="mt-3 text-lg text-[var(--color-text-primary)]">
                {progress?.calorieTargetDays ?? 0}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Days where calories landed inside your target lane.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border-subtle)] px-4 py-4">
              <p className="arcade-label text-[var(--color-text-muted)]">Complete Days</p>
              <p className="mt-3 text-lg text-[var(--color-text-primary)]">
                {progress?.days.filter((day) => day.fullDayComplete).length ?? 0}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Breakfast, lunch, and dinner all logged.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
