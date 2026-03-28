"use client";

import { useId } from "react";

interface InfoTooltipProps {
  label: string;
  title: string;
  description: string;
  detail?: string;
  className?: string;
}

export function InfoTooltip({
  label,
  title,
  description,
  detail,
  className,
}: InfoTooltipProps) {
  const descriptionId = useId();

  return (
    <span className={`group relative inline-flex ${className ?? ""}`.trim()}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={descriptionId}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.04)] text-[11px] font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-brand-highlight)] hover:text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-highlight)]"
      >
        i
      </button>
      <span
        id={descriptionId}
        role="tooltip"
        className="pointer-events-none absolute right-0 top-7 z-20 hidden w-72 rounded-xl border border-[var(--color-border-subtle)] bg-[rgba(8,12,28,0.96)] p-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.35)] group-hover:block group-focus-within:block"
      >
        <span className="block text-sm font-semibold text-[var(--color-text-primary)]">
          {title}
        </span>
        <span className="mt-2 block text-xs leading-6 text-[var(--color-text-secondary)]">
          {description}
        </span>
        {detail ? (
          <span className="mt-2 block text-xs leading-6 text-[var(--color-text-muted)]">
            {detail}
          </span>
        ) : null}
      </span>
    </span>
  );
}
