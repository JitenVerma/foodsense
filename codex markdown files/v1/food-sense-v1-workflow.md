# Food Image → Meal Analysis V1 Workflow Specification

## Purpose

This document defines the exact backend and frontend processing steps for the V1 flow that takes a user-uploaded meal photo and converts it into a useful, editable meal analysis result.

## V1 stack assumptions

- Frontend: Next.js
- Backend: Node.js + TypeScript
- Vision model: Google Gemini 2.5 Pro
- Recipe enrichment: API Ninjas Recipe API
- Nutrition source of truth: USDA FoodData Central
- Output: editable list of visible + inferred ingredients, grams, macros, calories, assumptions, warnings

---

## High-level pipeline

1. User uploads a meal photo
2. Backend validates and preprocesses the image
3. Gemini analyzes the photo and returns:
   - dish candidates
   - visible ingredients
   - rough portion estimates
   - confidence scores
4. Backend normalizes the dish candidates into canonical dish names
5. Backend queries API Ninjas Recipe API using the best canonical dish candidates
6. Backend extracts and aggregates frequent recipe ingredients
7. Backend merges:
   - visible ingredients from Gemini
   - likely hidden ingredients from recipe enrichment
8. Backend finalizes the ingredient list
9. Backend maps finalized ingredients to USDA FoodData Central foods
10. Backend calculates macros and calories from ingredient-level data
11. Frontend displays the result
12. User edits ingredients or grams
13. Backend recalculates totals from the edited ingredient list

---

## Detailed step-by-step process

## Step 1: User uploads photo

### Frontend
- User selects or drags a food image into the upload component
- Supported file types:
  - jpg
  - jpeg
  - png
  - webp
- Validate basic constraints client-side:
  - supported MIME type
  - max file size
- Show image preview
- Send the image to the backend using `multipart/form-data`

### Backend endpoint
`POST /api/v1/meals/analyze`

### Expected backend input
- image file
- optional metadata later if needed, such as:
  - meal context
  - user-entered hint
  - cuisine hint

For V1, only the image is required.

---

## Step 2: Validate and preprocess the image

### Backend service
`imagePreprocessorService`

### Responsibilities
- Validate file exists
- Validate MIME type
- Validate upload size
- Resize or compress if necessary
- Convert to a Gemini-compatible input format

### Output
```json
{
  "mimeType": "image/jpeg",
  "base64Image": "<base64 encoded image>",
  "width": 1280,
  "height": 960
}
```

### Notes
- Keep original image only if you need preview persistence or later re-analysis
- For V1, a temporary in-memory pipeline is acceptable

---

## Step 3: Analyze the image with Gemini 2.5 Pro

### Backend service
`geminiMealAnalyzerService`

### Goal
Use Gemini as the primary multimodal recognizer to determine what the dish is and what is visibly present in the image.

### Prompt responsibilities
Prompt Gemini to return strict JSON only with:
- top dish candidates
- visible ingredients
- rough gram estimates
- confidence scores
- assumptions
- warnings

### Example target JSON shape
```json
{
  "dishCandidates": [
    {
      "name": "butter chicken with rice",
      "confidence": 0.86
    },
    {
      "name": "chicken tikka masala with rice",
      "confidence": 0.63
    }
  ],
  "visibleIngredients": [
    {
      "name": "chicken",
      "grams": 140,
      "confidence": 0.91
    },
    {
      "name": "rice",
      "grams": 180,
      "confidence": 0.95
    },
    {
      "name": "curry sauce",
      "grams": 90,
      "confidence": 0.67
    }
  ],
  "assumptions": [
    "Portion sizes estimated visually"
  ],
  "warnings": [
    "Sauce contents may not be fully visible"
  ]
}
```

### Important rules
- Gemini should not be trusted as the final nutrition source
- Gemini should not provide final macros as the source of truth
- Gemini output must be parsed and validated before use

---

## Step 4: Parse and validate Gemini output

### Backend service
`aiResponseParser`

### Responsibilities
- Parse the model response
- Strip any accidental markdown fences
- Validate against zod schema
- Reject malformed output
- Normalize empty or inconsistent fields

