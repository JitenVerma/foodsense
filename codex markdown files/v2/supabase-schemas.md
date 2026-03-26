2. Supabase Database Schema (MD File)

This is structured so you can directly translate into Supabase SQL.

# 🗄️ Supabase Database Schema — Food Tracking App V2

---

## Overview

This schema supports:
- user authentication
- meal tracking
- ingredient-level nutrition
- calendar/history views

---

## 1. Users Table

Supabase provides `auth.users`, so extend it with a profile table.

### Table: profiles

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamp with time zone default now()
);
2. Meals Table
Table: meals
create table meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,

  title text,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),

  eaten_at timestamp with time zone,

  image_url text,

  total_protein numeric,
  total_carbs numeric,
  total_fat numeric,
  total_calories numeric,

  assumptions jsonb,
  warnings jsonb,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
3. Meal Ingredients Table
Table: meal_ingredients
create table meal_ingredients (
  id uuid primary key default gen_random_uuid(),

  meal_id uuid references meals(id) on delete cascade,

  name text,
  grams numeric,

  category text check (category in ('visible', 'inferred', 'manual')),
  confidence numeric,

  reason text,

  protein numeric,
  carbs numeric,
  fat numeric,
  calories numeric
);
4. Indexing (IMPORTANT)
create index idx_meals_user_id on meals(user_id);
create index idx_meals_eaten_at on meals(eaten_at);
create index idx_meal_ingredients_meal_id on meal_ingredients(meal_id);
5. Row-Level Security (RLS)

Enable RLS:

alter table meals enable row level security;
alter table meal_ingredients enable row level security;
alter table profiles enable row level security;
Policies
Meals
create policy "Users can manage their own meals"
on meals
for all
using (auth.uid() = user_id);
Ingredients
create policy "Users can access ingredients via meals"
on meal_ingredients
for all
using (
  exists (
    select 1 from meals
    where meals.id = meal_ingredients.meal_id
    and meals.user_id = auth.uid()
  )
);
Profiles
create policy "Users can access their profile"
on profiles
for all
using (auth.uid() = id);
6. Relationships
One user → many meals
One meal → many ingredients
7. Example Data Flow
User uploads meal
Backend analyzes
User edits ingredients
Backend saves:
meal → meals table
ingredients → meal_ingredients table
8. Future Extensions

Add later:

User goals
create table user_goals (
  user_id uuid primary key references auth.users(id),
  calories_target numeric,
  protein_target numeric,
  carbs_target numeric,
  fat_target numeric
);
Meal tags
healthy
cheat meal
high protein
9. Design Notes
Store macros at ingredient level → enables recalculation
Store totals at meal level → faster queries
Use JSON for assumptions/warnings → flexible schema
Keep ingredient categories explicit (visible vs inferred)
10. Summary

This schema supports:

daily tracking
historical analysis
editing workflows
scalable nutrition features