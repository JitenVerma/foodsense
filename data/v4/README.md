# Food Sense V4 Database Migrations

These SQL files extend the existing V2 Supabase schema for the V4 gamified progression system.

Assumptions:

- The base V2 schema in [data/supabase](C:/Users/jiten/Documents/software-projects/foodsense/data/supabase) has already been applied.
- `auth.users` is the source of truth for user identity.
- `profiles` already exists and is reused as the V4 profile foundation instead of creating a second overlapping profile table.

Run these files in order:

1. `001_core_gamification_schema.sql`
2. `002_backfill_and_triggers.sql`
3. `003_rls.sql`
4. `004_seed_quests.sql`

What gets added:

- richer `profiles` fields for health inputs and timezone
- `user_goals`
- `user_daily_progress`
- `user_xp`
- `xp_events`
- `user_streaks`
- `quest_definitions`
- `user_quests`
- `meals` support for favorites, reusable templates, and meal reuse lineage

Design choices:

- user-owned data is separated into focused one-to-one or one-to-many tables
- `user_daily_progress` is denormalized for efficient dashboard and streak queries
- `xp_events` provides an auditable event log while `user_xp` stores the current summary
- `quest_definitions` is shared/static data, while `user_quests` stores user-period progress
