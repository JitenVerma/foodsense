import { describe, expect, it } from "vitest";

import { buildServer } from "../../app/buildServer.js";

describe("POST /api/v1/meals/analyze", () => {
  it("accepts a multipart upload and returns normalized meal analysis", async () => {
    const server = await buildServer({
      envOverrides: {
        NODE_ENV: "test",
        ALLOW_DEV_ANALYSIS_FALLBACK: "false",
      },
      mealAnalyzer: {
        async analyzeMealImage() {
          return {
            dishCandidates: [{ name: "grilled chicken rice bowl", confidence: 0.88 }],
            visibleIngredients: [
              { name: "chicken breast", grams: 150, confidence: 0.93 },
              { name: "white rice", grams: 180, confidence: 0.82 },
            ],
            inferredIngredients: [
              {
                name: "olive oil",
                grams: 9,
                confidence: 0.42,
                notes: "Likely used during cooking.",
              },
            ],
            assumptions: ["Portions estimated visually"],
            warnings: ["Sauces may change totals"],
          };
        },
      },
    });

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/meals/analyze",
      headers: {
        "content-type": "multipart/form-data; boundary=----foodsense",
      },
      payload:
        "------foodsense\r\n" +
        'Content-Disposition: form-data; name="file"; filename="meal.jpg"\r\n' +
        "Content-Type: image/jpeg\r\n\r\n" +
        "fake-image-binary\r\n" +
        "------foodsense--\r\n",
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.dishCandidates).toHaveLength(1);
    expect(body.visibleIngredients).toHaveLength(2);
    expect(body.inferredIngredients).toHaveLength(2);
    expect(body.macroTotals.calories_kcal).toBeGreaterThan(0);

    await server.close();
  });
});
