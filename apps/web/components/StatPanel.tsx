import { MacroProgressBar } from "./MacroProgressBar";
import { cn } from "../lib/cn";

interface StatPanelProps {
  label: string;
  value: string;
  target: string;
  progressValue: number;
  progressTarget: number;
  tone: "protein" | "carbs" | "fat" | "calories";
}

const toneDecorations = {
  protein: "shadow-[var(--shadow-card),var(--shadow-glow-protein)]",
  carbs: "shadow-[var(--shadow-card),var(--shadow-glow-carbs)]",
  fat: "shadow-[var(--shadow-card),var(--shadow-glow-fat)]",
  calories: "shadow-[var(--shadow-card),var(--shadow-glow-calories)]",
};

export function StatPanel({
  label,
  value,
  target,
  progressValue,
  progressTarget,
  tone,
}: StatPanelProps) {
  return (
    <section
      className={cn(
        "arcade-panel rounded-xl p-5",
        toneDecorations[tone],
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="arcade-label text-[var(--color-text-secondary)]">{label}</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--color-text-primary)]">
            {value}
          </p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Target {target}
          </p>
        </div>
        <div className="arcade-label rounded-md border-2 border-[var(--color-border-strong)] bg-[rgba(15,18,38,0.92)] px-3 py-2 text-[var(--color-text-secondary)] shadow-[var(--shadow-pixel-sm)]">
          Stat
        </div>
      </div>

      <div className="mt-5">
        <MacroProgressBar
          value={progressValue}
          target={progressTarget}
          tone={tone}
        />
      </div>
    </section>
  );
}
