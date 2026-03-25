"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MealAnalysisResponse } from "@foodsense/shared";

import { loadActiveMealSession, saveActiveMealSession, saveMealSnapshot } from "../lib/session-meal-storage";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { UploadPreview } from "./UploadPreview";
import { ResultsEditor } from "./results/ResultsEditor";

export function ResultsPageClient() {
  const [session, setSession] = useState<{
    imageDataUrl: string;
    analysis: MealAnalysisResponse;
    updatedAt: string;
  } | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    setSession(loadActiveMealSession());
  }, []);

  const imagePreview = useMemo(() => session?.imageDataUrl ?? null, [session]);

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
        <EmptyState
          title="No analysis loaded yet"
          description="Upload a meal photo first, then come back here to review and edit the detected ingredients."
          action={
            <Link
              href="/"
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
          href="/"
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
        >
          Analyze another meal
        </Link>
      </div>

      {savedNotice ? <ErrorBanner message={savedNotice} className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-800" /> : null}

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
        analysis={session.analysis}
        onAnalysisChange={(analysis) => {
          const nextSession = {
            ...session,
            analysis,
            updatedAt: new Date().toISOString(),
          };
          setSession(nextSession);
          saveActiveMealSession(nextSession);
        }}
        onSaveLocal={() => {
          saveMealSnapshot(session);
          setSavedNotice("Meal saved locally in this browser.");
          window.setTimeout(() => setSavedNotice(null), 2400);
        }}
      />
    </main>
  );
}

