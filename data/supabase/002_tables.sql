create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  eaten_at timestamptz not null,
  image_url text,
  total_protein numeric not null default 0,
  total_carbs numeric not null default 0,
  total_fat numeric not null default 0,
  total_calories numeric not null default 0,
  assumptions jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_ingredients (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  name text not null,
  grams numeric not null default 0,
  category text not null check (category in ('visible', 'inferred', 'manual')),
  confidence numeric not null default 0,
  reason text,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  calories numeric not null default 0
);

create index if not exists idx_meals_user_id on public.meals(user_id);
create index if not exists idx_meals_eaten_at on public.meals(eaten_at);
create index if not exists idx_meal_ingredients_meal_id on public.meal_ingredients(meal_id);
