"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { MealsByDateResponse } from "@foodsense/shared";

import { getMealsByDate } from "../lib/api-client";
import { getBrowserTimeZone } from "../lib/date-time";
import { useAuth } from "../hooks/use-auth";
import { AuthRequiredState } from "./AuthRequiredState";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { MacroSummaryCard } from "./MacroSummaryCard";

export function DailyDetailPageClient({ date }: { date: string }) {
  const { user, session, loading } = useAuth();
  const [response, setResponse] = useState<MealsByDateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    getMealsByDate(date, session.access_token, getBrowserTimeZone())
      .then((nextResponse) => {
        setResponse(nextResponse);
        setError(null);
      })
      .catch((nextError) => {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load this day.",
        );
      });
  }, [date, session?.access_token]);

  if (loading) {
    return <main className="px-6 py-12">Loading day...</main>;
  }

  if (!user || !session) {
    return <AuthRequiredState />;
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
            Daily detail
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">{date}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Review all saved meals for this day and jump into any meal for editing.
          </p>
        </div>
        <Link
          href="/calendar"
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
        >
          Back to calendar
        </Link>
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
            Meals
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Logged entries
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
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p>{meal.macroTotals.calories_kcal} kcal</p>
                      <p>{new Date(meal.eatenAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="No meals on this date"
                description="This day doesn't have any saved meals yet."
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
