"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { analyzeMeal } from "../lib/api-client";
import { validateImageFile } from "../lib/file-validation";
import { saveActiveMealSession } from "../lib/session-meal-storage";
import { AnalyzeButton } from "./AnalyzeButton";
import { ErrorBanner } from "./ErrorBanner";
import { ImageUploader } from "./ImageUploader";
import { LoadingOverlay } from "./LoadingOverlay";
import { UploadPreview } from "./UploadPreview";

export function HomePageClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subcopy = useMemo(
    () =>
      "Upload a plate, bowl, or meal-prep shot and get an editable macro breakdown built from dish detection, visible ingredients, recipe inference, and portion estimates.",
    [],
  );

  async function handleFileSelected(nextFile: File) {
    const validationError = validateImageFile(nextFile);
    if (validationError) {
      setError(validationError);
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setError(null);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  }

  async function handleAnalyze() {
    if (!file || !previewUrl) {
      setError("Please upload a meal image before analyzing.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const analysis = await analyzeMeal(file);
      saveActiveMealSession({
        imageDataUrl: previewUrl,
        analysis,
        updatedAt: new Date().toISOString(),
      });
      router.push("/results");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to analyze the meal right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%),radial-gradient(circle_at_right,_rgba(14,165,233,0.12),_transparent_38%)]" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-12 lg:px-10">
        <section className="grid items-center gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="relative rounded-[36px] border border-white/50 bg-white/80 p-8 shadow-2xl shadow-emerald-100/70 backdrop-blur-sm sm:p-10">
            {loading ? <LoadingOverlay label="Analyzing your meal with Gemini..." /> : null}
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
              FoodSense
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Turn a meal photo into an editable macro estimate in seconds.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              {subcopy}
            </p>

            <div className="mt-8 space-y-5">
              <ImageUploader onFileSelected={handleFileSelected} error={error} />
              {error ? <ErrorBanner message={error} /> : null}
              <div className="flex flex-wrap items-center gap-3">
                <AnalyzeButton
                  disabled={!file}
                  loading={loading}
                  onClick={handleAnalyze}
                />
                <p className="text-sm text-slate-500">
                  Supports JPG, PNG, and WEBP up to 10MB.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {previewUrl && file ? (
              <UploadPreview previewUrl={previewUrl} fileName={file.name} />
            ) : (
              <div className="rounded-[36px] border border-white/60 bg-white/85 p-8 shadow-xl shadow-slate-200/60 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
                  What you get
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    "Top dish candidates with confidence scores",
                    "Visible ingredients separated from inferred ones",
                    "Ingredient-level grams and macros you can edit live",
                    "Client-updating totals with backend recalculation support",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

