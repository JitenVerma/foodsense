Backend Structure and Service Layer
Goals of the backend

The backend should do 5 things well:

accept and validate meal image uploads
send the image to Gemini for analysis
normalize and validate the AI response
calculate ingredient-level and meal-level macros
return a clean response the frontend can trust

The main principle is:

AI should be treated like an untrusted upstream dependency.

So the backend must always:

validate input
constrain prompts
parse structured JSON
validate output with schemas
normalize before returning
Recommended folder structure
/apps/api
  /src
    /app
      buildServer.ts
      plugins.ts
    /config
      env.ts
    /routes
      health.routes.ts
      meals.routes.ts
    /controllers
      meals.controller.ts
    /services
      /ai
        geminiMealAnalyzer.service.ts
        promptBuilder.ts
        aiResponseParser.ts
      /nutrition
        nutritionLookup.service.ts
        macroCalculator.service.ts
      /meal
        mealAnalysisOrchestrator.service.ts
        mealRecalculation.service.ts
        ingredientInference.service.ts
      /storage
        imagePreprocessor.service.ts
    /schemas
      meal.schemas.ts
      common.schemas.ts
    /repositories
      nutrition.repository.ts
    /lib
      logger.ts
      errors.ts
      result.ts
    /utils
      ids.ts
      math.ts
      image.ts
    /types
      fastify.d.ts
    /data
      nutrition-reference.json
    /tests
      unit
      integration
    server.ts
What each folder does
/app

Holds Fastify bootstrapping logic.

buildServer.ts

Creates and configures the Fastify app.

Responsibilities:

instantiate Fastify
register plugins
register routes
register error handler
return server instance
plugins.ts

Registers shared plugins such as:

multipart upload support
CORS
sensible defaults
request logging
/config

Centralized environment handling.

env.ts

Loads and validates env vars.

Examples:

PORT
NODE_ENV
GOOGLE_GENAI_API_KEY
MAX_UPLOAD_SIZE_MB

Use zod here so startup fails fast if config is wrong.

/routes

Defines route registration only.

health.routes.ts

Registers:

GET /api/v1/health
meals.routes.ts

Registers:

POST /api/v1/meals/analyze
POST /api/v1/meals/recalculate

These files should stay thin. No business logic.

/controllers

Controllers translate HTTP requests into service calls.

meals.controller.ts

Responsibilities:

parse request body / file
call orchestrator service
map service result to HTTP response
translate thrown errors into clean responses

Think of controllers as the boundary between transport and business logic.

/services

This is the real core of the backend.

Split by domain so it stays clean.

Service Layer Design
1. AI services
/services/ai/geminiMealAnalyzer.service.ts

This service is responsible for calling Gemini.

Responsibilities
accept preprocessed image input
build Gemini request
call Gemini API
request structured JSON output
return raw model output
It should NOT:
calculate macros
make HTTP response decisions
own nutrition logic
Suggested interface
export interface GeminiMealAnalyzerService {
  analyzeMealImage(input: {
    mimeType: string;
    base64Image: string;
  }): Promise<unknown>;
}

This returns raw or semi-raw structured output that still needs parsing.

/services/ai/promptBuilder.ts

Builds the prompt used for Gemini.

Responsibilities
define system instruction
define output schema expectations
define food-analysis rules
keep prompting reusable and testable
Prompt should ask for:
top dish candidates
visible ingredients
inferred ingredients
estimated grams
confidence
assumptions/warnings

This file should be pure and deterministic.

/services/ai/aiResponseParser.ts

This is critical.

Responsibilities
safely parse Gemini output
strip bad formatting if needed
validate against zod schema
normalize field names
reject malformed AI output

This protects the rest of your app from weird model responses.

Suggested interface
export function parseMealAnalysisAiResponse(raw: unknown): ParsedMealAiOutput
2. Nutrition services
/services/nutrition/nutritionLookup.service.ts

This service maps ingredient names to nutrition data.

Responsibilities
lookup macros per 100g
normalize ingredient names
support fallback matching
return nutrition profile for a known ingredient
Example

Input:

"grilled chicken"
"chicken breast"

Normalized to:

