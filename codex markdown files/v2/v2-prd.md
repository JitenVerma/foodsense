# 🥗 Food Image → Macro Tracker  
## V2 Product Requirements Document (PRD)

---

## 1. Product Vision

V2 transforms the app from a **single-meal analyzer** into a **daily food tracking application**.

Users should be able to:
- log meals consistently
- view their eating history
- track daily macros
- navigate their diet over time

---

## 2. Goals

### Primary Goals
- Enable users to **save analyzed meals**
- Enable **daily meal tracking**
- Provide **historical visibility via calendar**
- Allow **editing and correction of meals**
- Provide **daily macro summaries**

### Secondary Goals
- Improve retention through habit formation
- Build foundation for future features (goals, insights, recommendations)

---

## 3. Non-Goals (V2)

- No social features
- No AI coaching
- No barcode scanning
- No wearable integrations
- No advanced analytics dashboards

---

## 4. Core V2 Features (In Scope)

### 1. Authentication
- Sign up
- Log in
- Log out

### 2. Meal Persistence
- Save analyzed meals
- Associate meals with users
- Store ingredient-level data

### 3. Meal Classification
- Assign meal type:
  - breakfast
  - lunch
  - dinner
  - snack
- Assign eaten date/time

### 4. Dashboard
- Show today's meals
- Show daily macro totals
- Quick add meal

### 5. Calendar View
- Monthly calendar
- Each day shows:
  - total calories
  - number of meals
- Click day → view meals

### 6. Meal Detail + Editing
- View full meal analysis
- Edit:
  - ingredients
  - grams
  - meal type
  - time
- Delete meal

---

## 5. Epics & User Stories

---

### EPIC 1: Authentication

#### User Stories
- As a user, I want to create an account so my data is saved
- As a user, I want to log in so I can access my meals
- As a user, I want to log out securely

---

### EPIC 2: Meal Logging

#### User Stories
- As a user, I want to upload a meal photo and save it
- As a user, I want to classify my meal (breakfast/lunch/dinner/snack)
- As a user, I want to set when I ate the meal
- As a user, I want to edit ingredients before saving

---

### EPIC 3: Meal Management

#### User Stories
- As a user, I want to view my saved meals
- As a user, I want to edit a saved meal
- As a user, I want to delete a meal

---

### EPIC 4: Dashboard

#### User Stories
- As a user, I want to see today’s meals
- As a user, I want to see total calories and macros for today
- As a user, I want to quickly add a new meal

---

### EPIC 5: Calendar & History

#### User Stories
- As a user, I want to see a calendar of my meals
- As a user, I want to click a date to view meals
- As a user, I want to review past eating habits

---

## 6. Pages

### 1. Public Landing Page
- Hero section
- App explanation
- CTA to sign up/login

### 2. Auth Pages
- Login
- Signup

### 3. Dashboard
- Today’s meals
- Macro totals
- Add meal button

### 4. Upload / Analyze Page
- Image upload
- Meal type selector
- Date/time selector
- Save button

### 5. Meal Detail Page
- Full analysis
- Editable ingredients
- Edit/save/delete

### 6. Calendar Page
- Monthly view
- Daily summary
- Click → day details

### 7. Daily Detail Page
- Meals grouped by type
- Daily totals

---

## 7. Database Entities

### User
- id
- email
- createdAt

### Meal
- id
- userId
- title
- mealType
- eatenAt
- imageUrl
- totalProtein
- totalCarbs
- totalFat
- totalCalories

### MealIngredient
- id
- mealId
- name
- grams
- category
- confidence
- protein
- carbs
- fat
- calories

---

## 8. API Endpoints

### Auth
- POST /auth/signup
- POST /auth/login
- POST /auth/logout

### Meals
- POST /api/v1/meals/analyze
- POST /api/v1/meals
- GET /api/v1/meals
- GET /api/v1/meals/:id
- PATCH /api/v1/meals/:id
- DELETE /api/v1/meals/:id

### Calendar
- GET /api/v1/calendar?month=YYYY-MM
- GET /api/v1/meals/by-date?date=YYYY-MM-DD

---

## 9. Success Metrics

- % of analyzed meals saved
- Meals logged per user per week
- Daily active users
- 7-day retention
- Calendar engagement

---

## 10. V2 Summary

V2 shifts the app from:
👉 "Analyze a meal"

To:
👉 "Track what you eat every day"