import Link from "next/link";
import type { SavedMeal } from "@foodsense/shared";

const mealTypeLabels: Record<SavedMeal["mealType"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function MealInventoryCard({ meal }: { meal: SavedMeal }) {
  return (
    <Link
      href={`/meals/${meal.id}`}
      className="arcade-panel group grid gap-4 rounded-xl p-4 transition-transform duration-150 hover:-translate-y-0.5"
    >
      <div className="grid gap-4 md:grid-cols-[104px_1fr_auto] md:items-center">
        <div className="flex h-[88px] items-center justify-center rounded-lg border-2 border-[var(--color-border-strong)] bg-[linear-gradient(180deg,rgba(124,92,255,0.25),rgba(76,201,255,0.18))] shadow-[var(--shadow-pixel-sm)]">
          <div className="arcade-label text-center text-[var(--color-text-primary)]">
            {mealTypeLabels[meal.mealType]}
          </div>
        </div>

        <div>
          <p className="arcade-label text-[var(--color-brand-highlight)]">
            {mealTypeLabels[meal.mealType]}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            {meal.isFavorite ? (
              <span className="rounded-md border border-[var(--color-brand-accent)] px-2 py-1 text-[var(--color-brand-accent)]">
                Favorite
              </span>
            ) : null}
            {meal.isLibraryTemplate ? (
              <span className="rounded-md border border-[var(--color-brand-secondary)] px-2 py-1 text-[var(--color-brand-secondary)]">
                Template
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">
            {meal.title}
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {new Date(meal.eatenAt).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="grid gap-2 text-sm text-[var(--color-text-secondary)] md:text-right">
          <p>
            <span className="text-[var(--color-protein)]">P:</span> {meal.macroTotals.protein_g}g
          </p>
          <p>
            <span className="text-[var(--color-carbs)]">C:</span> {meal.macroTotals.carbs_g}g
          </p>
          <p>
            <span className="text-[var(--color-fat)]">F:</span> {meal.macroTotals.fat_g}g
          </p>
          <p className="font-semibold text-[var(--color-calories)]">
            {meal.macroTotals.calories_kcal} kcal
          </p>
        </div>
      </div>
    </Link>
  );
}
