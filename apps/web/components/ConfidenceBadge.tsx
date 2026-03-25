import { cn } from "../lib/cn";

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  const tone =
    confidence >= 0.75
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : confidence >= 0.5
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        tone,
      )}
    >
      {percentage}% confidence
    </span>
  );
}

