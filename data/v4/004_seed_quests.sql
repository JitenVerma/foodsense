insert into public.quest_definitions (
  quest_type,
  code,
  title,
  description,
  goal_metric,
  goal_target,
  xp_reward,
  is_active,
  sort_order
)
values
  (
    'daily',
    'daily_log_3_meals',
    'Meal Machine',
    'Log three meals today.',
    'meals_logged',
    3,
    30,
    true,
    10
  ),
  (
    'daily',
    'daily_hit_protein_goal',
    'Protein Power-Up',
    'Hit your daily protein goal.',
    'protein_goal_hit',
    1,
    20,
    true,
    20
  ),
  (
    'daily',
    'daily_stay_within_calories',
    'Target Locked',
    'Finish the day within your calorie target.',
    'calorie_target_hit',
    1,
    30,
    true,
    30
  ),
  (
    'weekly',
    'weekly_log_meals_5_days',
    'Rhythm Runner',
    'Log meals on five different days this week.',
    'logged_days',
    5,
    75,
    true,
    10
  ),
  (
    'weekly',
    'weekly_hit_calorie_target_3_days',
    'Precision Player',
    'Stay within your calorie target on three days this week.',
    'calorie_target_days',
    3,
    90,
    true,
    20
  ),
  (
    'weekly',
    'weekly_complete_10_meals',
    'Ten-Meal Combo',
    'Complete ten meal logs this week.',
    'meals_logged',
    10,
    100,
    true,
    30
  )
on conflict (code) do update
set quest_type = excluded.quest_type,
    title = excluded.title,
    description = excluded.description,
    goal_metric = excluded.goal_metric,
    goal_target = excluded.goal_target,
    xp_reward = excluded.xp_reward,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;
