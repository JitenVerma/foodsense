"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { CalendarMonthResponse } from "@foodsense/shared";

import { getCalendarMonth } from "../lib/api-client";
import { formatMonthKey, getBrowserTimeZone } from "../lib/date-time";
import { useAuth } from "../hooks/use-auth";
import { AuthRequiredState } from "./AuthRequiredState";
import { ErrorBanner } from "./ErrorBanner";

function getMonthKey(date: Date) {
  return formatMonthKey(date);
}

function buildCalendarDays(month: string) {
  const firstDay = new Date(`${month}-01T00:00:00.000Z`);
  const year = firstDay.getUTCFullYear();
  const monthIndex = firstDay.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return `${month}-${String(day).padStart(2, "0")}`;
  });
}

export function CalendarPageClient() {
  const { user, session, loading } = useAuth();
  const [month, setMonth] = useState(getMonthKey(new Date()));
  const [response, setResponse] = useState<CalendarMonthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    getCalendarMonth(month, session.access_token, getBrowserTimeZone())
      .then((nextResponse) => {
        setResponse(nextResponse);
        setError(null);
      })
      .catch((nextError) => {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load calendar data.",
        );
      });
  }, [month, session?.access_token]);

  const summariesByDate = useMemo(
    () =>
      new Map(
        (response?.days ?? []).map((day) => [
          day.date,
          day,
        ]),
      ),
    [response?.days],
  );

  if (loading) {
    return <main className="px-6 py-12">Loading calendar...</main>;
  }

  if (!user || !session) {
    return <AuthRequiredState />;
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
            Calendar
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            Meal history by day
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Review which days you logged meals and jump into any date for details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400"
          />
          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Back to dashboard
          </Link>
        </div>
      </div>

      {error ? <ErrorBanner className="mb-6" message={error} /> : null}

      <section className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {buildCalendarDays(month).map((date) => {
            const summary = summariesByDate.get(date);
            return (
              <Link
                key={date}
                href={`/day/${date}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50/60"
              >
                <p className="text-sm font-semibold text-slate-950">
                  {date.slice(-2)}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  {summary?.mealCount ?? 0} meals
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {summary?.macroTotals.calories_kcal ?? 0} kcal
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
