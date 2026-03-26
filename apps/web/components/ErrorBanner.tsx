import { cn } from "../lib/cn";

export function ErrorBanner({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-[var(--color-error)] bg-[rgba(255,77,109,0.1)] px-4 py-3 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-pixel-sm)]",
        className,
      )}
    >
      {message}
    </div>
  );
}
