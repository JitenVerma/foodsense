import Link from "next/link";
import type { QuestProgress } from "@foodsense/shared";

interface QuestPanelProps {
  playerName: string;
  mealCount: number;
  calories: number;
  proteinProgress: number;
  dailyQuests?: QuestProgress[];
  currentLevel?: number;
  todayXp?: number;
  loggingStreak?: number;
}

export function QuestPanel({
  playerName,
  mealCount,
  calories,
  proteinProgress,
  dailyQuests = [],
  currentLevel = 1,
  todayXp = 0,
  loggingStreak = 0,
}: QuestPanelProps) {
  const greeting = new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    hour12: false,
  }).format(new Date());
  const currentHour = Number.parseInt(greeting, 10);
  const greetingCopy =
    currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <aside className="arcade-panel-elevated rounded-xl p-5">
      <p className="arcade-label text-[var(--color-brand-highlight)]">Quest Log</p>
      <h2 className="mt-4 text-xl leading-snug text-[var(--color-text-primary)]">
        {greetingCopy}, {playerName}
      </h2>
      <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
        You&apos;ve logged {mealCount} meal{mealCount === 1 ? "" : "s"} today and banked {calories} kcal so far.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="arcade-panel rounded-md px-3 py-3">
          <p className="arcade-label text-[var(--color-text-muted)]">Level</p>
          <p className="mt-2 text-sm text-[var(--color-text-primary)]">Lv {currentLevel}</p>
        </div>
        <div className="arcade-panel rounded-md px-3 py-3">
          <p className="arcade-label text-[var(--color-text-muted)]">Today XP</p>
          <p className="mt-2 text-sm text-[var(--color-text-primary)]">+{todayXp}</p>
        </div>
        <div className="arcade-panel rounded-md px-3 py-3">
          <p className="arcade-label text-[var(--color-text-muted)]">Streak</p>
          <p className="mt-2 text-sm text-[var(--color-text-primary)]">{loggingStreak} days</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Link href="/analyze" className="arcade-button-primary w-full">
          Add meal
        </Link>
        <Link href="/calendar" className="arcade-button-secondary w-full">
          Open calendar
        </Link>
      </div>

      <div className="mt-6 space-y-3 rounded-lg border-2 border-[var(--color-border-subtle)] bg-[rgba(15,18,38,0.78)] p-4 shadow-[var(--shadow-pixel-sm)]">
        <p className="arcade-label text-[var(--color-text-muted)]">Mission Feed</p>
        <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
          {dailyQuests.length > 0 ? (
            dailyQuests.map((quest) => (
              <div
                key={quest.id}
                className="rounded-md border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.03)] px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[var(--color-text-primary)]">{quest.title}</p>
                  <span className="arcade-label text-[var(--color-brand-highlight)]">
                    {quest.completionPercentage}%
                  </span>
                </div>
                <p className="mt-2">{quest.description}</p>
                <p className="mt-2 text-xs">
                  {quest.progressValue}/{quest.targetValue} complete • +{quest.xpReward} XP
                </p>
              </div>
            ))
          ) : (
            <>
              <p>Track protein progress toward your daily target.</p>
              <p>{proteinProgress}% of your protein mission is complete.</p>
              <p>Review meal history and clean up any inferred items that look off.</p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
