import { cn } from "../lib/cn";

interface MacroProgressBarProps {
  value: number;
  target: number;
  tone: "protein" | "carbs" | "fat" | "calories";
}

const toneClasses = {
  protein: "bg-[var(--color-protein)] shadow-[var(--shadow-glow-protein)]",
  carbs: "bg-[var(--color-carbs)] shadow-[var(--shadow-glow-carbs)]",
  fat: "bg-[var(--color-fat)] shadow-[var(--shadow-glow-fat)]",
  calories: "bg-[var(--color-calories)] shadow-[var(--shadow-glow-calories)]",
};

export function MacroProgressBar({
  value,
  target,
  tone,
}: MacroProgressBarProps) {
  const progress = Math.max(0, Math.min(100, Math.round((value / target) * 100)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="arcade-panel h-4 overflow-hidden rounded-[4px] border-[var(--color-border-subtle)] bg-[rgba(15,18,38,0.95)] p-[2px] shadow-[var(--shadow-pixel-sm)]">
        <div
          className={cn(
            "h-full rounded-[2px] transition-[width] duration-300 ease-out",
            toneClasses[tone],
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
