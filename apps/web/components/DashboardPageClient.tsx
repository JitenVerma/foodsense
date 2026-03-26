"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { MealsByDateResponse, SavedMeal } from "@foodsense/shared";

import { getMealsByDate } from "../lib/api-client";
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

const DEFAULT_GOALS = {
  protein_g: 120,
  carbs_g: 250,
  fat_g: 70,
  calories_kcal: 2200,
};

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

function getPlayerName(email: string | undefined) {
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
  const [response, setResponse] = useState<MealsByDateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    getMealsByDate(
      getTodayDateKey(),
      session.access_token,
      getBrowserTimeZone(),
    )
      .then((nextResponse) => {
        setResponse(nextResponse);
        setError(null);
      })
      .catch((nextError) => {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load today's meals.",
        );
      });
  }, [session?.access_token]);

  const groupedMeals = useMemo(
    () => groupMealsByType(response?.meals ?? []),
    [response?.meals],
  );
  const playerName = getPlayerName(user?.email);
  const mealCount = response?.meals.length ?? 0;
  const totals = response?.macroTotals ?? {
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    calories_kcal: 0,
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
        onSignOut={() => void getSupabaseBrowserClient().auth.signOut()}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <div className="arcade-panel-elevated rounded-xl p-6">
            <p className="arcade-label text-[var(--color-brand-highlight)]">Daily Status</p>
            <h1 className="mt-4 text-2xl leading-snug text-[var(--color-text-primary)]">
              {playerName}, your nutrition run is live.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
              Meals become inventory items, macros become player stats, and your
              daily progress updates in real time.
            </p>
          </div>

          {error ? <ErrorBanner className="arcade-panel rounded-xl border-[var(--color-error)] bg-[rgba(255,77,109,0.08)] text-[var(--color-text-primary)]" message={error} /> : null}

          <div className="grid gap-5 md:grid-cols-2">
            <StatPanel
              label="Protein"
              value={`${totals.protein_g}g`}
              target={`${DEFAULT_GOALS.protein_g}g`}
              progressValue={totals.protein_g}
              progressTarget={DEFAULT_GOALS.protein_g}
              tone="protein"
            />
            <StatPanel
              label="Carbs"
              value={`${totals.carbs_g}g`}
              target={`${DEFAULT_GOALS.carbs_g}g`}
              progressValue={totals.carbs_g}
              progressTarget={DEFAULT_GOALS.carbs_g}
              tone="carbs"
            />
            <StatPanel
              label="Fat"
              value={`${totals.fat_g}g`}
              target={`${DEFAULT_GOALS.fat_g}g`}
              progressValue={totals.fat_g}
              progressTarget={DEFAULT_GOALS.fat_g}
              tone="fat"
            />
            <StatPanel
              label="Calories"
              value={`${totals.calories_kcal}`}
              target={`${DEFAULT_GOALS.calories_kcal}`}
              progressValue={totals.calories_kcal}
              progressTarget={DEFAULT_GOALS.calories_kcal}
              tone="calories"
            />
          </div>
        </div>

        <QuestPanel
          playerName={playerName}
          mealCount={mealCount}
          calories={totals.calories_kcal}
          proteinProgress={Math.min(
            100,
            Math.round((totals.protein_g / DEFAULT_GOALS.protein_g) * 100),
          )}
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
          <Link href="/analyze" className="arcade-button-primary hidden xl:inline-flex">
            + Add Meal
          </Link>
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
              description="Analyze your first meal to start today's retro nutrition run."
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
