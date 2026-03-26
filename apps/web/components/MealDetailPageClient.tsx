"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MealAnalysisResponse, MealType, SavedMeal } from "@foodsense/shared";

import { deleteMeal, getMeal, updateMeal } from "../lib/api-client";
import {
  analysisToUpdateMealRequest,
  fromDateTimeLocalValue,
  savedMealToAnalysis,
  toDateTimeLocalValue,
} from "../lib/meal-mappers";
import { useAuth } from "../hooks/use-auth";
import { AuthRequiredState } from "./AuthRequiredState";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { ResultsEditor } from "./results/ResultsEditor";

export function MealDetailPageClient({ mealId }: { mealId: string }) {
  const router = useRouter();
  const { user, session, loading } = useAuth();
  const [meal, setMeal] = useState<SavedMeal | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysisResponse | null>(null);
  const [title, setTitle] = useState("Untitled meal");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [eatenAt, setEatenAt] = useState(toDateTimeLocalValue(new Date()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    getMeal(mealId, session.access_token)
      .then((savedMeal) => {
        setMeal(savedMeal);
        setAnalysis(savedMealToAnalysis(savedMeal));
        setTitle(savedMeal.title);
        setMealType(savedMeal.mealType);
        setEatenAt(toDateTimeLocalValue(new Date(savedMeal.eatenAt)));
        setError(null);
      })
      .catch((nextError) => {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load this meal.",
        );
      });
  }, [mealId, session?.access_token]);

  const headerCopy = useMemo(
    () => meal?.mealType ?? mealType,
    [meal?.mealType, mealType],
  );

  async function handleSave() {
    if (!session?.access_token || !analysis) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const updatedMeal = await updateMeal(
        mealId,
        analysisToUpdateMealRequest({
          analysis,
          title,
          mealType,
          eatenAt: fromDateTimeLocalValue(eatenAt),
          imageUrl: meal?.imageUrl ?? null,
        }),
        session.access_token,
      );
      setMeal(updatedMeal);
      setAnalysis(savedMealToAnalysis(updatedMeal));
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save meal changes.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!session?.access_token) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await deleteMeal(mealId, session.access_token);
      router.push("/dashboard");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to delete this meal.",
      );
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="px-6 py-12">Loading meal...</main>;
  }

  if (!user || !session) {
    return <AuthRequiredState />;
  }

  if (!meal || !analysis) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
        <EmptyState
          title="Meal not loaded"
          description={error || "We couldn't find that saved meal."}
          action={
            <Link
              href="/dashboard"
              className="inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to dashboard
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
            Meal detail
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">{title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Edit ingredients, grams, and meal metadata, then save the recalculated result back to your history.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
        >
          Back to dashboard
        </Link>
      </div>

      {error ? <ErrorBanner className="mb-6" message={error} /> : null}

      <section className="mb-6 rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-600">
              Meal metadata
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              {headerCopy} logged for {new Date(meal.eatenAt).toLocaleDateString()}
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed"
            >
              Delete meal
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Meal type
            </span>
            <select
              value={mealType}
              onChange={(event) => setMealType(event.target.value as MealType)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Eaten at
            </span>
            <input
              type="datetime-local"
              value={eatenAt}
              onChange={(event) => setEatenAt(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400"
            />
          </label>
        </div>
      </section>

      <ResultsEditor analysis={analysis} onAnalysisChange={setAnalysis} />
    </main>
  );
}
