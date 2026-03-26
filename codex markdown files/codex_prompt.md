Build a production-minded MVP for a web application called “Food Image → Macro Estimation App”.

## Objective
Create an app where a user uploads an image of a plate of food, and the system uses Google AI models to:
1. identify the likely dish,
2. detect visible ingredients,
3. infer likely hidden ingredients based on common recipes,
4. estimate portion sizes,
5. calculate estimated macros (protein, carbs, fat, calories),
6. present results in an editable UI.

The stack must be:
- Frontend: Next.js (latest stable, App Router, TypeScript)
- Backend: Node.js with TypeScript
- AI: Google Gemini multimodal models
- Architecture: frontend and backend as separate apps in a monorepo

Do not build a toy demo. Build a clean MVP with good structure, typed contracts, validation, and clear separation of concerns.

---

## Product scope for v1

### V1 user flow
1. User lands on the home page.
2. User uploads a meal photo.
3. Frontend sends the image to the backend.
4. Backend calls Google Gemini to analyze the image.
5. Backend transforms the AI response into structured JSON.
6. Backend performs nutrition mapping and macro aggregation.
7. Frontend shows:
   - top dish candidates,
   - visible ingredients,
   - inferred ingredients,
   - estimated macros.
8. User can edit ingredient names and grams.
9. Macro totals update live on the frontend.
10. User can optionally save the analyzed meal locally or to a database abstraction layer.

### Non-goals for v1
- No auth
- No subscriptions/payments
- No barcode scanning
- No camera livestream
- No social features
- No medical claims

---

## Monorepo structure
Create a monorepo with:
- /apps/web → Next.js frontend
- /apps/api → Node.js backend
- /packages/shared → shared TypeScript types, schemas, and utilities

Use npm workspaces or pnpm workspaces.

---

## Frontend requirements (Next.js)

### Pages
1. Home page
   - headline, short description
   - upload control
   - image preview
   - analyze button
   - loading state
   - error state

2. Results page
   - uploaded image preview
   - detected dish candidates
   - visible ingredients section
   - inferred ingredients section
   - macro summary card
   - edit ingredient controls
   - recompute totals client-side when edits happen

### Components
Create reusable components:
- ImageUploader
- UploadPreview
- AnalyzeButton
- DishCandidatesCard
- IngredientTable
- MacroSummaryCard
- EditableIngredientRow
- ConfidenceBadge
- EmptyState
- ErrorBanner
- LoadingOverlay

### Frontend behavior
- Validate file type and size before upload
- Support jpg, jpeg, png, webp
- Show optimistic loading state
- Use typed API client
- Use server-safe environment config
- Keep UI clean and modern
- Mobile responsive

### Styling
Use Tailwind CSS.
Aim for:
- clean health/fitness style
- card-based layout
- rounded corners
- accessible spacing
- simple neutral palette

---

## Backend requirements (Node.js)

Use either:
- Fastify + TypeScript
or
- Express + TypeScript

Prefer Fastify if making a choice.

### Backend responsibilities
- accept uploaded image
- validate payload
- convert image into format suitable for Gemini
- call Gemini multimodal model
- enforce structured output
- parse and validate AI output
- enrich with nutrition estimates
- aggregate macros
- return normalized response to frontend

### API endpoints
Implement:

#### POST /api/v1/meals/analyze
Accept multipart file upload or base64 payload.
Return:
- dishCandidates
- visibleIngredients
- inferredIngredients
- macroTotals
- confidence metadata
- warnings / assumptions

#### POST /api/v1/meals/recalculate
Accept edited ingredient list with grams.
Return recomputed macros.

#### GET /api/v1/health
Basic health check.

---

## Shared contracts

Create shared TypeScript types and zod schemas for:

### DishCandidate
- name: string
- confidence: number

### Ingredient
- id: string
- name: string
- grams: number
- category: "visible" | "inferred"
- confidence: number
- notes?: string

### MacroTotals
- protein_g: number
- carbs_g: number
- fat_g: number
- calories_kcal: number

### MealAnalysisResponse
- dishCandidates: DishCandidate[]
- visibleIngredients: Ingredient[]
- inferredIngredients: Ingredient[]
- macroTotals: MacroTotals
- assumptions: string[]
- warnings: string[]

