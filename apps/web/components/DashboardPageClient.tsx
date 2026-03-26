"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { MealsByDateResponse } from "@foodsense/shared";

import { getMealsByDate } from "../lib/api-client";
import { formatDateKey, getBrowserTimeZone } from "../lib/date-time";
import { getSupabaseBrowserClient } from "../lib/supabase/client";
import { useAuth } from "../hooks/use-auth";
import { AuthRequiredState } from "./AuthRequiredState";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { MacroSummaryCard } from "./MacroSummaryCard";

function getTodayDateKey() {
  return formatDateKey(new Date());
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

  const mealCountLabel = useMemo(
    () => `${response?.meals.length ?? 0} meals logged today`,
    [response?.meals.length],
  );

  if (loading) {
    return <main className="px-6 py-12">Loading dashboard...</main>;
  }

  if (!user || !session) {
    return <AuthRequiredState />;
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
            Dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            Today&apos;s meals
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            {mealCountLabel}. Analyze a new meal or review your saved history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/analyze"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add meal
          </Link>
          <Link
            href="/calendar"
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Open calendar
          </Link>
          <button
            type="button"
            onClick={() => void getSupabaseBrowserClient().auth.signOut()}
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Log out
          </button>
        </div>
      </div>

      {error ? <ErrorBanner className="mb-6" message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <MacroSummaryCard
          totals={
            response?.macroTotals ?? {
              protein_g: 0,
              carbs_g: 0,
              fat_g: 0,
              calories_kcal: 0,
            }
          }
        />

        <section className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-600">
            Today&apos;s log
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Saved meals
          </h2>

          {response && response.meals.length > 0 ? (
            <div className="mt-5 space-y-3">
              {response.meals.map((meal) => (
                <Link
                  key={meal.id}
                  href={`/meals/${meal.id}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50/60"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">
                        {meal.mealType}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-950">
                        {meal.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {new Date(meal.eatenAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p>{meal.macroTotals.calories_kcal} kcal</p>
                      <p>{meal.ingredients.length} ingredients</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="No meals saved yet"
                description="Analyze your first meal to start building today's macro history."
                action={
                  <Link
                    href="/analyze"
                    className="inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Analyze a meal
                  </Link>
                }
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
