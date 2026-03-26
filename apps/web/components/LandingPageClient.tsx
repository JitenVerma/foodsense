"use client";

import Link from "next/link";

import { useAuth } from "../hooks/use-auth";

export function LandingPageClient() {
  const { user, loading } = useAuth();
  const primaryHref = user ? "/dashboard" : "/signup";
  const secondaryHref = user ? "/analyze" : "/login";

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%),radial-gradient(circle_at_right,_rgba(14,165,233,0.14),_transparent_42%)]" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-12 lg:px-10">
        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[36px] border border-white/60 bg-white/85 p-8 shadow-2xl shadow-emerald-100/70 backdrop-blur-sm sm:p-10">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
              FoodSense V2
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Track what you eat every day, starting from a single meal photo.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Analyze meals with Gemini, correct the ingredients, save them to your
              account, and review your daily macros over time.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={primaryHref}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {user ? "Open dashboard" : "Create account"}
              </Link>
              <Link
                href={secondaryHref}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
              >
                {user ? "Analyze a meal" : "Log in"}
              </Link>
              {!loading && user ? (
                <span className="text-sm text-slate-500">
                  Signed in as {user.email}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            {[
              "Save analyzed meals and classify them as breakfast, lunch, dinner, or snack.",
              "View today's meals and running protein, carbs, fat, and calories in one place.",
              "Browse your eating history through daily views and a monthly calendar summary.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[28px] border border-white/60 bg-white/85 p-6 text-sm leading-6 text-slate-700 shadow-lg shadow-slate-200/50 backdrop-blur-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
