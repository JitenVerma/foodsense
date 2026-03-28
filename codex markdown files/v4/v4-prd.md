# 🕹️ Food Sense — V4 Product Requirements Document
## Gamified Health Progression System

---

## 1. Product Vision

V4 transforms Food Sense from a tracking app into a **gamified health progression system**.

Users should feel like they are:

- progressing daily
- leveling up their health
- completing quests
- maintaining streaks
- improving their real-life stats

The experience should feel like:

👉 “A retro arcade game where your real-life health is your character progression”

---

## 2. Core Product Loop

The app must reinforce this loop:

Log Meal → See Progress → Earn XP → Complete Goals → Maintain Streak → Repeat

---

## 3. Goals

### Primary Goals
- Increase user retention via gamification
- Provide personalized health targets
- Create a rewarding feedback system
- Encourage daily engagement

### Secondary Goals
- Build foundation for coaching and recommendations
- Enable long-term behavior change
- Improve user satisfaction and motivation

---

## 4. Non-Goals

- No multiplayer features
- No complex coaching AI (yet)
- No social sharing systems
- No advanced wearable integrations

---

## 5. Core V4 Features

---

## 5.1 Player Profile System

### Purpose
Create a personalized foundation for health tracking and goal setting.

### Features

#### Editable Profile Page
Users can edit:

- name
- age
- height
- weight
- gender (optional)

#### Lifestyle Inputs
- activity level:
  - sedentary
  - lightly active
  - moderately active
  - very active

- job type:
  - desk-based
  - mixed
  - active

#### Exercise Inputs
- strength training (yes/no)
- cardio (yes/no)
- sessions per week
- desired sessions per week

---

### Derived Metrics (Auto-calculated)

- BMR
- TDEE
- daily calorie target
- protein target
- fat target
- carb target

---

## 5.2 Goal System

### Purpose
Provide direction and meaning to tracking.

### Features

Users can select:

- goal type:
  - lose weight
  - maintain
  - gain weight

- target weight
- optional timeframe

---

### Daily Targets

Automatically generated:
- calorie goal
- protein goal
- carb goal
- fat goal

---

### UI

All targets must be visualized as:

- progress bars
- percentage completion
- color-coded feedback

---

## 5.3 XP and Leveling System

### Purpose
Drive engagement and habit formation.

---

### XP Rules

Users earn XP for:

- logging a meal → +10 XP
- hitting protein goal → +20 XP
- staying within calorie target → +30 XP
- completing full day → +50 XP
- maintaining streak → bonus XP

---

### Level System

- Level increases based on total XP
- XP thresholds increase progressively

Example:

- Level 1 → 0 XP
- Level 2 → 100 XP
- Level 3 → 250 XP
- Level 4 → 500 XP

---

### UI

- display level in header
- show XP progress bar
- show XP gained after actions

---

## 5.4 Streak System

### Purpose
Encourage consistency.

---

### Streak Types

#### Logging Streak
- at least one meal logged per day

#### Full Day Streak
- breakfast + lunch + dinner logged

#### Goal Streak
- stayed within calorie target

---

### Features

- current streak
- longest streak
- streak reset logic

---

### UI

- 🔥 streak indicator in header
- warning when streak is about to break

---

## 5.5 Quest System

### Purpose
Turn behavior into objectives.

---

### Daily Quests

Examples:

- log 3 meals
- hit protein goal
- stay within calories

---

### Weekly Quests

Examples:

- log meals 5 days this week
- hit calorie target 3 days
- complete 10 meals

---

### Quest State

- active
- completed
- failed

---

### UI

Quest panel showing:
- checklist
- progress
- completion rewards

---

## 5.6 Insights System

### Purpose
Provide actionable feedback.

---

### Examples

- “You are consistently under your protein goal”
- “You exceeded fat intake today”
- “Great job staying within calorie target 3 days in a row”

---

### Placement

- dashboard
- end-of-day summary

---

## 5.7 Meal Library

### Purpose
Reduce friction and increase reuse.

---

### Features

- save meals
- reuse meals
- favorite meals

---

## 6. Pages

---

### 1. Profile Page
- edit personal data
- edit goals
- view calculated targets

---

### 2. Dashboard (Enhanced)

Add:
- XP progress
- streak
- daily stats
- insights
- quest preview

---

### 3. Progress Page

- weekly summary
- macro trends
- streak history

---

### 4. Quest Page

- daily quests
- weekly quests
- completion status

---

### 5. Meal Library Page

- saved meals
- quick reuse

---

## 7. API Endpoints

---

### Profile
- GET /api/v1/profile
- PATCH /api/v1/profile

---

### Goals
- GET /api/v1/goals
- PATCH /api/v1/goals

---

### XP
- GET /api/v1/xp
- POST /api/v1/xp/add

---

### Streaks
- GET /api/v1/streaks

---

### Quests
- GET /api/v1/quests/daily
- GET /api/v1/quests/weekly

---

### Progress
- GET /api/v1/progress/today
- GET /api/v1/progress/week

---

## 8. Database Entities

---

### user_profile
- user_id
- height
- weight
- age
- activity_level
- job_type

---

### user_goals
- user_id
- goal_type
- target_weight
- calorie_target
- protein_target
- carb_target
- fat_target

---

### user_progress
- user_id
- date
- calories
- protein
- carbs
- fat

---

### user_xp
- user_id
- total_xp
- level

---

### user_streaks
- user_id
- current_streak
- longest_streak

---

### quests
- id
- type (daily/weekly)
- description

---

### user_quests
- user_id
- quest_id
- status
- progress

---

## 9. UX Requirements

---

### Feedback must be immediate

After actions:
- show XP gain
- update stats instantly
- update streak

---

### Always show progress

- macro progress
- XP progress
- streak

---

### Keep interactions fast

- minimal friction logging
- quick edits
- reusable meals

---

## 10. Success Metrics

---

- daily active users
- meals logged per user
- streak length
- retention (7-day, 30-day)
- quest completion rate

---

## 11. Implementation Strategy

---

### Phase 1
- profile + goals
- target calculation
- dashboard updates

---

### Phase 2
- XP system
- streak system

---

### Phase 3
- quests
- insights

---

### Phase 4
- meal library
- progress page

---

## 12. Summary

V4 transforms the app from:

👉 “tracking tool”

to:

👉 “gamified health progression system”

Users should feel:
- rewarded
- motivated
- engaged

The app should feel:
- interactive
- personalized
- addictive (in a healthy way)