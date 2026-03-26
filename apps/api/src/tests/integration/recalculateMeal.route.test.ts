import { describe, expect, it } from "vitest";

import { buildServer } from "../../app/buildServer.js";

describe("POST /api/v1/meals/recalculate", () => {
  it("recomputes ingredient macros and totals after user edits", async () => {
    const server = await buildServer({
      envOverrides: {
        NODE_ENV: "test",
      },
    });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/meals/recalculate",
      payload: {
        ingredients: [
          {
            id: "ing_chicken",
            name: "chicken breast",
            grams: 150,
            category: "visible",
            confidence: 0.9,
          },
          {
            id: "ing_butter",
            name: "butter",
            grams: 10,
            category: "inferred",
            confidence: 0.5,
            reason: "Found in a high share of matched recipes.",
          },
        ],
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.ingredients).toHaveLength(2);
    expect(body.ingredients[0]?.macros.protein_g).toBe(46.5);
    expect(body.ingredients[1]?.macros.fat_g).toBe(8.1);
    expect(body.macroTotals.calories_kcal).toBeGreaterThan(300);

    await server.close();
  });
});
