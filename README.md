# FoodSense

FoodSense is a production-minded MVP for turning a meal photo into an editable macro estimate. The project is built as a monorepo with a Next.js frontend, a Fastify API, and a shared TypeScript package for schemas and contracts.

## Stack

- Frontend: Next.js 16, App Router, TypeScript, Tailwind CSS
- Backend: Fastify 5, TypeScript
- AI: Google Gemini multimodal `generateContent`
- Shared contracts: `zod` schemas and TypeScript types
- Tests: Vitest, Testing Library, Fastify inject

## Workspace layout

```text
apps/
  api/        Fastify API for image analysis and macro recalculation
  web/        Next.js app for upload, review, and editing
packages/
  shared/     Shared types, schemas, and constants
```

## Features in this MVP

- Meal photo upload with file validation
- Gemini-backed meal analysis prompt with strict JSON parsing
- Visible vs inferred ingredient separation
- Local nutrition reference dataset for ingredient-level macros
- Editable results page with live macro updates and backend resync
- Local browser save flow for analyzed meals
- Shared runtime validation across frontend and backend

## Environment

Copy the values from [`.env.example`](/c:/Users/jiten/Documents/software-projects/foodsense/.env.example) into your local environment.

Key variables:

- `NEXT_PUBLIC_API_BASE_URL`: frontend target for the API
- `API_PORT`: Fastify server port
- `GOOGLE_GENAI_API_KEY`: Gemini API key
- `GOOGLE_GENAI_MODEL`: Gemini model id, default `gemini-2.5-flash`
- `MAX_UPLOAD_SIZE_MB`: upload size cap
- `ALLOW_DEV_ANALYSIS_FALLBACK`: when `true`, the API uses a clearly labeled development fallback if no Gemini API key is configured

## Getting started

```bash
npm install
npm run dev
```

This starts:

- `packages/shared` in watch mode
- the Fastify API
- the Next.js web app

Default local URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Scripts

```bash
npm run dev
npm run build
npm run test
```

## Docker

Build and run both services with Docker Compose:

```bash
docker compose up --build
```

This starts:

- `foodsense-api` on `http://localhost:4000`
- `foodsense-web` on `http://localhost:3000`

If those ports are already in use, you can override the published host ports:

```bash
API_PUBLIC_PORT=4001 WEB_PORT=3001 NEXT_PUBLIC_API_BASE_URL=http://localhost:4001 docker compose up --build
```

The compose file uses your root [`.env.example`](/c:/Users/jiten/Documents/software-projects/foodsense/.env.example) shape. For the web image, `NEXT_PUBLIC_API_BASE_URL` is injected at build time, so if you change it you should rebuild the web image.

Workspace-specific commands:

```bash
npm run dev --workspace @foodsense/api
npm run dev --workspace @foodsense/web
npm run test --workspace @foodsense/shared
```

## API endpoints

- `GET /api/v1/health`
- `POST /api/v1/meals/analyze`
  - accepts multipart upload under `file`
- `POST /api/v1/meals/recalculate`
  - accepts edited ingredient arrays

## Architecture summary

Request flow for meal analysis:

1. Web uploads the image to the API.
2. API validates and preprocesses the image.
3. Gemini returns structured JSON for dish candidates and ingredients.
4. API validates the AI output with `zod`.
5. Nutrition lookup maps ingredients to a local reference dataset.
6. Macro calculation produces ingredient-level and meal-level totals.
7. Web renders editable results and syncs recalculation requests on edits.

More detail is documented in [system_architecture.md](/c:/Users/jiten/Documents/software-projects/foodsense/system_architecture.md).

## Testing

Current automated coverage includes:

- shared schema parsing tests
- macro calculator unit tests
- AI response normalization tests
- API integration test for `/api/v1/meals/analyze`
- frontend component test for live macro updates

## Notes

- The nutrition provider is intentionally local and replaceable for V1.
- The API treats Gemini as an untrusted upstream and validates every response.
- When no Gemini API key is configured and fallback mode is enabled, the API returns a clearly labeled development estimate instead of pretending it performed real vision analysis.
