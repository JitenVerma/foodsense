Perfect choice — **Option A (Retro Arcade Health Tracker)** is the most distinctive and engaging direction. This PRD will be written so **Codex can directly act on it**, with clear UI/UX, system, and implementation guidance.

---

# 📄 V3 PRD — Retro Arcade Health Tracker UI/UX Redesign

```markdown
# 🕹️ Food Sense — V3 Product Requirements Document
## Retro Arcade Health Tracker Theme

---

## 1. Product Vision

V3 transforms the application into a **retro arcade-style health tracker**, where:

- Meals feel like collected items
- Macros feel like player stats
- Daily progress feels like a game loop
- The UI evokes nostalgia while remaining clean and usable

The experience should feel like:
👉 "Tracking your nutrition inside a retro game interface"

---

## 2. Goals

### Primary Goals
- Redesign the UI with a **retro arcade aesthetic**
- Improve user engagement through **visual feedback and gamification**
- Enhance usability with **clear structure and hierarchy**
- Make the app feel **alive, interactive, and rewarding**

### Secondary Goals
- Improve retention through habit-forming UI
- Establish a strong and memorable design identity
- Prepare foundation for future gamification features

---

## 3. Non-Goals

- No major backend logic changes
- No changes to core AI pipeline
- No new data models required
- No social or multiplayer features
- No heavy animations that hurt performance

---

## 4. Design Direction

### Theme
**Retro Arcade Health Tracker**

Inspired by:
- arcade HUDs
- pixel RPG stat panels
- retro inventory systems
- neon + dark UI contrast

---

## 5. Visual Design System

---

### 5.1 Color Palette

#### Base Colors
- Background: `#0F1226` (deep navy)
- Surface: `#1A1F3A`
- Panel: `#242B4D`
- Border: `#5B648F`

#### Text
- Primary: `#F2F5FF`
- Secondary: `#AAB3D9`

#### Accent Colors (semantic)
- Protein: `#3BE8B0` (green)
- Carbs: `#4CC9FF` (cyan)
- Fat: `#FFB347` (orange)
- Calories: `#FF5DA2` (magenta)

#### UI States
- Success: `#3BE8B0`
- Warning: `#F7E26B`
- Error: `#FF4D4D`

---

### 5.2 Typography

#### Dual-font system

1. Pixel-inspired font (for UI labels)
   - section headers
   - badges
   - buttons
   - stat labels

2. Clean sans-serif (for readability)
   - meal names
   - ingredient lists
   - descriptions
   - timestamps

---

### 5.3 Component Styling Rules

#### Cards / Panels
- Sharp or lightly rounded corners
- Strong visible borders
- No soft shadows
- Use layered or inset panel effect

#### Shadows
- Hard offset shadow (pixel style)
- Example:
  - offset: 4px 4px
  - dark color

#### Buttons
- Thick borders
- Solid fill
- Pixel-style hover:
  - brighten
  - slight lift
- Active:
  - slight inset effect

---

## 6. Layout Redesign

---

### 6.1 Dashboard Layout

#### Structure

```

HEADER (HUD BAR)
↓
GREETING + DAILY STATUS
↓
MAIN GRID

LEFT:

* Stat panels (macros)

RIGHT:

* Quest log / quick actions

BOTTOM:

* Meal inventory (today’s meals)

```

---

### 6.2 Header (HUD Bar)

#### Features
- App name/logo (left)
- Day / streak (center)
- Profile dropdown (right)

#### Example

```

FOOD SENSE XP   DAY 5 STREAK   ⚙ PROFILE

```

---

### 6.3 Greeting Section

Add personalization:

```

Good afternoon, Jiten 👋
You’ve logged 1 meal today

```

---

### 6.4 Stat Panels (Macros)

Replace current macro card with **4 stat panels**

Each panel includes:
- label (pixel font)
- value
- target
- progress bar

Example:

```

PROTEIN
43.9g / 120g
█████░░░░░

```

---

### 6.5 Meal Inventory (CRITICAL)

Meals should look like **inventory items**

#### Replace current cards with:

- left: image thumbnail
- center: title + metadata
- right: macro summary

Example:

```

[IMG] BREAKFAST
Creamy Chicken Gnocchi
10:30 AM

P:43g  C:77g  F:24g     802 kcal

```

---

### 6.6 Meal Grouping

Group meals by type:

- Breakfast
- Lunch
- Dinner
- Snacks

Each section should be visually separated.

---

### 6.7 Quick Actions (Quest Log)

Add side panel:

```

QUEST LOG

* Add lunch
* Review meals
* Open calendar

```

---

### 6.8 Floating CTA

Add floating button:

```

* ADD MEAL

```

Position:
- bottom-right on mobile
- top-right or fixed on desktop

---

## 7. UI Components to Build

---

### Core Components

- `StatPanel`
- `MacroProgressBar`
- `MealInventoryCard`
- `MealGroupSection`
- `QuestPanel`
- `FloatingAddButton`
- `HUDHeader`
- `ToastNotification`

---

## 8. Microinteractions

---

### Required interactions

#### Hover
- cards lift slightly
- borders glow subtly

#### Click
- button depress effect

#### Save meal
Show toast:
```

Meal saved successfully ✅

```

#### Loading
```

Analyzing your meal...

```

---

## 9. UX Improvements

---

### 9.1 Immediate Feedback

Always show:
- meals logged today
- calories consumed
- macro progress

---

### 9.2 Clear Next Action

Every screen must have:
- primary CTA (Add meal)
- secondary actions (calendar, edit)

---

### 9.3 Editable UX

User must be able to:
- edit ingredients
- remove inferred items
- adjust grams

---

### 9.4 Visual Hierarchy

Strong separation:
- stats (high priority)
- meals (medium)
- actions (supporting)

---

## 10. Navigation Redesign

---

### Replace button cluster with nav bar

```

[Logo] Dashboard Calendar

```
    + Add Meal   Profile
```

```

---

## 11. Background Design

---

### Requirements

- dark base color
- subtle grid or pixel pattern
- low opacity noise texture

### Avoid
- heavy textures
- distracting visuals

---

## 12. Gamification Layer (Light)

---

Add subtle features:

- daily streak counter
- “1 meal logged today”
- “progress towards goal”
- simple insights:

```

You’re 35% towards your protein goal

```

---

## 13. API Changes (Minimal)

No major changes required.

Optional additions:
- GET daily summary
- GET weekly summary

---

## 14. Frontend Requirements

---

### Must implement

- new layout structure
- new component system
- retro styling
- stat panels
- grouped meals
- hover/interaction states

---

## 15. Acceptance Criteria

---

### Visual
- UI reflects retro arcade theme
- consistent color usage
- consistent panel styling

### UX
- user can quickly:
  - see today’s progress
  - add a meal
  - view meals
- interactions feel responsive

### Performance
- no lag from heavy styling
- animations are lightweight

---

## 16. Implementation Strategy

---

### Phase 1
- define design system (colors, typography, spacing)

### Phase 2
- rebuild dashboard layout

### Phase 3
- update meal cards

### Phase 4
- add interactions and polish

---

## 17. Summary

V3 upgrades the app from:

👉 functional tracker

to:

👉 **engaging retro arcade experience**

Users should feel like:
- they are progressing
- they are interacting
- the app is rewarding

The UI should be:
- playful
- structured
- clear
- memorable
```