create or replace function public.ensure_v4_user_records(target_user_id uuid, target_email text default '')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, updated_at)
  values (target_user_id, coalesce(target_email, ''), now())
  on conflict (id) do update
  set email = coalesce(nullif(excluded.email, ''), public.profiles.email, ''),
      updated_at = coalesce(public.profiles.updated_at, now());

  insert into public.user_goals (user_id)
  values (target_user_id)
  on conflict (user_id) do nothing;

  insert into public.user_xp (user_id)
  values (target_user_id)
  on conflict (user_id) do nothing;

  insert into public.user_streaks (user_id)
  values (target_user_id)
  on conflict (user_id) do nothing;
end;
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_v4_user_records(new.id, coalesce(new.email, ''));
  return new;
end;
$$;

select public.ensure_v4_user_records(id, coalesce(email, ''))
from auth.users;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_user_goals_updated_at on public.user_goals;
create trigger set_user_goals_updated_at
before update on public.user_goals
for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_user_daily_progress_updated_at on public.user_daily_progress;
create trigger set_user_daily_progress_updated_at
before update on public.user_daily_progress
for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_user_xp_updated_at on public.user_xp;
create trigger set_user_xp_updated_at
before update on public.user_xp
for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_user_streaks_updated_at on public.user_streaks;
create trigger set_user_streaks_updated_at
before update on public.user_streaks
for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_quest_definitions_updated_at on public.quest_definitions;
create trigger set_quest_definitions_updated_at
before update on public.quest_definitions
for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_user_quests_updated_at on public.user_quests;
create trigger set_user_quests_updated_at
before update on public.user_quests
for each row execute procedure public.set_current_timestamp_updated_at();
