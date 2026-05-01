# Architecture Guide

## System Overview

MealPlan Assistant follows a full-stack architecture with a React SPA frontend and a Node.js/Express REST API backend backed by MySQL.

## Frontend Architecture

### Entry Flow
```
index.html
  └── src/main.tsx (async loader)
        ├── Shows loading spinner immediately
        ├── Loads App, BrowserRouter, AuthProvider, HouseholdProvider
        └── Renders App with full context providers

src/App.tsx
  ├── Error Boundary (catches all render errors)
  ├── Auth state check (isAuthenticated?)
  ├── Route definitions:
  │   ├── / → LandingPage (public)
  │   ├── /login → LoginPage
  │   ├── /register → RegisterPage
  │   ├── /forgot-password → ForgotPasswordPage
  │   ├── /accept-invitation → AcceptInvitationPage
  │   └── /dashboard/* → ProtectedRoute
  │         ├── If !onboardingComplete → OnboardingWizard
  │         └── If onboardingComplete → Layout (main dashboard)
  └── Toast notifications overlay
```

### State Management

The application uses **Zustand** with `persist` middleware, storing all state in `localStorage` under the key `meal-plan-assistant-storage`.

**Current store** (`src/store/useStore.ts` — 960 lines, 32KB):
- People/profiles management
- Meal plans and weekly plan state
- Grocery lists
- Label analysis results
- Pantry items, settings, and alerts
- Lab reports, alerts, and insights
- Chat messages
- Knowledge base files
- Favorites
- Settings (dark mode, voice, notifications)
- Progress/gamification
- Food guide customizations
- Email notifications

> **⚠️ REFACTORING NEEDED:** The store should be split into domain-specific slices and server-managed data should be fetched from the API rather than persisted locally.

### Context Providers
- **AuthContext** — Authentication state, login/register/logout methods
- **HouseholdContext** — Current household selection and membership
- **DemoContext** — Controls demo mode for the landing page

### Service Layer (`src/services/`)

29 service files handle business logic. Currently most operate on localStorage. They need to be updated to call the backend API.

**AI Services:**
- `aiService.ts` — Core AI client supporting OpenAI + Anthropic with retry logic, exponential backoff, and automatic provider fallback
- `aiMealPlanning.ts` — AI-powered meal plan generation with blood type context
- `chatService.ts` — Chat conversation management
- `recipeGeneration.ts` — AI recipe creation
- `foodInquiryService.ts` — Food compatibility Q&A
- `labExtractionAI.ts` — Lab result AI extraction

**Data Services:**
- `mealPlanning.ts` — Meal plan algorithms and data management
- `groceryList.ts` — Grocery list generation from meal plans
- `pantryService.ts` — Pantry CRUD and inventory logic
- `labelAnalysis.ts` — OCR + AI label analysis pipeline
- And 19 more service files for specific features

### Component Organization

Components follow a feature-based directory structure:
```
components/
├── auth/           # Authentication UI (7 files)
├── food-guide/     # Blood type food guide (7 files)
├── household/      # Household management (5 files)
├── invitations/    # Invitation system (3 files)
├── labs/           # Lab reports & analysis (6 files)
├── landing/        # Marketing landing page (9 files)
├── pantry/         # Pantry management (10 files)
├── profile/        # User profile (3 files)
└── [28 top-level component files]
```

## Backend Architecture

### Express Server (`server/index.js`)

```
Middleware Stack:
  1. Helmet (security headers)
  2. CORS (configured for frontend URL)
  3. Compression (gzip)
  4. Morgan (request logging)
  5. Body parser (JSON, 10MB limit)
  6. Rate limiter (100 req/15min per IP)
  7. Static file serving (/uploads)

Routes:
  /api/health     → Health check
  /api/auth       → Authentication (7 endpoints)
  /api/users      → User management (9 endpoints)
  /api/households → Household management (9 endpoints)
  /api/people     → Family members (5 endpoints)
  /api/meals      → Meal planning (8 endpoints)
  /api/pantry     → Pantry inventory (10 endpoints)
  /api/labs       → Lab reports (10 endpoints)
  /api/grocery    → Grocery lists (5 endpoints)
  /api/labels     → Label analysis (4 endpoints)
  /api/chat       → AI chat (5 endpoints)
  /api/knowledge  → Knowledge base (5 endpoints)
  /api/import     → Data import (1 endpoint)

Error Handling:
  404 handler → notFoundHandler
  Global → errorHandler
```

### Database Layer (`server/config/database.js`)

Uses `mysql2/promise` with connection pooling:
- `pool` — MySQL2 connection pool (10 connections)
- `query(sql, params)` — Execute query with error handling
- `queryOne(sql, params)` — Get single row
- `transaction(callback)` — Transaction wrapper with auto-rollback

### Authentication Flow

```
Register → bcrypt hash → Store user → Generate JWT + Refresh Token
Login → Verify bcrypt → Generate JWT + Refresh Token → Store refresh in DB
Request → Extract Bearer token → Verify JWT → Attach user to request
Refresh → Verify refresh token → Generate new JWT pair → Rotate refresh token
```

### AI Service (`server/services/aiService.js`)

Server-side AI proxy that:
1. Checks for user's encrypted API key first
2. Falls back to system-wide API keys
3. Supports both OpenAI and Anthropic
4. Handles meal generation, label analysis, and chat

## Data Flow

### Current (localStorage mode):
```
User Action → Component → Service → Zustand Store → localStorage
```

### Target (full-stack mode):
```
User Action → Component → Service → API Call → Express Route → MySQL
                                         ↓
                              Zustand Store (cache/UI state only)
```

## Key Design Decisions

1. **Blood Type Diet as Core Paradigm** — All features revolve around the 8 blood type variants (O+/-, A+/-, B+/-, AB+/-)
2. **Frontend-First Development** — The app was built frontend-first with localStorage, backend added later
3. **Dual AI Provider** — Automatic failover between OpenAI and Anthropic for reliability
4. **Per-User API Keys** — Users can bring their own keys, stored with AES-256 encryption
5. **cPanel Target** — Deployment optimized for shared hosting, not cloud platforms
6. **No Medical Claims** — AI responses are purely educational and factual
