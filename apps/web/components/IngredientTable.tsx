import type { Ingredient } from "@foodsense/shared";

import { EditableIngredientRow } from "./EditableIngredientRow";

interface IngredientTableProps {
  title: string;
  description: string;
  ingredients: Ingredient[];
  onNameChange: (ingredientId: string, value: string) => void;
  onGramsChange: (ingredientId: string, value: number) => void;
  onRemove: (ingredientId: string) => void;
  onAdd: () => void;
}

export function IngredientTable({
  title,
  description,
  ingredients,
  onNameChange,
  onGramsChange,
  onRemove,
  onAdd,
}: IngredientTableProps) {
  return (
    <section className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add ingredient
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-[0.2em] text-slate-400">
              <th className="px-4 py-3 font-medium">Ingredient</th>
              <th className="px-4 py-3 font-medium">Grams</th>
              <th className="px-4 py-3 font-medium">Macros</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => (
              <EditableIngredientRow
                key={ingredient.id}
                ingredient={ingredient}
                onNameChange={(value) => onNameChange(ingredient.id, value)}
                onGramsChange={(value) => onGramsChange(ingredient.id, value)}
                onRemove={() => onRemove(ingredient.id)}
              />
            ))}
          </tbody>
        </table>

        {ingredients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No ingredients in this section yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}

