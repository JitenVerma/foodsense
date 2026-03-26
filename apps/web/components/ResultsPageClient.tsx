"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MealType, MealAnalysisResponse } from "@foodsense/shared";

import { saveMeal } from "../lib/api-client";
import {
  analysisToSaveMealRequest,
  fromDateTimeLocalValue,
  inferMealType,
  toDateTimeLocalValue,
} from "../lib/meal-mappers";
import { loadActiveMealSession, saveActiveMealSession, saveMealSnapshot } from "../lib/session-meal-storage";
import { useAuth } from "../hooks/use-auth";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { UploadPreview } from "./UploadPreview";
import { ResultsEditor } from "./results/ResultsEditor";

export function ResultsPageClient() {
  const router = useRouter();
  const { session: authSession, user } = useAuth();
  const [activeSession, setActiveSession] = useState<{
    imageDataUrl: string;
    analysis: MealAnalysisResponse;
    updatedAt: string;
  } | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("Untitled meal");
  const [mealType, setMealType] = useState<MealType>(inferMealType(new Date()));
  const [eatenAt, setEatenAt] = useState(toDateTimeLocalValue(new Date()));

  useEffect(() => {
    const nextSession = loadActiveMealSession();
    setActiveSession(nextSession);

    if (nextSession) {
      setTitle(nextSession.analysis.dishCandidates[0]?.name || "Untitled meal");
      setMealType(inferMealType(new Date()));
      setEatenAt(toDateTimeLocalValue(new Date()));
    }
  }, []);

  const imagePreview = useMemo(
    () => activeSession?.imageDataUrl ?? null,
    [activeSession],
  );

  async function handleSaveMeal() {
    if (!activeSession) {
      return;
    }

    if (!user || !authSession?.access_token) {
      router.push("/login");
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      const savedMeal = await saveMeal(
        analysisToSaveMealRequest({
          analysis: activeSession.analysis,
          title,
          mealType,
          eatenAt: fromDateTimeLocalValue(eatenAt),
          imageUrl: null,
        }),
        authSession.access_token,
      );
      router.push(`/meals/${savedMeal.id}`);
    } catch (nextError) {
      setSaveError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save this meal right now.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!activeSession) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
        <EmptyState
          title="No analysis loaded yet"
          description="Upload a meal photo first, then come back here to review and edit the detected ingredients."
          action={
            <Link
              href="/analyze"
              className="inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to upload
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
            Results
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            Review and refine the macro estimate
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Update names or grams and the summary will refresh immediately, with
            the backend recalculating nutrition matches in the background.
          </p>
        </div>
        <Link
          href="/analyze"
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
        >
          Analyze another meal
        </Link>
      </div>

      {savedNotice ? <ErrorBanner message={savedNotice} className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-800" /> : null}
      {saveError ? <ErrorBanner message={saveError} className="mb-6" /> : null}

      <section className="mb-6 rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-600">
              Save to history
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Classify this meal before saving it
            </h2>
          </div>
          <button
            type="button"
            onClick={handleSaveMeal}
            disabled={saving}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {user ? (saving ? "Saving..." : "Save meal") : "Log in to save"}
          </button>
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

      <div className="mb-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {imagePreview ? (
          <UploadPreview previewUrl={imagePreview} fileName="Uploaded meal" />
        ) : null}
        <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-600">
            Analysis Notes
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            This estimate is designed to be edited
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
            <li className="rounded-2xl bg-slate-50 px-4 py-3">
              Visible ingredients come from the image itself.
            </li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">
              Inferred ingredients capture likely oils, dressings, or sauce bases.
            </li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">
              Save locally once the edit pass looks right for your meal.
            </li>
          </ul>
        </div>
      </div>

      <ResultsEditor
        analysis={activeSession.analysis}
        onAnalysisChange={(analysis) => {
          const nextSession = {
            ...activeSession,
            analysis,
            updatedAt: new Date().toISOString(),
          };
          setActiveSession(nextSession);
          saveActiveMealSession(nextSession);
        }}
        onSaveLocal={() => {
          saveMealSnapshot(activeSession);
          setSavedNotice("Meal saved locally in this browser.");
          window.setTimeout(() => setSavedNotice(null), 2400);
        }}
      />
    </main>
  );
}
