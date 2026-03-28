"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { SavedMeal, StreakSummary, UserProfile, XpSummary } from "@foodsense/shared";

import { deleteMeal, getProfile, getStreaks, getXp, listMeals, saveMeal, updateMeal } from "../lib/api-client";
import { formatDateKey, getBrowserTimeZone } from "../lib/date-time";
import { getSupabaseBrowserClient } from "../lib/supabase/client";
import { useAuth } from "../hooks/use-auth";
import { AuthRequiredState } from "./AuthRequiredState";
import { ErrorBanner } from "./ErrorBanner";
import { HUDHeader } from "./HUDHeader";

function getPlayerName(profile: UserProfile | null, email: string | undefined) {
  return profile?.name?.trim() || email?.split("@")[0] || "Player One";
}

export function LibraryPageClient() {
  const router = useRouter();
  const { user, session, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [xp, setXp] = useState<XpSummary | null>(null);
  const [streaks, setStreaks] = useState<StreakSummary | null>(null);
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyMealId, setBusyMealId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const date = formatDateKey(new Date());
    const timeZone = getBrowserTimeZone();
    Promise.all([
      getProfile(session.access_token),
      getXp(session.access_token, date, timeZone),
      getStreaks(session.access_token, date, timeZone),
      listMeals(session.access_token),
    ])
      .then(([nextProfile, nextXp, nextStreaks, nextMeals]) => {
        setProfile(nextProfile);
        setXp(nextXp);
        setStreaks(nextStreaks);
        setMeals(nextMeals);
        setError(null);
      })
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : "Unable to load the meal library.");
      });
  }, [session?.access_token]);

  const filteredMeals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return meals.filter((meal) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        meal.title.toLowerCase().includes(normalizedQuery) ||
        meal.ingredients.some((ingredient) =>
          ingredient.name.toLowerCase().includes(normalizedQuery),
        )
      );
    });
  }, [meals, query]);

  async function handleToggle(meal: SavedMeal, field: "isFavorite" | "isLibraryTemplate") {
    if (!session?.access_token) {
      return;
    }

    try {
      setBusyMealId(meal.id);
      const updated = await updateMeal(
        meal.id,
        {
          [field]: !meal[field],
        },
        session.access_token,
      );
      setMeals((current) => current.map((item) => (item.id === meal.id ? updated : item)));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to update meal flags.");
    } finally {
      setBusyMealId(null);
    }
  }

  async function handleReuse(meal: SavedMeal) {
    if (!session?.access_token) {
      return;
    }

    try {
      setBusyMealId(meal.id);
      const duplicated = await saveMeal(
        {
          title: meal.title,
          mealType: meal.mealType,
          eatenAt: new Date().toISOString(),
          imageUrl: meal.imageUrl,
          ingredients: meal.ingredients,
          assumptions: meal.assumptions,
          warnings: meal.warnings,
          sourceMealId: meal.id,
          isFavorite: false,
          isLibraryTemplate: false,
        },
        session.access_token,
      );
      router.push(`/meals/${duplicated.id}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to reuse this meal.");
    } finally {
      setBusyMealId(null);
    }
  }

  async function handleDelete(mealId: string) {
    if (!session?.access_token) {
      return;
    }

    try {
      setBusyMealId(mealId);
      await deleteMeal(mealId, session.access_token);
      setMeals((current) => current.filter((meal) => meal.id !== mealId));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to delete meal.");
    } finally {
      setBusyMealId(null);
    }
  }

  if (loading) {
    return <main className="px-6 py-12 text-[var(--color-text-primary)]">Loading library...</main>;
  }

  if (!user || !session) {
    return <AuthRequiredState />;
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
      <HUDHeader
        playerName={getPlayerName(profile, user.email)}
        mealCount={filteredMeals.length}
        currentLevel={xp?.currentLevel}
        xpIntoCurrentLevel={xp?.xpIntoCurrentLevel}
        xpToNextLevel={xp?.xpToNextLevel}
        loggingStreak={streaks?.loggingCurrentStreak}
        onSignOut={() => void getSupabaseBrowserClient().auth.signOut()}
      />

      <section className="mt-8 space-y-6">
        <div className="arcade-panel-elevated rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="arcade-label text-[var(--color-brand-highlight)]">Meal Library</p>
              <h1 className="mt-4 text-2xl text-[var(--color-text-primary)]">Reuse and favorite your strongest meals</h1>
            </div>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meals or ingredients" className="arcade-input min-w-[280px] rounded-lg px-4 py-3" />
          </div>
        </div>

        {error ? <ErrorBanner className="arcade-panel rounded-xl border-[var(--color-error)] bg-[rgba(255,77,109,0.08)] text-[var(--color-text-primary)]" message={error} /> : null}

        <div className="grid gap-4">
          {filteredMeals.map((meal) => (
            <div key={meal.id} className="arcade-panel rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    {meal.isFavorite ? <span className="arcade-label text-[var(--color-brand-accent)]">Favorite</span> : null}
                    {meal.isLibraryTemplate ? <span className="arcade-label text-[var(--color-brand-secondary)]">Template</span> : null}
                  </div>
                  <h2 className="mt-2 text-xl text-[var(--color-text-primary)]">{meal.title}</h2>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    {meal.mealType} • {meal.ingredients.length} ingredients • {meal.macroTotals.calories_kcal} kcal
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => void handleToggle(meal, "isFavorite")} disabled={busyMealId === meal.id} className="arcade-button-secondary">
                    {meal.isFavorite ? "Unfavorite" : "Favorite"}
                  </button>
                  <button type="button" onClick={() => void handleToggle(meal, "isLibraryTemplate")} disabled={busyMealId === meal.id} className="arcade-button-secondary">
                    {meal.isLibraryTemplate ? "Unset template" : "Save template"}
                  </button>
                  <button type="button" onClick={() => void handleReuse(meal)} disabled={busyMealId === meal.id} className="arcade-button-primary">
                    Reuse
                  </button>
                  <Link href={`/meals/${meal.id}`} className="arcade-button-secondary">
                    Edit
                  </Link>
                  <button type="button" onClick={() => void handleDelete(meal.id)} disabled={busyMealId === meal.id} className="arcade-button-secondary">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
