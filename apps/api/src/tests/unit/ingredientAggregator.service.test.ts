import { describe, expect, it } from "vitest";

import { createIngredientAggregatorService } from "../../services/recipe/ingredientAggregator.service.js";

describe("ingredientAggregatorService", () => {
  it("counts ingredient frequency across normalized recipe ingredient lists", () => {
    const service = createIngredientAggregatorService();

    const result = service.aggregate({
      normalizedRecipeIngredients: [
        ["chicken", "butter", "garlic", "cream"],
        ["chicken", "butter", "tomato sauce"],
        ["chicken", "garlic", "tomato sauce"],
      ],
    });

    expect(result[0]).toEqual({
      name: "chicken",
      recipeCount: 3,
      frequency: 1,
    });
    expect(result.find((ingredient) => ingredient.name === "butter")).toEqual({
      name: "butter",
      recipeCount: 2,
      frequency: 0.67,
    });
  });
});

