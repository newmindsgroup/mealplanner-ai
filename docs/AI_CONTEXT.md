# AI & IDE Development Context

> This file provides context for AI coding assistants (Copilot, Cursor, Antigravity, Claude, etc.) and new developers working on this project.

## Project Identity

- **Name:** MealPlan Assistant
- **Type:** Full-stack web application (React + Express + MySQL)
- **Domain:** AI-powered nutrition planning based on the Blood Type Diet
- **License:** MIT

## Core Concepts

### Blood Type Diet
The entire app revolves around the Blood Type Diet (D'Adamo protocol). Every food is classified as **beneficial**, **neutral**, or **avoid** for each of 8 blood types: `O+`, `O-`, `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`. The base type (without Rh factor) determines food compatibility.

### Key TypeScript Types (from `src/types/index.ts`)
```typescript
type BloodType = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type FoodCategory = 'proteins' | 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'oils' | 'nuts-seeds' | 'beverages' | 'spices' | 'sweeteners';
```

### AI Response Style
AI responses must be **purely educational and factual**. No medical disclaimers. Focus on biochemistry, lectins, enzyme interactions, and Blood Type Diet science.

## Architecture Quick Reference

- **Frontend:** `src/` — React 18, TypeScript, Vite, Tailwind, Zustand
- **Backend:** `server/` — Express, MySQL2, JWT, bcrypt
- **State:** Zustand with `persist` → localStorage (needs refactor to API)
- **AI:** Dual provider (OpenAI GPT-4 + Anthropic Claude 3.5 Sonnet)
- **Entry:** `src/main.tsx` → `src/App.tsx` → routing
- **Store:** `src/store/useStore.ts` — single 960-line monolith
- **Food Data:** `src/data/bloodTypeFoods.ts` — 218KB, 101 foods

## Critical Context for Modifications

### When editing services (`src/services/`):
- Currently all use localStorage — they're being migrated to call `/api/*` endpoints
- Use `getApiUrl()` from `src/config.ts` for API base URL
- The auth service has a mock mode fallback — remove it during integration

### When editing the store (`src/store/useStore.ts`):
- This file is a monolith — be careful with state shape changes
- All data persists to localStorage key `meal-plan-assistant-storage`
- Plan is to split into slices and remove `persist` for server data

### When editing food data (`src/data/bloodTypeFoods.ts`):
- Each food needs: `healthBenefits`, `mealTypes`, `detailedExplanations` (for all 8 blood types)
- Use `verifyFoodDatabase()` from `src/utils/verifyFoodDatabase.ts` to check completion
- Follow the established format of existing completed entries

### When editing backend routes (`server/routes/`):
- All routes use JWT auth middleware from `server/middleware/auth.js`
- Validation uses Joi schemas from `server/middleware/validation.js`
- Database queries use helpers from `server/config/database.js`
- Error handling via `server/middleware/errorHandler.js`

## File Size Reference (Largest Files)

| File | Size | Notes |
|---|---|---|
| `src/data/bloodTypeFoods.ts` | 218KB | Food database — consider code splitting |
| `src/components/pantry/AddPantryItemModal.tsx` | 42KB | Complex modal — may need refactoring |
| `src/store/useStore.ts` | 32KB | Monolith store — needs splitting |
| `src/data/labEducation.ts` | 29KB | Lab educational content |
| `src/data/demoData.ts` | 24KB | Demo data for landing page |
| `server/database/schema.sql` | 22KB | Full MySQL schema |

## Environment Setup

```bash
cp .env.example .env  # Then fill in values
npm install           # Frontend deps
cd server && npm install  # Backend deps
npm run dev           # Start Vite on :5173
cd server && npm run dev  # Start Express on :3001
```

## Testing (Not Yet Implemented)

No tests exist. Recommended stack:
- **Frontend:** Vitest + React Testing Library
- **Backend:** Jest + Supertest
- **E2E:** Playwright
