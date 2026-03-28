alter table public.user_goals enable row level security;
alter table public.user_daily_progress enable row level security;
alter table public.user_xp enable row level security;
alter table public.xp_events enable row level security;
alter table public.user_streaks enable row level security;
alter table public.quest_definitions enable row level security;
alter table public.user_quests enable row level security;

drop policy if exists "Users can view their own goals" on public.user_goals;
create policy "Users can view their own goals"
on public.user_goals
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own goals" on public.user_goals;
create policy "Users can insert their own goals"
on public.user_goals
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own goals" on public.user_goals;
create policy "Users can update their own goals"
on public.user_goals
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view their own daily progress" on public.user_daily_progress;
create policy "Users can view their own daily progress"
on public.user_daily_progress
for select
using (auth.uid() = user_id);

drop policy if exists "Users can view their own xp summary" on public.user_xp;
create policy "Users can view their own xp summary"
on public.user_xp
for select
using (auth.uid() = user_id);

drop policy if exists "Users can view their own xp events" on public.xp_events;
create policy "Users can view their own xp events"
on public.xp_events
for select
using (auth.uid() = user_id);

drop policy if exists "Users can view their own streaks" on public.user_streaks;
create policy "Users can view their own streaks"
on public.user_streaks
for select
using (auth.uid() = user_id);

drop policy if exists "Authenticated users can view quest definitions" on public.quest_definitions;
create policy "Authenticated users can view quest definitions"
on public.quest_definitions
for select
using (auth.role() = 'authenticated');

drop policy if exists "Users can view their own quest progress" on public.user_quests;
create policy "Users can view their own quest progress"
on public.user_quests
for select
using (auth.uid() = user_id);
