import { describe, expect, it } from "vitest";

import { parseMealAnalysisAiResponse } from "../../services/ai/aiResponseParser.js";

describe("aiResponseParser", () => {
  it("parses fenced JSON into validated meal analysis output", () => {
    const result = parseMealAnalysisAiResponse(`\`\`\`json
      {
        "dishCandidates": [{"name": "salmon salad", "confidence": 0.8}],
        "visibleIngredients": [{"name": "salmon", "grams": 150, "confidence": 0.9}],
        "inferredIngredients": [{"name": "olive oil", "grams": 12, "confidence": 0.4}],
        "assumptions": ["Portions estimated visually"],
        "warnings": ["Hidden ingredients are inferred"]
      }
    \`\`\``);

    expect(result.dishCandidates[0]?.name).toBe("salmon salad");
    expect(result.visibleIngredients[0]?.grams).toBe(150);
  });

  it("throws when JSON is invalid", () => {
    expect(() => parseMealAnalysisAiResponse("not valid json")).toThrowError(
      /invalid json/i,
    );
  });
});