"chicken"
Suggested interface
export interface NutritionLookupService {
  findIngredientNutrition(name: string): Promise<{
    canonicalName: string;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    caloriesPer100g: number;
  } | null>;
}
/services/nutrition/macroCalculator.service.ts

This service calculates macros from grams + nutrition references.

Responsibilities
compute ingredient-level macros
aggregate meal totals
handle missing data gracefully
round values consistently
Suggested interface
export interface MacroCalculatorService {
  calculateIngredientMacros(input: {
    grams: number;
    nutritionPer100g: {
      proteinPer100g: number;
      carbsPer100g: number;
      fatPer100g: number;
      caloriesPer100g: number;
    };
  }): {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    calories_kcal: number;
  };

  sumMacros(items: Array<{
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    calories_kcal: number;
  }>): {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    calories_kcal: number;
  };
}
3. Meal domain services
/services/meal/mealAnalysisOrchestrator.service.ts

This is the most important service.

It coordinates the full meal analysis flow.

Responsibilities
preprocess image
call Gemini
parse AI output
optionally enrich inferred ingredients
lookup nutrition data
calculate ingredient-level macros
sum totals
return final API response

This is your application service.

Suggested interface
export interface MealAnalysisOrchestratorService {
  analyze(input: {
    mimeType: string;
    imageBuffer: Buffer;
  }): Promise<MealAnalysisResponse>;
}
Why this service exists

Without it, controllers become messy and services call each other ad hoc.

This service gives you:

one entry point
clean orchestration
easier testing
/services/meal/mealRecalculation.service.ts

Handles recomputing macros when the frontend sends edited ingredients.

Responsibilities
accept user-edited ingredients
re-run nutrition lookup
re-run macro calculations
return updated totals
Suggested interface
export interface MealRecalculationService {
  recalculate(input: {
    ingredients: IngredientInput[];
  }): Promise<MealRecalculationResponse>;
}

This powers:

changing grams
deleting inferred ingredients
adding visible ingredients manually
/services/meal/ingredientInference.service.ts

Optional for v1, but useful as a separate module.

Responsibilities
enrich inferred ingredients from detected dish candidates
add hidden ingredients commonly associated with dish type
keep inference rules explicit

Example:

butter chicken → butter, cream, tomato sauce, onion, garlic, oil
caesar salad → dressing, parmesan, croutons

This can start rule-based in v1 instead of being AI-driven again.

That’s a smart design because:

it is cheaper
more predictable
easier to test
4. Image processing service
/services/storage/imagePreprocessor.service.ts

Despite the folder name, this is really an image preparation utility service.

Responsibilities
validate mime type
validate size
compress or resize if needed
convert buffer to base64 for Gemini
return normalized image payload
Suggested interface
export interface ImagePreprocessorService {
  preprocess(input: {
    buffer: Buffer;
    mimeType: string;
  }): Promise<{
    mimeType: string;
    base64Image: string;
  }>;
}
Request flow

Here’s the exact backend flow for POST /api/v1/meals/analyze:

Route
→ Controller
→ MealAnalysisOrchestratorService
   → ImagePreprocessorService
   → GeminiMealAnalyzerService
   → AIResponseParser
   → IngredientInferenceService (optional/rule-based enrichment)
   → NutritionLookupService
   → MacroCalculatorService
→ normalized response
→ Controller returns HTTP response

That separation is ideal.

Controller design
meals.controller.ts

You likely want two controller methods:

analyzeMeal

Flow:

read multipart image
validate file exists
pass buffer + mime type to orchestrator
return result
recalculateMeal

Flow:

validate ingredient array
pass to recalculation service
return updated totals

Controllers should stay very thin.

Example shape:

export class MealsController {
  constructor(
    private readonly mealAnalysisOrchestrator: MealAnalysisOrchestratorService,
    private readonly mealRecalculationService: MealRecalculationService,
  ) {}

  async analyzeMeal(req, reply) {}
  async recalculateMeal(req, reply) {}
}
Schema design
/schemas/meal.schemas.ts

Put your request/response zod schemas here.

Recommended schemas:

Request schemas
AnalyzeMealRequestSchema
RecalculateMealRequestSchema
Response schemas
DishCandidateSchema
IngredientSchema
MacroTotalsSchema
MealAnalysisResponseSchema

These should mirror shared package schemas if you’re using /packages/shared.

