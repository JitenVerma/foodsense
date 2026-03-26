import type { SavedMeal } from "@foodsense/shared";

import { MealInventoryCard } from "./MealInventoryCard";

export function MealGroupSection({
  title,
  meals,
}: {
  title: string;
  meals: SavedMeal[];
}) {
  if (meals.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="arcade-label text-[var(--color-brand-secondary)]">{title}</p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {meals.length} item{meals.length === 1 ? "" : "s"} in inventory
          </p>
        </div>
        <div className="h-[2px] flex-1 bg-[linear-gradient(90deg,var(--color-brand-secondary),transparent)]" />
      </div>

      <div className="space-y-3">
        {meals.map((meal) => (
          <MealInventoryCard key={meal.id} meal={meal} />
        ))}
      </div>
    </section>
  );
}
