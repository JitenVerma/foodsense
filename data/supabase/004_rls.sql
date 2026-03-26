alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.meal_ingredients enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can manage their own meals" on public.meals;
create policy "Users can manage their own meals"
on public.meals
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access ingredients via their meals" on public.meal_ingredients;
create policy "Users can access ingredients via their meals"
on public.meal_ingredients
for all
using (
  exists (
    select 1
    from public.meals
    where public.meals.id = public.meal_ingredients.meal_id
      and public.meals.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.meals
    where public.meals.id = public.meal_ingredients.meal_id
      and public.meals.user_id = auth.uid()
  )
);
