"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MealAnalysisResponse } from "@foodsense/shared";

import { useMealResultsEditor } from "../../hooks/use-meal-results-editor";
import { DishCandidatesCard } from "../DishCandidatesCard";
import { ErrorBanner } from "../ErrorBanner";
import { IngredientTable } from "../IngredientTable";
import { MacroSummaryCard } from "../MacroSummaryCard";

interface ResultsEditorProps {
  analysis: MealAnalysisResponse;
  onAnalysisChange?: (analysis: MealAnalysisResponse) => void;
  onSaveLocal?: () => void;
}

export function ResultsEditor({
  analysis,
  onAnalysisChange,
  onSaveLocal,
}: ResultsEditorProps) {
  const editor = useMealResultsEditor(analysis);
  const lastEmittedSignatureRef = useRef("");

  const nextAnalysis = useMemo(
    () => ({
      ...analysis,
      visibleIngredients: editor.visibleIngredients,
      inferredIngredients: editor.inferredIngredients,
      macroTotals: editor.macroTotals,
      warnings: editor.warnings,
    }),
    [
      analysis,
      editor.inferredIngredients,
      editor.macroTotals,
      editor.visibleIngredients,
      editor.warnings,
    ],
  );

  useEffect(() => {
    if (!onAnalysisChange) {
      return;
    }

    const signature = JSON.stringify(nextAnalysis);
    if (signature === lastEmittedSignatureRef.current) {
      return;
    }

    lastEmittedSignatureRef.current = signature;
    onAnalysisChange(nextAnalysis);
  }, [nextAnalysis, onAnalysisChange]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DishCandidatesCard candidates={analysis.dishCandidates} />
        <MacroSummaryCard totals={editor.macroTotals} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <IngredientTable
            title="Visible ingredients"
            description="These are ingredients the model believes are directly visible in the photo."
            ingredients={editor.visibleIngredients}
            onNameChange={editor.updateIngredientName}
            onGramsChange={editor.updateIngredientGrams}
            onRemove={editor.removeIngredient}
            onAdd={() => editor.addIngredient("visible")}
          />
          <IngredientTable
            title="Inferred ingredients"
            description="These are likely recipe ingredients, oils, dressings, or sauce components that may not be fully visible."
            ingredients={editor.inferredIngredients}
            onNameChange={editor.updateIngredientName}
            onGramsChange={editor.updateIngredientGrams}
            onRemove={editor.removeIngredient}
            onAdd={() => editor.addIngredient("inferred")}
          />
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-600">
                  Assumptions
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Uncertainty made explicit
                </h2>
              </div>
              {onSaveLocal ? (
                <button
                  type="button"
                  onClick={onSaveLocal}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                >
                  Save locally
                </button>
              ) : null}
            </div>

            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              {analysis.assumptions.map((assumption, index) => (
                <li
                  key={`${assumption}-${index}`}
                  className="rounded-2xl bg-slate-50 px-4 py-3"
                >
                  {assumption}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-600">
                  Recalculation
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Sync status
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                {editor.syncState}
              </span>
            </div>

            {editor.syncError ? (
              <ErrorBanner className="mt-5" message={editor.syncError} />
            ) : null}

            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              {editor.warnings.map((warning, index) => (
                <li
                  key={`${warning}-${index}`}
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
                >
                  {warning}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
