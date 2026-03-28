"use client";

import { useEffect, useState } from "react";

import type { QuestProgress, StreakSummary, UserProfile, XpSummary } from "@foodsense/shared";

import { getDailyQuests, getProfile, getStreaks, getWeeklyQuests, getXp } from "../lib/api-client";
import { formatDateKey, getBrowserTimeZone } from "../lib/date-time";
import { getSupabaseBrowserClient } from "../lib/supabase/client";
import { useAuth } from "../hooks/use-auth";
import { AuthRequiredState } from "./AuthRequiredState";
import { ErrorBanner } from "./ErrorBanner";
import { HUDHeader } from "./HUDHeader";

function getPlayerName(profile: UserProfile | null, email: string | undefined) {
  return profile?.name?.trim() || email?.split("@")[0] || "Player One";
}

function QuestList({ title, quests }: { title: string; quests: QuestProgress[] }) {
  return (
    <section className="arcade-panel rounded-xl p-6">
      <p className="arcade-label text-[var(--color-brand-secondary)]">{title}</p>
      <div className="mt-5 grid gap-4">
        {quests.map((quest) => (
          <div key={quest.id} className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg text-[var(--color-text-primary)]">{quest.title}</h2>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{quest.description}</p>
              </div>
              <span className="arcade-label text-[var(--color-brand-highlight)]">{quest.status}</span>
            </div>
            <div className="mt-4 h-3 rounded-full bg-[rgba(255,255,255,0.08)]">
              <div className="h-full rounded-full bg-[var(--color-brand-primary)]" style={{ width: `${quest.completionPercentage}%` }} />
            </div>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              {quest.progressValue}/{quest.targetValue} • +{quest.xpReward} XP
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function QuestsPageClient() {
  const { user, session, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [xp, setXp] = useState<XpSummary | null>(null);
  const [streaks, setStreaks] = useState<StreakSummary | null>(null);
  const [dailyQuests, setDailyQuests] = useState<QuestProgress[]>([]);
  const [weeklyQuests, setWeeklyQuests] = useState<QuestProgress[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      getDailyQuests(session.access_token, date, timeZone),
      getWeeklyQuests(session.access_token, date, timeZone),
    ])
      .then(([nextProfile, nextXp, nextStreaks, nextDailyQuests, nextWeeklyQuests]) => {
        setProfile(nextProfile);
        setXp(nextXp);
        setStreaks(nextStreaks);
        setDailyQuests(nextDailyQuests);
        setWeeklyQuests(nextWeeklyQuests);
        setError(null);
      })
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : "Unable to load quests.");
      });
  }, [session?.access_token]);

  if (loading) {
    return <main className="px-6 py-12 text-[var(--color-text-primary)]">Loading quests...</main>;
  }

  if (!user || !session) {
    return <AuthRequiredState />;
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
      <HUDHeader
        playerName={getPlayerName(profile, user.email)}
        mealCount={0}
        currentLevel={xp?.currentLevel}
        xpIntoCurrentLevel={xp?.xpIntoCurrentLevel}
        xpToNextLevel={xp?.xpToNextLevel}
        loggingStreak={streaks?.loggingCurrentStreak}
        onSignOut={() => void getSupabaseBrowserClient().auth.signOut()}
      />

      <section className="mt-8 space-y-6">
        <div className="arcade-panel-elevated rounded-xl p-6">
          <p className="arcade-label text-[var(--color-brand-highlight)]">Quest Board</p>
          <h1 className="mt-4 text-2xl text-[var(--color-text-primary)]">Daily and weekly objectives</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
            Daily and weekly objectives update automatically as you log meals and hit targets.
          </p>
        </div>

        {error ? <ErrorBanner className="arcade-panel rounded-xl border-[var(--color-error)] bg-[rgba(255,77,109,0.08)] text-[var(--color-text-primary)]" message={error} /> : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <QuestList title="Daily Quests" quests={dailyQuests} />
          <QuestList title="Weekly Quests" quests={weeklyQuests} />
        </div>
      </section>
    </main>
  );
}
