# 🍽️ MealPlan Assistant

> **AI-powered nutrition planning with blood type compatibility, family household management, pantry tracking, lab report analysis, and intelligent meal generation.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Current Status](#current-status)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

MealPlan Assistant is a comprehensive web application that generates personalized weekly meal plans based on the **Blood Type Diet** (D'Adamo protocol). It considers each family member's blood type (all 8 variants: O+, O-, A+, A-, B+, B-, AB+, AB-), allergies, dietary restrictions, and health goals to create optimized nutrition plans.

The application combines a **React/TypeScript frontend** with a **Node.js/Express backend** and **MySQL database**, powered by AI services from **OpenAI (GPT-4)** and **Anthropic (Claude 3.5 Sonnet)** for intelligent meal generation, food label analysis, and conversational assistance.

### Who Is This For?

- Health-conscious individuals following or exploring the Blood Type Diet
- Families who need to plan meals for multiple members with different blood types
- Users who want AI-powered nutritional guidance and meal planning
- Anyone tracking pantry inventory, lab results, and grocery lists in one place

---

## Key Features

### 🧬 Core Nutrition Engine
- **Blood Type Meal Planning** — Weekly 7-day plans (breakfast, lunch, dinner, snack) with per-blood-type food compatibility
- **Multi-Person Planning** — Family-based plans that merge compatible foods across household members
- **218KB Food Database** — 101 foods with detailed compatibility explanations for all 8 blood types
- **AI Meal Generation** — GPT-4 / Claude-powered contextual meal suggestions with rationale

### 📱 Label & Barcode Scanning
- **OCR Label Analysis** — Camera capture or image upload → Tesseract.js text extraction → AI ingredient analysis
- **Blood Type Conflict Detection** — Flags ingredients that conflict with your blood type
- **Barcode Scanning** — ZXing library integration for pantry item identification
- **Safety Flagging** — Additive identification and safety scoring

### 🏠 Household Management
- **Multi-User Households** — Create households with owner/admin/member roles
- **Email Invitations** — Token-based invitation system for household members
- **Family Profiles** — Individual profiles per family member with blood type, allergies, goals

### 🥫 Pantry Management
- **Full Inventory Tracking** — Items with categories, quantities, locations, expiration dates
- **Low Stock & Expiration Alerts** — Configurable notifications
- **Barcode Scanning** — Quick add items via barcode
- **CSV Bulk Import** — Import pantry data from spreadsheets
- **Usage History Tracking** — Track consumption patterns over time

### 🔬 Lab Report Analysis
- **OCR Lab Scanning** — Scan lab reports via camera/upload
- **AI Result Extraction** — Intelligent parsing of lab values
- **Trend Tracking** — Visualize lab result trends over time with Recharts
- **Abnormality Alerts** — Flag out-of-range results with severity levels
- **Educational Content** — 29KB educational database explaining lab markers

### 💬 AI Chat Assistant
- **Conversational Interface** — Natural language meal planning assistance
- **Context-Aware** — Considers your blood type, preferences, and pantry contents
- **Recipe Generation** — AI-generated recipes with ingredients and instructions
- **Food Inquiries** — Ask about any food's compatibility with your blood type

### 📊 Additional Features
- **Grocery List Generation** — Auto-generated categorized shopping lists from meal plans
- **Voice Integration** — Speech-to-text input and text-to-speech output (Web Speech API)
- **Progress Gamification** — XP, levels, streaks, badges with confetti effects
- **Favorites System** — Save and organize favorite meals
- **Knowledge Base** — Upload PDFs, recipes, notes for AI context
- **PDF/Print Export** — Export meal plans, grocery lists, lab reports
- **Dark Mode** — Full dark theme with class-based Tailwind toggle
- **PWA Support** — Installable app with offline capabilities
- **Email Notifications** — Configurable SMTP-based email alerts

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│          React 18 + TypeScript + Vite                │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Components│  │ Services │  │  Zustand Store    │  │
│  │ (28+8dirs)│  │ (29 files│  │  (localStorage)   │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│         │              │                             │
│         └──────────────┘                             │
│                │  ⚠️ Currently uses localStorage     │
│                │     Backend integration pending      │
└────────────────┼────────────────────────────────────┘
                 │
                 │  REST API (when connected)
                 ▼
┌─────────────────────────────────────────────────────┐
│                    Backend                           │
│           Node.js + Express + MySQL                  │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ 12 Route │  │Middleware │  │   AI Service     │  │
│  │  Files   │  │Auth/Valid │  │ OpenAI+Anthropic │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│         │                                            │
│         ▼                                            │
│  ┌──────────────────────────────────────────────┐   │
│  │         MySQL Database (25 tables)            │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework |
| TypeScript | 5.2 | Type safety |
| Vite | 5.0 | Build tool & dev server |
| Tailwind CSS | 3.3 | Utility-first styling |
| Zustand | 4.4 | State management |
| React Router | 6.20 | Client-side routing |
| Tesseract.js | 5.0 | OCR text extraction |
| Recharts | 2.10 | Data visualization |
| @zxing | 0.20 | Barcode scanning |
| Lucide React | 0.294 | Icon library |
| jsPDF | 2.5 | PDF generation |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Express | 4.18 | HTTP framework |
| MySQL2 | 3.6 | Database driver |
| bcryptjs | 2.4 | Password hashing |
| jsonwebtoken | 9.0 | JWT authentication |
| Joi | 17.11 | Request validation |
| Helmet | 7.1 | Security headers |
| Nodemailer | 6.9 | Email sending |
| Multer | 1.4 | File uploads |

### AI Providers
| Provider | Model | Usage |
|---|---|---|
| OpenAI | GPT-4 Turbo | Meal generation, chat, label analysis |
| Anthropic | Claude 3.5 Sonnet | Preferred provider (when both configured) |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MySQL** 5.7+ or MariaDB 10.3+
- **API Key** — OpenAI or Anthropic (at least one required for AI features)

### Quick Start (Frontend Only)

The frontend works standalone in demo/mock mode using localStorage:

```bash
# Clone the repository
git clone https://github.com/newmindsgroup/mealplanner-ai.git
cd mealplanner-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your API key(s)

# Start development server
npm run dev

# Open http://localhost:5173
```

### Full Stack Setup

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd server && npm install && cd ..

# 3. Create and configure environment
cp .env.example .env
# Edit .env with your database credentials and API keys

# 4. Set up MySQL database
mysql -u root -p -e "CREATE DATABASE mealplan_assistant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p mealplan_assistant < server/database/schema.sql

# 5. Start backend (terminal 1)
cd server && npm run dev

# 6. Start frontend (terminal 2)
npm run dev
```

### Production Build

```bash
npm run build
# Output in public/ directory
```

---

## Project Structure

```
mealplanner-ai/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── auth/                 # Login, Register, ForgotPassword, ProtectedRoute
│   │   ├── food-guide/           # Blood type food guide components
│   │   ├── household/            # Household management UI
│   │   ├── invitations/          # Invitation accept/send UI
│   │   ├── labs/                 # Lab report dashboard, scanner, history
│   │   ├── landing/              # Marketing landing page sections
│   │   ├── pantry/               # Pantry management (inventory, barcode, import)
│   │   ├── profile/              # User profile & account settings
│   │   ├── ChatPanel.tsx         # AI chat interface
│   │   ├── WeeklyPlanView.tsx    # 7-day meal plan display
│   │   ├── LabelAnalyzer.tsx     # OCR label scanning
│   │   ├── GroceryListView.tsx   # Shopping list management
│   │   ├── OnboardingWizard.tsx  # First-time setup wizard
│   │   └── ...                   # 28 component files total
│   ├── services/                 # Business logic & API calls (29 files)
│   ├── store/                    # Zustand state management
│   │   └── useStore.ts           # Central store (32KB)
│   ├── types/                    # TypeScript type definitions (10 files)
│   ├── data/                     # Static data
│   │   ├── bloodTypeFoods.ts     # Food compatibility database (218KB)
│   │   ├── demoData.ts           # Demo/sample data
│   │   └── labEducation.ts       # Lab test educational content
│   ├── contexts/                 # React contexts (Auth, Household, Demo)
│   ├── hooks/                    # Custom hooks (useVoiceReader)
│   ├── utils/                    # Utility functions (10 files)
│   ├── styles/                   # Additional CSS
│   ├── templates/                # Email HTML templates
│   ├── App.tsx                   # Root component with routing
│   ├── main.tsx                  # Entry point
│   ├── config.ts                 # Runtime configuration
│   └── index.css                 # Global styles + Tailwind
├── server/                       # Backend API
│   ├── config/                   # Server & database configuration
│   ├── database/                 # MySQL schema & migrations
│   ├── middleware/               # Auth, validation, error handling
│   ├── routes/                   # API route handlers (12 files)
│   ├── services/                 # Server-side AI service
│   ├── utils/                    # Encryption utilities
│   ├── index.js                  # Express server entry point
│   └── package.json              # Backend dependencies
├── install/                      # PHP web installer (for cPanel)
├── docs/                         # Project documentation
│   ├── FEATURES.md              # Complete feature reference (19 modules)
│   ├── USE_CASES.md             # 25 user scenarios with step-by-step flows
│   ├── ARCHITECTURE.md           # Detailed architecture guide
│   ├── API_ENDPOINTS.md          # Complete API reference
│   ├── DATABASE_SCHEMA.md        # Database design documentation
│   ├── DEPLOYMENT.md             # Deployment guide (cPanel, PM2)
│   ├── DEVELOPMENT_STATUS.md     # Current progress & remaining work
│   └── AI_CONTEXT.md             # AI/IDE context for development tools
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore rules
├── package.json                  # Frontend dependencies & scripts
├── vite.config.ts                # Vite build configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── ecosystem.config.js           # PM2 process manager config
├── CONTRIBUTING.md               # Contribution guidelines
├── LICENSE                       # MIT License
└── README.md                     # This file
```

---

## API Reference

The backend exposes **35+ REST API endpoints** across 12 route groups. See [`docs/API_ENDPOINTS.md`](docs/API_ENDPOINTS.md) for the complete reference.

### Route Groups Overview

| Route Group | Base Path | Endpoints | Description |
|---|---|---|---|
| Auth | `/api/auth` | 7 | Register, login, logout, refresh, password reset, email verify |
| Users | `/api/users` | 9 | Profile, settings, API keys, progress, account management |
| Households | `/api/households` | 9 | CRUD, invites, join/leave, member roles |
| People | `/api/people` | 5 | Family member profiles |
| Meals | `/api/meals` | 8 | Meal plans, favorites |
| Pantry | `/api/pantry` | 10 | Items, settings, alerts, statistics |
| Labs | `/api/labs` | 10 | Reports, results, alerts, insights, trends |
| Grocery | `/api/grocery` | 5 | Grocery lists |
| Labels | `/api/labels` | 4 | Label analysis with AI |
| Chat | `/api/chat` | 5 | AI chat sessions |
| Knowledge | `/api/knowledge` | 5 | File uploads, search |
| Import | `/api/import` | 1 | Data migration |

---

## Database Schema

MySQL schema with **25 tables**. See [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) for full details.

### Core Tables
- `users` — Authentication and core user data
- `user_profiles` — Extended preferences and settings
- `households` — Multi-family household groups
- `household_members` — User-household membership with roles
- `people` — Family member profiles (blood type, allergies, goals)

### Feature Tables
- `meal_plans`, `meals`, `favorite_meals` — Meal planning data
- `grocery_lists` — Shopping lists
- `pantry_items`, `pantry_settings`, `low_stock_alerts`, `expiration_alerts` — Pantry management
- `lab_reports`, `lab_results`, `lab_alerts`, `lab_insights` — Lab tracking
- `label_analyses` — Food label scan results
- `knowledge_base_files` — Uploaded documents
- `chat_history` — AI conversation logs
- `notifications`, `email_notifications` — Alert system
- `user_food_guides`, `food_inquiries` — Food guide customizations
- `user_progress` — Gamification tracking
- `refresh_tokens`, `api_keys` — Security

---

## Current Status

> **See [`docs/DEVELOPMENT_STATUS.md`](docs/DEVELOPMENT_STATUS.md) for the complete breakdown.**

### ✅ Complete
- Full React frontend UI with 28+ components and 8 component subdirectories
- Backend API with 35+ endpoints and middleware
- MySQL schema with 25 tables
- AI integration (OpenAI + Anthropic with retry/fallback)
- OCR label and barcode scanning
- Voice input/output
- PWA configuration
- Dark mode, gamification, PDF export
- Landing page with interactive demos
- Deployment tooling (cPanel, PM2)

### ⚠️ Remaining Critical Work
1. **Frontend ↔ Backend Integration** — All 12 frontend service files must be updated to call backend APIs instead of using localStorage
2. **Zustand Store Refactor** — Separate server-managed state from UI-only state
3. **Food Database Completion** — 26% of foods (~26 items) need full blood type explanations

### ❌ Not Yet Started
- Automated tests (unit, integration, e2e)
- WebSocket real-time updates
- API documentation (Swagger/OpenAPI)
- Redis caching
- CI/CD pipeline

---

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for detailed instructions.

### Quick Deploy (cPanel)
```bash
./deploy-to-cpanel.sh
# Upload generated ZIP to cPanel → extract in public_html
# Rename config.example.js → config.js and add API key
```

### PM2 (VPS/Dedicated)
```bash
npm run build
pm2 start ecosystem.config.js
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
