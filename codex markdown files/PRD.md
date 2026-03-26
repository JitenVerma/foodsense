🥗 Food Image → Macro Estimation App
Product Requirements Document (PRD)
1. Product Overview
Summary

Build an application that allows users to upload an image of their food. The system uses Google Gemini multimodal models to:

Identify the food/dish
Detect visible ingredients
Infer likely hidden ingredients (based on common recipes)
Estimate macronutrients (protein, carbs, fat, calories)

The output is editable, allowing users to correct inaccuracies before saving.

2. Goals
Primary Goals
Enable fast food logging via image upload
Provide reasonably accurate macro estimates
Deliver a clean, intuitive UX
Allow user corrections for accuracy improvement
Secondary Goals
Build a scalable AI-powered nutrition platform
Enable future features like:
meal tracking history
calorie goals
recommendations
3. Non-Goals (V1)
No barcode scanning
No real-time video analysis
No full dietary coaching
No guaranteed medical-grade accuracy
4. Target Users
Fitness enthusiasts tracking macros
General users wanting easy calorie tracking
People who dislike manual food logging
5. High-Level Architecture
Frontend
Next.js (App Router)
Upload UI + results dashboard
Editable ingredient/macros interface
Backend
Node.js (Express or Fastify)
Handles:
image upload
Gemini API calls
ingredient inference
nutrition calculation
AI / Data Layer
Google Gemini (multimodal)
Image understanding
Structured JSON output
Nutrition Source
USDA FoodData Central (or similar dataset)
6. AI Model Strategy (Google)
Primary Model
Gemini 2.5 Pro (or latest multimodal)
Input: Image
Output: Structured JSON
Responsibilities of Gemini
Identify dish candidates
Detect visible ingredients
Estimate portion sizes
Infer likely hidden ingredients
Example Prompt Strategy
You are a food nutrition assistant.

From this image:
1. Identify the dish (top 3 candidates with confidence)
2. List visible ingredients
3. Infer likely hidden ingredients based on common recipes
4. Estimate portion sizes in grams
5. Return JSON only
7. V1 User Flow
Step 1: Upload
User opens app
Uploads image (camera or gallery)
Step 2: Processing
Backend:
Sends image to Gemini
Receives structured output
Enriches with nutrition data
Step 3: Results Screen

User sees:

Detected dish
Ingredients:
Visible
Inferred
Estimated macros
Step 4: Edit

User can:

Remove/add ingredients
Adjust portion sizes
Step 5: Save
Save meal (optional in V1)
Or just use as one-off calculation
8. Core Features (V1)
8.1 Image Upload
Drag & drop / mobile camera
Supported formats: JPG, PNG
8.2 Food Recognition
Identify:
dish name(s)
multiple items on plate
8.3 Ingredient Detection
Visible Ingredients
Directly detected from image
Inferred Ingredients
Based on:
common recipes
cuisine patterns
8.4 Portion Estimation
Rough gram estimates
Confidence score included
8.5 Macro Calculation

For each ingredient:

Protein
Carbohydrates
Fat
Calories

Aggregated at meal level

8.6 Editable Results

User can:

Add/remove ingredients
Adjust grams
Override dish name
8.7 Confidence Indicators

Each output includes:

confidence score
“visible” vs “inferred” labels
9. API Design (Backend)
POST /analyze-meal
Request
{
  "image": "base64_encoded_image"
}
Response
{
  "dish_candidates": [
    { "name": "butter chicken with rice", "confidence": 0.84 }
  ],
  "visible_items": [
    { "name": "chicken", "grams": 150, "confidence": 0.9 }
  ],
  "inferred_ingredients": [
    { "name": "butter", "confidence": 0.6 }
  ],
  "macros": {
    "protein_g": 40,
    "carbs_g": 55,
    "fat_g": 25,
    "calories": 600
  }
}
10. Frontend Requirements (Next.js)
Pages
1. Home
Upload image
CTA: “Analyze Meal”
2. Results Page
Dish name
Ingredient list
Macro summary
3. Edit Panel
Editable fields:
ingredient name
grams
Components
ImageUploader
MealSummaryCard
IngredientList
MacroDisplay
EditModal
11. Backend Responsibilities
Image preprocessing
Gemini API integration
Prompt construction
JSON validation
Nutrition mapping
Aggregation logic
12. Data Model (Simplified)
Meal
{
  id: string
  createdAt: Date
  imageUrl: string
  macros: Macro
}
Ingredient
{
  name: string
  grams: number
  type: "visible" | "inferred"
}
Macro
{
  protein: number
  carbs: number
  fat: number
  calories: number
}
13. Non-Functional Requirements
Performance
Response time: < 5 seconds
Scalability
Stateless backend
Horizontal scaling ready
Reliability
Retry on AI failures
Fallback logic
14. Risks & Challenges
1. Portion Accuracy
Hard to estimate from images
2. Hidden Ingredients
Oils, butter, sauces often missed
3. Similar Foods
Visually identical meals ≠ same macros
15. Success Metrics
% of users completing analysis
User edits per meal (lower = better accuracy)
Retention rate
Avg response time
16. Future Enhancements (Post V1)
Meal history tracking
Daily calorie goals
Barcode scanning
Voice input (“I ate this”)
Personalized macro recommendations
🔥 One-Line Product Vision

“Turn any meal photo into an editable, AI-powered macro breakdown in seconds.”