### Output
A trusted internal object:
```ts
type ParsedGeminiMealAnalysis = {
  dishCandidates: Array<{ name: string; confidence: number }>;
  visibleIngredients: Array<{ name: string; grams: number; confidence: number }>;
  assumptions: string[];
  warnings: string[];
}
```

### Failure handling
If parsing fails:
- return a safe user-facing error
- log the raw AI response for debugging
- do not continue to later stages

---

## Step 5: Canonicalize the dish candidates

### Backend service
`dishCanonicalizerService`

### Goal
Convert loose natural-language dish names into standard search-friendly dish labels before recipe lookup.

### Examples
- "creamy tomato chicken curry with rice" → `butter chicken with rice`
- "spaghetti with creamy bacon sauce" → `spaghetti carbonara`
- "fried rice with chicken" → `chicken fried rice`

### Responsibilities
- lowercasing and trimming
- synonym reduction
- basic cuisine-aware normalization
- mapping to canonical search terms

### Output
```json
{
  "canonicalDishCandidates": [
    {
      "name": "butter chicken with rice",
      "sourceName": "creamy tomato chicken curry with rice",
      "confidence": 0.86
    }
  ]
}
```

### V1 note
This can start with a rule-based normalizer rather than another model call.

---

## Step 6: Search recipes using API Ninjas

### Backend service
`recipeSearchService`

### Goal
Search a recipe source to discover common ingredients for the most likely dishes.

### Input
Use the top 1 to 3 canonical dish candidates.

### Suggested strategy
For each strong dish candidate:
1. call API Ninjas Recipe API
2. retrieve a small set of relevant recipes
3. collect ingredient lists from each returned recipe

### Search policy
- Search the highest-confidence dish candidate first
- If results are sparse or low quality, search the second candidate
- Stop when enough recipe evidence is collected

### Output
```json
{
  "recipes": [
    {
      "title": "Butter Chicken",
      "ingredientsRaw": [
        "1 lb chicken",
        "2 tbsp butter",
        "1 cup tomato puree",
        "1/2 cup cream",
        "1 onion",
        "2 cloves garlic"
      ]
    }
  ]
}
```

### Important V1 principle
You are not trying to find the one correct recipe.
You are trying to discover the most common ingredient patterns across multiple recipes.

---

## Step 7: Normalize recipe ingredient strings

### Backend service
`recipeIngredientNormalizerService`

### Goal
Convert messy recipe ingredient strings into normalized ingredient names.

### Examples
- "2 tbsp butter" → `butter`
- "1 cup tomato puree" → `tomato puree`
- "2 cloves garlic" → `garlic`

### Responsibilities
- strip quantities
- strip units
- singularize where useful
- remove preparation words where helpful
- keep nutritionally meaningful descriptors when needed
  - example: `coconut milk` should stay `coconut milk`

### Output
```json
{
  "normalizedIngredients": [
    "chicken",
    "butter",
    "tomato puree",
    "cream",
    "onion",
    "garlic"
  ]
}
```

---

## Step 8: Aggregate frequent recipe ingredients

### Backend service
`ingredientAggregatorService`

### Goal
Build an ingredient frequency map across recipes for each candidate dish.

### Responsibilities
- count normalized ingredient frequency
- score how commonly each ingredient appears
- rank ingredients by frequency

### Example output
```json
{
  "ingredientFrequency": [
    { "name": "chicken", "frequency": 0.95 },
    { "name": "tomato", "frequency": 0.88 },
    { "name": "butter", "frequency": 0.82 },
    { "name": "garlic", "frequency": 0.79 },
    { "name": "cream", "frequency": 0.71 },
    { "name": "onion", "frequency": 0.67 }
  ]
}
```

### Suggested V1 thresholds
- `>= 0.70` → likely inferred ingredient
- `0.40 to 0.69` → possible inferred ingredient
- `< 0.40` → usually exclude from default result

These are starting points and should be tuned over time.

---

## Step 9: Merge visible and inferred ingredients

### Backend service
`ingredientMergerService`

### Goal
Combine Gemini-visible ingredients with recipe-derived inferred ingredients into one decision set.