Use zod for runtime validation.

---

## Google AI integration

Use Google Gemini multimodal models.

### Model usage
Use Gemini for:
- food/dish recognition
- visible ingredient detection
- inferred ingredient suggestions
- rough portion estimation

### Prompting requirements
Create a dedicated prompt builder that instructs Gemini to return strict JSON only.

The prompt should ask Gemini to:
1. identify the top 3 possible dishes,
2. list visible ingredients only,
3. list likely hidden ingredients commonly present in the dish,
4. estimate grams for each item,
5. assign confidence scores,
6. include short assumptions where needed,
7. avoid markdown fences,
8. return valid JSON matching the expected schema.

### Important
Do not let the Gemini output directly drive UI without validation.
Always parse and validate against zod schemas.

Create a dedicated AI service module such as:
- src/services/geminiMealAnalyzer.ts

---

## Nutrition mapping strategy

Build a nutrition estimation service.

For v1:
- create a local nutrition reference dataset or stubbed nutrition lookup module
- include representative macros per 100g for common ingredients
- calculate totals based on grams
- make the service replaceable later with USDA FoodData Central or another external source

Create:
- src/services/nutritionLookup.ts
- src/services/macroCalculator.ts

### Rules
- macros should be computed from ingredients, not hallucinated as final totals only
- if a hidden ingredient is inferred, keep it clearly labeled as inferred
- preserve uncertainty in response

---

## Business logic rules

### Dish recognition
Return up to 3 dish candidates sorted by confidence.

### Visible ingredients
These are items clearly detectable in the image.

### Inferred ingredients
These are ingredients not necessarily visible but commonly included in the likely recipe.
Examples:
- oil
- butter
- cream
- garlic
- onion
- dressing
- sauce base ingredients

### Macro logic
- compute ingredient-level macros
- sum into meal-level totals
- round values sensibly
- prevent negative numbers
- handle missing values gracefully

### Confidence
All dish and ingredient items should include confidence from 0 to 1.

### Warnings
Return warnings such as:
- “Portion size estimated visually”
- “Hidden ingredients are inferred from common recipes”
- “Sauces and oils may be under- or over-estimated”

---

## State management
Frontend should manage:
- uploaded file
- preview URL
- analysis result
- edits
- recalculated totals
- loading/error states

Keep state simple.
You may use:
- React state
- or Zustand if it adds clarity without overengineering

---

## Error handling
Handle:
- invalid image format
- oversized uploads
- Gemini API failure
- invalid AI JSON
- nutrition lookup misses
- partial response from AI

Display user-friendly errors on the frontend.
Log developer-friendly details in the backend.

---

## Testing
Add at least:
- unit tests for macro calculator
- unit tests for response normalization
- unit tests for zod schema parsing
- one API integration test for /analyze
- one frontend component test for macro recalculation behavior

---

## Developer experience
Include:
- README with setup instructions
- environment variable examples
- scripts for dev/build/test
- comments only where useful
- clean folder structure
- avoid dead code and placeholder clutter

---

## Suggested folder structure

/apps/web
  /app
  /components
  /lib
  /types
  /hooks

/apps/api
  /src
    /routes
    /services
    /lib
    /schemas
    /utils

/packages/shared
  /src
    /types
    /schemas
    /constants

---

## UX expectations
The result should feel like a real MVP:
- polished upload experience
- clear analysis result
- confidence and uncertainty communicated well
- editable ingredients
- live-updating macro summary
- responsive on mobile and desktop

---

## Deliverables
Produce:
1. full codebase for monorepo
2. backend API implementation
3. frontend pages and components
4. shared schemas and types
5. sample env file
6. README
7. seed nutrition dataset for common ingredients
8. basic tests

---

## Implementation notes
- Prefer maintainable code over cleverness
- Keep each module focused
- Do not hardcode UI results
- Do not skip schema validation
- Do not use mock AI responses except where clearly isolated behind a development adapter
- Structure code so the nutrition provider can be swapped later

Start by scaffolding the monorepo, then implement the shared contracts, then backend services, then frontend UI, then tests and README.