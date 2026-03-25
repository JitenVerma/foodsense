import { buildMealAnalysisPrompt } from "./promptBuilder.js";
import { AiProviderError, ConfigurationError } from "../../lib/errors.js";

export interface MealAnalyzerService {
  analyzeMealImage(input: {
    mimeType: string;
    base64Image: string;
  }): Promise<unknown>;
}

interface GeminiMealAnalyzerOptions {
  apiKey?: string;
  model: string;
}

export function createGeminiMealAnalyzerService(
  options: GeminiMealAnalyzerOptions,
): MealAnalyzerService {
  const apiKey = options.apiKey;

  if (!apiKey) {
    throw new ConfigurationError(
      "GOOGLE_GENAI_API_KEY is required unless development fallback is enabled.",
    );
  }

  return {
    async analyzeMealImage({ mimeType, base64Image }) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: buildMealAnalysisPrompt() },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseJsonSchema: {
                type: "object",
                required: [
                  "dishCandidates",
                  "visibleIngredients",
                  "inferredIngredients",
                  "assumptions",
                  "warnings",
                ],
                properties: {
                  dishCandidates: {
                    type: "array",
                    maxItems: 3,
                    items: {
                      type: "object",
                      required: ["name", "confidence"],
                      properties: {
                        name: { type: "string" },
                        confidence: { type: "number" },
                      },
                    },
                  },
                  visibleIngredients: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["name", "grams", "confidence"],
                      properties: {
                        name: { type: "string" },
                        grams: { type: "number" },
                        confidence: { type: "number" },
                        notes: { type: "string" },
                      },
                    },
                  },
                  inferredIngredients: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["name", "grams", "confidence"],
                      properties: {
                        name: { type: "string" },
                        grams: { type: "number" },
                        confidence: { type: "number" },
                        notes: { type: "string" },
                      },
                    },
                  },
                  assumptions: {
                    type: "array",
                    items: { type: "string" },
                  },
                  warnings: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          }),
        },
      );

      if (!response.ok) {
        const responseText = await response.text();
        throw new AiProviderError(
          `Gemini request failed with ${response.status}: ${responseText}`,
        );
      }

      const payload = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{
              text?: string;
            }>;
          };
        }>;
      };

      const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new AiProviderError("Gemini returned no text candidate.");
      }

      return text;
    },
  };
}

const devFallbackTemplates = [
  {
    dishCandidates: [
      { name: "grilled chicken rice bowl", confidence: 0.71 },
      { name: "teriyaki chicken bowl", confidence: 0.52 },
      { name: "protein meal prep bowl", confidence: 0.41 },
    ],
    visibleIngredients: [
      { name: "chicken breast", grams: 160, confidence: 0.84 },
      { name: "white rice", grams: 180, confidence: 0.77 },
      { name: "cucumber", grams: 35, confidence: 0.62 },
      { name: "tomato", grams: 40, confidence: 0.58 },
    ],
    inferredIngredients: [
      { name: "olive oil", grams: 10, confidence: 0.46, notes: "Likely used in cooking." },
      { name: "garlic", grams: 6, confidence: 0.33, notes: "Common in seasoned chicken bowls." },
    ],
    assumptions: ["Development fallback analysis was used because no Gemini API key was configured."],
    warnings: [
      "This estimate did not use live Gemini vision analysis.",
      "Portion size and dish recognition are approximate in fallback mode.",
    ],
  },
  {
    dishCandidates: [
      { name: "salmon salad", confidence: 0.69 },
      { name: "grilled salmon bowl", confidence: 0.5 },
      { name: "protein salad plate", confidence: 0.43 },
    ],
    visibleIngredients: [
      { name: "salmon", grams: 150, confidence: 0.8 },
      { name: "lettuce", grams: 70, confidence: 0.74 },
      { name: "tomato", grams: 45, confidence: 0.63 },
      { name: "avocado", grams: 50, confidence: 0.49 },
    ],
    inferredIngredients: [
      { name: "olive oil", grams: 12, confidence: 0.51, notes: "Likely dressing component." },
      { name: "onion", grams: 18, confidence: 0.34, notes: "Frequently present in salad mixes." },
    ],
    assumptions: ["Development fallback analysis was used because no Gemini API key was configured."],
    warnings: [
      "This estimate did not use live Gemini vision analysis.",
      "Dressings and hidden fats may differ significantly.",
    ],
  },
  {
    dishCandidates: [
      { name: "creamy pasta", confidence: 0.65 },
      { name: "chicken pasta", confidence: 0.48 },
      { name: "pasta primavera", confidence: 0.37 },
    ],
    visibleIngredients: [
      { name: "pasta", grams: 220, confidence: 0.82 },
      { name: "cheddar cheese", grams: 28, confidence: 0.44 },
      { name: "tomato sauce", grams: 95, confidence: 0.53 },
    ],
    inferredIngredients: [
      { name: "cream", grams: 30, confidence: 0.49, notes: "Creamy pasta sauces often include cream." },
      { name: "butter", grams: 10, confidence: 0.39, notes: "Common finishing fat in pasta dishes." },
    ],
    assumptions: ["Development fallback analysis was used because no Gemini API key was configured."],
    warnings: [
      "This estimate did not use live Gemini vision analysis.",
      "Sauces and oils may be under- or over-estimated.",
    ],
  },
];

export function createDevelopmentMealAnalyzerService(): MealAnalyzerService {
  return {
    async analyzeMealImage({ base64Image }) {
      const index = base64Image.length % devFallbackTemplates.length;
      return devFallbackTemplates[index];
    },
  };
}
