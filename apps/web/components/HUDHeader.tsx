"use client";

import Link from "next/link";

interface HUDHeaderProps {
  playerName: string;
  mealCount: number;
  onSignOut: () => void;
}

export function HUDHeader({
  playerName,
  mealCount,
  onSignOut,
}: HUDHeaderProps) {
  const todayLabel = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date());

  return (
    <header className="arcade-panel-elevated sticky top-4 z-20 rounded-xl px-4 py-4 md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="arcade-label rounded-md border-2 border-[var(--color-border-strong)] bg-[var(--color-brand-primary)] px-3 py-2 text-[var(--color-text-primary)] shadow-[var(--shadow-pixel-sm),var(--shadow-glow-brand)]">
            Food Sense XP
          </div>
          <nav className="flex flex-wrap gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
            <Link className="arcade-button-secondary !min-h-0 !px-3 !py-2" href="/dashboard">
              Dashboard
            </Link>
            <Link className="arcade-button-secondary !min-h-0 !px-3 !py-2" href="/calendar">
              Calendar
            </Link>
            <Link className="arcade-button-secondary !min-h-0 !px-3 !py-2" href="/analyze">
              Add Meal
            </Link>
          </nav>
        </div>

        <div className="grid gap-3 md:grid-cols-[auto_auto] xl:grid-cols-[auto_auto_auto]">
          <div className="arcade-panel rounded-md px-4 py-3">
            <p className="arcade-label text-[var(--color-text-muted)]">Today</p>
            <p className="mt-2 text-sm text-[var(--color-text-primary)]">{todayLabel}</p>
          </div>
          <div className="arcade-panel rounded-md px-4 py-3">
            <p className="arcade-label text-[var(--color-text-muted)]">Quest Log</p>
            <p className="mt-2 text-sm text-[var(--color-text-primary)]">
              {mealCount} meal{mealCount === 1 ? "" : "s"} logged
            </p>
          </div>
          <div className="arcade-panel rounded-md px-4 py-3">
            <p className="arcade-label text-[var(--color-text-muted)]">Player</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-sm text-[var(--color-text-primary)]">{playerName}</p>
              <button
                type="button"
                onClick={onSignOut}
                className="arcade-button-secondary !min-h-0 !px-3 !py-2"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
