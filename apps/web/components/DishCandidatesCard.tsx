import type { DishCandidate } from "@foodsense/shared";

import { ConfidenceBadge } from "./ConfidenceBadge";

export function DishCandidatesCard({
  candidates,
}: {
  candidates: DishCandidate[];
}) {
  return (
    <section className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-600">
            Dish Candidates
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            What this meal most likely is
          </h2>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {candidates.map((candidate, index) => (
          <div
            key={`${candidate.name}-${index}`}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Option {index + 1}
              </p>
              <p className="mt-1 text-base font-medium text-slate-900">
                {candidate.name}
              </p>
            </div>
            <ConfidenceBadge confidence={candidate.confidence} />
          </div>
        ))}
      </div>
    </section>
  );
}