### Rules
1. Visible ingredients from Gemini should almost always be included
2. If a visible ingredient and a recipe ingredient are duplicates or aliases, merge them
3. High-frequency hidden ingredients should be included as inferred
4. Low-value speculative ingredients should usually be excluded
5. Macro-heavy hidden ingredients should be favored if they materially affect calories or fat:
   - oil
   - butter
   - cream
   - cheese
   - dressing
   - sugar

### Output
A merged ingredient candidate list with source attribution:
```json
{
  "mergedIngredients": [
    { "name": "chicken", "source": "visible", "confidence": 0.91 },
    { "name": "rice", "source": "visible", "confidence": 0.95 },
    { "name": "butter", "source": "inferred", "confidence": 0.62 },
    { "name": "cream", "source": "inferred", "confidence": 0.58 },
    { "name": "tomato sauce", "source": "inferred", "confidence": 0.70 }
  ]
}
```

---

## Step 10: Estimate or refine grams for finalized ingredients

### Backend service
`portionEstimatorService`

### Goal
Assign grams to each finalized ingredient.

### Strategy
Use a hybrid approach:
- Keep Gemini estimates for visible ingredients
- Estimate inferred ingredient grams using simple dish-specific defaults
- Mark uncertain amounts clearly

### Example defaults
For a curry dish:
- butter: 8g to 15g
- cream: 10g to 25g
- oil: 5g to 12g
- tomato sauce base: 20g to 50g

### Output
```json
{
  "finalIngredients": [
    { "name": "chicken", "grams": 140, "source": "visible", "confidence": 0.91 },
    { "name": "rice", "grams": 180, "source": "visible", "confidence": 0.95 },
    { "name": "butter", "grams": 12, "source": "inferred", "confidence": 0.62 },
    { "name": "cream", "grams": 18, "source": "inferred", "confidence": 0.58 },
    { "name": "tomato sauce", "grams": 30, "source": "inferred", "confidence": 0.70 }
  ]
}
```

### V1 note
This does not need to be perfect.
It needs to be reasonable, explainable, and editable.

---

## Step 11: Match ingredients to USDA FoodData Central

### Backend service
`nutritionLookupService`

### Goal
Map each finalized ingredient to a USDA food record so macros can be calculated from a nutrition source of truth.

### Responsibilities
- search FoodData Central for each finalized ingredient
- choose the best matching food record
- prefer useful data types where possible
- return macros per 100g for:
  - protein
  - carbohydrates
  - fat
  - energy

### Input
```json
{
  "ingredients": [
    "chicken",
    "rice",
    "butter",
    "cream",
    "tomato sauce"
  ]
}
```

### Output
```json
{
  "nutritionMatches": [
    {
      "ingredientName": "butter",
      "fdcDescription": "Butter, salted",
      "proteinPer100g": 0.85,
      "carbsPer100g": 0.06,
      "fatPer100g": 81.11,
      "caloriesPer100g": 717
    }
  ]
}
```

### Matching strategy
- exact normalized match first
- alias match second
- keyword fallback third
- if unresolved, return a warning and skip or use a local fallback mapping

### Important rule
Do not silently invent nutrition values if the lookup fails.
Either:
- use an explicit fallback table, or
- flag the ingredient as unresolved

---

## Step 12: Calculate ingredient-level macros and total meal macros

### Backend service
`macroCalculatorService`

### Goal
Calculate macros from the finalized ingredient list and USDA nutrition references.

### Formula
For each ingredient:
`macro_for_ingredient = (grams / 100) * macro_per_100g`

### Compute
- protein_g
- carbs_g
- fat_g
- calories_kcal

### Output per ingredient
```json
{
  "name": "butter",
  "grams": 12,
  "macros": {
    "protein_g": 0.1,
    "carbs_g": 0.0,
    "fat_g": 9.7,
    "calories_kcal": 86.0
  }
}
```

### Sum totals
```json
{
  "macroTotals": {
    "protein_g": 41.2,
    "carbs_g": 56.8,
    "fat_g": 23.5,
    "calories_kcal": 612
  }
}
```

### Important rule
Totals must be computed from ingredient-level macros.
Do not use a single model-generated macro total as the source of truth.

---

## Step 13: Return the normalized result to the frontend

