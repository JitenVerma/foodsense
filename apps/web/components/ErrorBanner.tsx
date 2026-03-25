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
        "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm",
        className,
      )}
    >
      {message}
    </div>
  );
}

