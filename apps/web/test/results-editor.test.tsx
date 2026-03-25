import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { MealAnalysisResponse } from "@foodsense/shared";

import { ResultsEditor } from "../components/results/ResultsEditor";

vi.mock("../lib/api-client", () => ({
  recalculateMeal: vi.fn(async (ingredients) => ({
    ingredients,
    macroTotals: {
      protein_g: 39.3,
      carbs_g: 48,
      fat_g: 4.6,
      calories_kcal: 390,
    },
    warnings: [],
  })),
}));

const analysis: MealAnalysisResponse = {
  dishCandidates: [{ name: "chicken rice bowl", confidence: 0.85 }],
  visibleIngredients: [
    {
      id: "ing_chicken",
      name: "chicken breast",
      grams: 120,
      category: "visible",
      confidence: 0.9,
      macros: {
        protein_g: 37.2,
        carbs_g: 0,
        fat_g: 4.3,
        calories_kcal: 198,
      },
      nutritionMatch: "chicken breast",
    },
    {
      id: "ing_rice",
      name: "white rice",
      grams: 120,
      category: "visible",
      confidence: 0.8,
      macros: {
        protein_g: 3.2,
        carbs_g: 33.8,
        fat_g: 0.4,
        calories_kcal: 156,
      },
      nutritionMatch: "white rice",
    },
  ],
  inferredIngredients: [],
  macroTotals: {
    protein_g: 40.4,
    carbs_g: 33.8,
    fat_g: 4.7,
    calories_kcal: 354,
  },
  assumptions: ["Portion sizes estimated visually"],
  warnings: [],
};

describe("ResultsEditor", () => {
  it("updates the macro summary when grams change", async () => {
    const user = userEvent.setup();

    render(<ResultsEditor analysis={analysis} />);

    expect(screen.getByText("40.4g")).toBeInTheDocument();

    const riceInput = screen.getByLabelText("white rice grams");
    await user.clear(riceInput);
    await user.type(riceInput, "180");

    await waitFor(() => {
      expect(screen.getByText("50.7g")).toBeInTheDocument();
      expect(screen.getByText("432 kcal")).toBeInTheDocument();
    });
  });
});
