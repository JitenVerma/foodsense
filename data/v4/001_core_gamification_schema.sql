alter table public.profiles
  add column if not exists name text;

alter table public.profiles
  add column if not exists age_years integer
  check (age_years is null or age_years between 13 and 120);

alter table public.profiles
  add column if not exists height_cm numeric
  check (height_cm is null or height_cm > 0);

alter table public.profiles
  add column if not exists weight_kg numeric
  check (weight_kg is null or weight_kg > 0);

alter table public.profiles
  add column if not exists gender text
  check (
    gender is null
    or gender in ('female', 'male', 'non_binary', 'other', 'prefer_not_to_say')
  );

alter table public.profiles
  add column if not exists activity_level text
  check (
    activity_level is null
    or activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active')
  );

alter table public.profiles
  add column if not exists job_type text
  check (
    job_type is null
    or job_type in ('desk_based', 'mixed', 'active')
  );

alter table public.profiles
  add column if not exists strength_training_enabled boolean not null default false;

alter table public.profiles
  add column if not exists cardio_enabled boolean not null default false;

alter table public.profiles
  add column if not exists sessions_per_week integer
  check (sessions_per_week is null or sessions_per_week between 0 and 14);

alter table public.profiles
  add column if not exists desired_sessions_per_week integer
  check (desired_sessions_per_week is null or desired_sessions_per_week between 0 and 14);

alter table public.profiles
  add column if not exists time_zone text not null default 'UTC';

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

alter table public.meals
  add column if not exists is_favorite boolean not null default false;

alter table public.meals
  add column if not exists is_library_template boolean not null default false;

alter table public.meals
  add column if not exists source_meal_id uuid references public.meals(id) on delete set null;

alter table public.meals
  add column if not exists last_reused_at timestamptz;

create table if not exists public.user_goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goal_type text not null default 'maintain'
    check (goal_type in ('lose_weight', 'maintain', 'gain_weight')),
  target_weight_kg numeric check (target_weight_kg is null or target_weight_kg > 0),
  timeframe_weeks integer check (timeframe_weeks is null or timeframe_weeks > 0),
  daily_calorie_target numeric not null default 0 check (daily_calorie_target >= 0),
  daily_protein_target_g numeric not null default 0 check (daily_protein_target_g >= 0),
  daily_carbs_target_g numeric not null default 0 check (daily_carbs_target_g >= 0),
  daily_fat_target_g numeric not null default 0 check (daily_fat_target_g >= 0),
  bmr_kcal numeric check (bmr_kcal is null or bmr_kcal >= 0),
  tdee_kcal numeric check (tdee_kcal is null or tdee_kcal >= 0),
  calculation_version integer not null default 1 check (calculation_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_daily_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  progress_date date not null,
  total_calories numeric not null default 0 check (total_calories >= 0),
  total_protein numeric not null default 0 check (total_protein >= 0),
  total_carbs numeric not null default 0 check (total_carbs >= 0),
  total_fat numeric not null default 0 check (total_fat >= 0),
  meals_logged_count integer not null default 0 check (meals_logged_count >= 0),
  breakfast_logged boolean not null default false,
  lunch_logged boolean not null default false,
  dinner_logged boolean not null default false,
  snack_logged boolean not null default false,
  protein_goal_hit boolean not null default false,
  calorie_target_hit boolean not null default false,
  full_day_complete boolean not null default false,
  xp_earned integer not null default 0 check (xp_earned >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, progress_date)
);

create table if not exists public.user_xp (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_xp integer not null default 0 check (total_xp >= 0),
  current_level integer not null default 1 check (current_level >= 1),
  xp_into_current_level integer not null default 0 check (xp_into_current_level >= 0),
  xp_to_next_level integer not null default 100 check (xp_to_next_level > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  xp_amount integer not null check (xp_amount <> 0),
  source_reference_type text,
  source_reference_id text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  logging_current_streak integer not null default 0 check (logging_current_streak >= 0),
  logging_longest_streak integer not null default 0 check (logging_longest_streak >= 0),
  full_day_current_streak integer not null default 0 check (full_day_current_streak >= 0),
  full_day_longest_streak integer not null default 0 check (full_day_longest_streak >= 0),
  goal_current_streak integer not null default 0 check (goal_current_streak >= 0),
  goal_longest_streak integer not null default 0 check (goal_longest_streak >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.quest_definitions (
  id uuid primary key default gen_random_uuid(),
  quest_type text not null check (quest_type in ('daily', 'weekly')),
  code text not null unique,
  title text not null,
  description text not null,
  goal_metric text not null,
  goal_target integer not null check (goal_target > 0),
  xp_reward integer not null check (xp_reward >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_definition_id uuid not null references public.quest_definitions(id) on delete cascade,
  period_start_date date not null,
  period_end_date date not null,
  status text not null default 'active'
    check (status in ('active', 'completed', 'failed')),
  progress_value integer not null default 0 check (progress_value >= 0),
  target_value integer not null default 0 check (target_value >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, quest_definition_id, period_start_date),
  check (period_end_date >= period_start_date)
);

create index if not exists idx_meals_user_eaten_at_desc
on public.meals(user_id, eaten_at desc);

create index if not exists idx_meals_user_favorites
on public.meals(user_id, updated_at desc)
where is_favorite = true;

create index if not exists idx_meals_user_library_templates
on public.meals(user_id, updated_at desc)
where is_library_template = true;

create index if not exists idx_meals_source_meal_id
on public.meals(source_meal_id)
where source_meal_id is not null;

create index if not exists idx_xp_events_user_occurred_at
on public.xp_events(user_id, occurred_at desc);

create index if not exists idx_user_quests_user_status_period
on public.user_quests(user_id, status, period_start_date desc);

create index if not exists idx_quest_definitions_active_order
on public.quest_definitions(quest_type, sort_order)
where is_active = true;
