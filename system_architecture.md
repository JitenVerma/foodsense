# FoodSense System Architecture

## Monorepo

- `apps/web`: Next.js upload and results UI
- `apps/api`: Fastify API for meal analysis and recalculation
- `packages/shared`: shared schemas, constants, and types

## Main request flow

`web upload` -> `POST /api/v1/meals/analyze` -> `image validation/preprocessing` -> `Gemini analysis` -> `AI response parsing + zod validation` -> `nutrition lookup` -> `macro aggregation` -> `normalized response` -> `editable results UI`

## Backend service boundaries

- `services/ai/geminiMealAnalyzer.service.ts`
  - calls Gemini and requests strict JSON output
- `services/ai/aiResponseParser.ts`
  - sanitizes and validates model output
- `services/storage/imagePreprocessor.service.ts`
  - validates size/type and converts images to base64
- `services/nutrition/nutritionLookup.service.ts`
  - maps ingredient names to the local nutrition dataset
- `services/nutrition/macroCalculator.service.ts`
  - calculates ingredient and meal totals
- `services/meal/ingredientInference.service.ts`
  - adds simple rule-based inferred ingredients from dish patterns
- `services/meal/mealAnalysisOrchestrator.service.ts`
  - coordinates the full analysis pipeline
- `services/meal/mealRecalculation.service.ts`
  - recalculates totals after user edits

## Frontend flow

- Home page validates the file locally before upload
- Successful analysis is stored in session storage and opened on `/results`
- Results page allows editing ingredient names and grams
- Macro totals update immediately on the client
- A debounced backend recalculation keeps nutrition matches and totals in sync
- Users can save the current analysis to local browser storage

## Validation strategy

- Shared `zod` schemas live in `packages/shared`
- API validates edited payloads and AI output
- Web validates API responses before using them

## Replaceable infrastructure

- Gemini model id is env-configured
- Nutrition lookup is behind a service boundary and can be swapped for USDA or another provider later
- Development fallback analysis is isolated behind the meal analyzer service
