import Link from "next/link";

interface QuestPanelProps {
  playerName: string;
  mealCount: number;
  calories: number;
  proteinProgress: number;
}

export function QuestPanel({
  playerName,
  mealCount,
  calories,
  proteinProgress,
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
        <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <p>Track protein progress toward your daily target.</p>
          <p>{proteinProgress}% of your protein mission is complete.</p>
          <p>Review meal history and clean up any inferred items that look off.</p>
        </div>
      </div>
    </aside>
  );
}
