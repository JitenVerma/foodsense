import type { Ingredient } from "@foodsense/shared";

import { ConfidenceBadge } from "./ConfidenceBadge";

interface EditableIngredientRowProps {
  ingredient: Ingredient;
  onNameChange: (value: string) => void;
  onGramsChange: (value: number) => void;
  onRemove: () => void;
}

export function EditableIngredientRow({
  ingredient,
  onNameChange,
  onGramsChange,
  onRemove,
}: EditableIngredientRowProps) {
  return (
    <tr className="border-t border-slate-200 align-top">
      <td className="px-4 py-4">
        <input
          aria-label={`${ingredient.category} ingredient name`}
          value={ingredient.name}
          onChange={(event) => onNameChange(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
        {ingredient.notes ? (
          <p className="mt-2 text-xs leading-5 text-slate-500">{ingredient.notes}</p>
        ) : null}
      </td>
      <td className="px-4 py-4">
        <input
          aria-label={`${ingredient.name} grams`}
          type="number"
          min={0}
          step={1}
          value={ingredient.grams}
          onChange={(event) => onGramsChange(Number(event.target.value))}
          className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </td>
      <td className="px-4 py-4">
        <div className="space-y-1 text-sm text-slate-700">
          <p>{ingredient.macros?.protein_g ?? 0}g protein</p>
          <p>{ingredient.macros?.carbs_g ?? 0}g carbs</p>
          <p>{ingredient.macros?.fat_g ?? 0}g fat</p>
          <p>{ingredient.macros?.calories_kcal ?? 0} kcal</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <ConfidenceBadge confidence={ingredient.confidence} />
      </td>
      <td className="px-4 py-4 text-right">
        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