### Backend response shape
```json
{
  "dishCandidates": [
    {
      "name": "butter chicken with rice",
      "confidence": 0.86
    }
  ],
  "visibleIngredients": [
    {
      "id": "ing_1",
      "name": "chicken",
      "grams": 140,
      "category": "visible",
      "confidence": 0.91,
      "macros": {
        "protein_g": 43.4,
        "carbs_g": 0.0,
        "fat_g": 5.0,
        "calories_kcal": 231
      }
    }
  ],
  "inferredIngredients": [
    {
      "id": "ing_2",
      "name": "butter",
      "grams": 12,
      "category": "inferred",
      "confidence": 0.62,
      "macros": {
        "protein_g": 0.1,
        "carbs_g": 0.0,
        "fat_g": 9.7,
        "calories_kcal": 86
      },
      "reason": "Found in a high share of matched recipes"
    }
  ],
  "macroTotals": {
    "protein_g": 41.2,
    "carbs_g": 56.8,
    "fat_g": 23.5,
    "calories_kcal": 612
  },
  "assumptions": [
    "Portion sizes estimated visually",
    "Some hidden ingredients inferred from common recipe patterns"
  ],
  "warnings": [
    "Sauces and oils may materially affect calories and fat"
  ]
}
```

---

## Step 14: User review and edit flow

### Frontend responsibilities
Display:
- dish candidates
- visible ingredients
- inferred ingredients
- grams
- ingredient-level macros
- total macros
- assumptions
- warnings

Allow the user to:
- remove inferred ingredients
- add missing ingredients
- edit grams
- change ingredient names if needed

### Why this matters
The model and recipe enrichment are giving a best-effort estimate.
The user correction step is what makes the product practically useful.

---

## Step 15: Recalculate after edits

### Backend endpoint
`POST /api/v1/meals/recalculate`

### Backend service
`mealRecalculationService`

### Input
A user-edited list of ingredients:
```json
{
  "ingredients": [
    {
      "name": "chicken",
      "grams": 150,
      "category": "visible"
    },
    {
      "name": "butter",
      "grams": 8,
      "category": "inferred"
    }
  ]
}
```

### Responsibilities
- re-run nutrition lookup if names changed
- recompute ingredient-level macros
- recompute totals
- return updated totals

---

## Suggested service order in code

1. `imagePreprocessorService`
2. `geminiMealAnalyzerService`
3. `aiResponseParser`
4. `dishCanonicalizerService`
5. `recipeSearchService`
6. `recipeIngredientNormalizerService`
7. `ingredientAggregatorService`
8. `ingredientMergerService`
9. `portionEstimatorService`
10. `nutritionLookupService`
11. `macroCalculatorService`
12. `mealAnalysisOrchestratorService`
13. `mealRecalculationService`

---

## Suggested orchestration flow

```text
POST /api/v1/meals/analyze
→ imagePreprocessorService
→ geminiMealAnalyzerService
→ aiResponseParser
→ dishCanonicalizerService
→ recipeSearchService
→ recipeIngredientNormalizerService
→ ingredientAggregatorService
→ ingredientMergerService
→ portionEstimatorService
→ nutritionLookupService
→ macroCalculatorService
→ response formatter
→ frontend
```

---

## V1 decision rules

### Ingredient inclusion rules
Include by default:
- high-confidence visible ingredients
- high-frequency inferred ingredients
- hidden ingredients that heavily affect calories/macros

Usually exclude by default:
- low-confidence speculative ingredients
- ingredients with tiny macro impact unless clearly visible

### Confidence rules
- visible confidence comes primarily from Gemini
- inferred confidence comes from recipe frequency + decision logic

### Nutrition rules
- USDA is the source of truth for macros
- use local fallback mappings for known problem ingredients if necessary
- unresolved ingredients should generate warnings

---

## Recommended MVP success criteria

The pipeline is good enough for V1 if it can reliably:
- detect the likely dish family
- identify the main visible ingredients
- infer key hidden calorie-heavy ingredients
- estimate macros within a reasonable range
- let the user easily correct the result

---

## Implementation notes

- Keep every stage typed and schema-validated
- Do not let the frontend trust raw AI output
- Keep inferred ingredients visibly labeled as inferred
- Keep the pipeline explainable so users understand where values came from
- Favor a transparent estimate over a fake sense of precision
