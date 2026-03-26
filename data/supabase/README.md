# Supabase SQL Setup

Run these files in order inside the Supabase SQL editor for a fresh V2 database setup:

1. `001_extensions.sql`
2. `002_tables.sql`
3. `003_triggers.sql`
4. `004_rls.sql`

What this creates:

- `profiles`
- `meals`
- `meal_ingredients`
- automatic `profiles` row creation when a new auth user is created
- automatic `updated_at` handling on `meals`
- row-level security policies aligned with the app's Fastify + bearer-token flow

After running the SQL, populate the Supabase values in [`.env.example`](C:/Users/jiten/Documents/software-projects/foodsense/.env.example) format and start the app with `npm run dev`.