Repository layer
/repositories/nutrition.repository.ts

If your nutrition data lives in a JSON file, SQLite DB, or future external API, the repository hides the source.

Responsibilities
fetch nutrition records
search by canonical name
search aliases / synonyms

This keeps nutritionLookup.service.ts focused on business matching instead of raw data access.

Errors and result handling
/lib/errors.ts

Create explicit app errors like:

export class InvalidUploadError extends Error {}
export class AiProviderError extends Error {}
export class InvalidAiResponseError extends Error {}
export class NutritionLookupError extends Error {}

This makes controller and Fastify error handling much cleaner.

/lib/result.ts

Optional, but useful if you want structured success/failure returns.

Example:

type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

Not mandatory, but nice if you prefer explicit outcomes instead of many thrown errors.

Suggested response contract

Your final backend response should look something like:

{
  "dishCandidates": [
    {
      "name": "butter chicken with rice",
      "confidence": 0.84
    }
  ],
  "visibleIngredients": [
    {
      "id": "ing_1",
      "name": "chicken",
      "grams": 150,
      "category": "visible",
      "confidence": 0.92,
      "macros": {
        "protein_g": 46.5,
        "carbs_g": 0,
        "fat_g": 5.4,
        "calories_kcal": 248
      }
    }
  ],
  "inferredIngredients": [
    {
      "id": "ing_2",
      "name": "butter",
      "grams": 12,
      "category": "inferred",
      "confidence": 0.61,
      "macros": {
        "protein_g": 0.1,
        "carbs_g": 0,
        "fat_g": 9.7,
        "calories_kcal": 86
      }
    }
  ],
  "macroTotals": {
    "protein_g": 40.2,
    "carbs_g": 55.1,
    "fat_g": 24.8,
    "calories_kcal": 603
  },
  "assumptions": [
    "Portion sizes estimated visually",
    "Some ingredients inferred from common recipe patterns"
  ],
  "warnings": [
    "Hidden oils and sauces may materially affect fat and calorie estimates"
  ]
}
Good backend design decisions for v1
1. Keep nutrition lookup local first

For v1, use a JSON nutrition reference dataset for common ingredients.

Why:

faster build
deterministic
no external dependency complexity

Later you can swap in USDA or Edamam behind the repository.

2. Keep inferred ingredient enrichment partly rule-based

Do not rely only on AI to infer hidden ingredients.

Use dish-pattern rules like:

butter chicken
pasta carbonara
fried rice
caesar salad

This makes outputs more stable and testable.

3. Never trust raw Gemini JSON

Even if Gemini supports structured output, still validate it yourself.

Always.

4. Recalculate macros on backend too

Even if frontend recomputes for responsiveness, backend should still be source of truth when recalculation requests happen.

Recommended class/module boundaries

A clean version of the main service dependencies would be:

MealsController
 ├── MealAnalysisOrchestratorService
 │    ├── ImagePreprocessorService
 │    ├── GeminiMealAnalyzerService
 │    ├── AIResponseParser
 │    ├── IngredientInferenceService
 │    ├── NutritionLookupService
 │    │    └── NutritionRepository
 │    └── MacroCalculatorService
 │
 └── MealRecalculationService
      ├── NutritionLookupService
      │    └── NutritionRepository
      └── MacroCalculatorService

That’s a solid service graph.

What I would build first

In order:

shared types + zod schemas
nutrition-reference.json
nutrition.repository.ts
nutritionLookup.service.ts
macroCalculator.service.ts
promptBuilder.ts
geminiMealAnalyzer.service.ts
aiResponseParser.ts
imagePreprocessor.service.ts
mealAnalysisOrchestrator.service.ts
mealRecalculation.service.ts
controller + routes
tests

That order keeps dependencies sane.

Example service responsibilities in one sentence each
MealsController: handles HTTP in/out
MealAnalysisOrchestratorService: runs the full analysis pipeline
GeminiMealAnalyzerService: talks to Google Gemini
AIResponseParser: validates and normalizes model output
IngredientInferenceService: adds likely hidden ingredients
NutritionLookupService: maps foods to nutrition entries
MacroCalculatorService: computes macros
MealRecalculationService: recalculates after user edits
ImagePreprocessorService: prepares images for model input
NutritionRepository: reads nutrition data source