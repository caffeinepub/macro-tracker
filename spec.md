# Macro & Calorie Tracker

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Food entry logging: name, calories, protein (g), carbs (g), fat (g), optional meal tag (breakfast/lunch/dinner/snack)
- Daily dashboard showing total calories and macro breakdown (protein, carbs, fat) for today
- Daily calorie/macro goal setting (stored per user)
- Food log list showing all entries for the selected day with ability to delete entries
- Date navigation to view past days
- Summary progress bars for macros vs goals

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: food entry data model (id, date, name, calories, protein, carbs, fat, meal tag), daily goals model
2. Backend APIs: addFoodEntry, getFoodEntriesByDate, deleteFoodEntry, setDailyGoals, getDailyGoals
3. Frontend: single-page app with date picker header, daily summary card (calories + macro bars), add food entry form (modal/drawer), food log list with delete, goals settings modal
4. Minimal, clean UI with clear typography and subtle visual hierarchy
