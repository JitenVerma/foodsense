export function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[32px] bg-slate-950/55 backdrop-blur-sm">
      <div className="rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-900 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="size-3 animate-pulse rounded-full bg-emerald-500" />
          <span>{label}</span>
        </div>
      </div>
    </div>
  );
}

