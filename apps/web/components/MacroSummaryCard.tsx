import type { MacroTotals } from "@foodsense/shared";

export function MacroSummaryCard({ totals }: { totals: MacroTotals }) {
  const cards = [
    { label: "Protein", value: `${totals.protein_g}g`, accent: "from-emerald-400 to-emerald-500" },
    { label: "Carbs", value: `${totals.carbs_g}g`, accent: "from-sky-400 to-cyan-500" },
    { label: "Fat", value: `${totals.fat_g}g`, accent: "from-amber-400 to-orange-500" },
    {
      label: "Calories",
      value: `${totals.calories_kcal} kcal`,
      accent: "from-slate-700 to-slate-900",
    },
  ];

  return (
    <section className="rounded-[28px] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/15">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/80">
            Macro Summary
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Estimated meal totals</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div
              className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${card.accent}`}
            />
            <p className="text-sm text-slate-300">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

