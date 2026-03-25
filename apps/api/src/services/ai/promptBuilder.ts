export function buildMealAnalysisPrompt() {
  return [
    "Analyze the meal image and return strict JSON only.",
    "Tasks:",
    "1. Identify up to 3 likely dish candidates sorted by confidence descending.",
    "2. List only visible ingredients you can directly see.",
    "3. List likely hidden or recipe-common ingredients separately as inferred ingredients.",
    "4. Estimate grams for every ingredient.",
    "5. Provide confidence values from 0 to 1.",
    "6. Include short assumptions and warnings when uncertainty matters.",
    "Rules:",
    "- No markdown fences.",
    "- No explanatory prose outside the JSON object.",
    "- Keep ingredient names concise and food-specific.",
    "- Do not duplicate the same ingredient across visible and inferred lists unless clearly justified.",
    "- Use this JSON shape exactly:",
    JSON.stringify(
      {
        dishCandidates: [
          { name: "dish name", confidence: 0.82 },
          { name: "second dish", confidence: 0.57 },
        ],
        visibleIngredients: [
          {
            name: "ingredient name",
            grams: 120,
            confidence: 0.91,
            notes: "optional note",
          },
        ],
        inferredIngredients: [
          {
            name: "ingredient name",
            grams: 12,
            confidence: 0.58,
            notes: "optional note",
          },
        ],
        assumptions: ["short assumption"],
        warnings: ["short warning"],
      },
      null,
      2,
    ),
  ].join("\n");
}

