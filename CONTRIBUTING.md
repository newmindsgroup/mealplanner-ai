# Contributing to MealPlan Assistant

Thank you for your interest in contributing to MealPlan Assistant! This document provides guidelines and context for developers joining the project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install && cd server && npm install && cd ..`
4. Copy `.env.example` to `.env` and configure your environment
5. Start the dev server: `npm run dev`

## 📁 Project Architecture

This is a full-stack application with:
- **Frontend:** React 18 + TypeScript + Vite (in `src/`)
- **Backend:** Node.js + Express (in `server/`)
- **Database:** MySQL (schema in `server/database/schema.sql`)
- **State:** Zustand with localStorage persistence (in `src/store/`)

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for detailed architecture documentation.

## 🔀 Branch Strategy

- `main` — Stable release branch
- `develop` — Integration branch for features
- `feature/*` — Individual feature branches
- `fix/*` — Bug fix branches

## 📝 Commit Messages

Use conventional commits:
```
feat: add pantry barcode scanning
fix: resolve dark mode toggle on settings page
docs: update API endpoint documentation
refactor: split useStore into domain-specific slices
chore: update dependencies
```

## 🎯 Priority Work Items

The following items are prioritized for the next development phase:

### Critical (Must Do)
1. **Frontend-Backend Integration** — Wire all 12 service files in `src/services/` to call the backend REST API instead of using localStorage
2. **Zustand Store Refactor** — Remove `persist` middleware for server-managed data, keep only UI preferences local
3. **Complete Food Database** — Finish remaining 26% of food entries with full blood type explanations

### Important
4. **Add Tests** — Unit tests for services/utilities, integration tests for API endpoints
5. **API Documentation** — Generate Swagger/OpenAPI spec from route definitions

### Nice to Have
6. **WebSocket Support** — Real-time household collaboration updates
7. **Redis Caching** — Cache frequently accessed data
8. **CI/CD Pipeline** — Automated testing and deployment

See [`docs/DEVELOPMENT_STATUS.md`](docs/DEVELOPMENT_STATUS.md) for complete status tracking.

## 🧪 Testing

Currently, no tests exist. When adding tests:
- Use **Vitest** for frontend unit tests
- Use **Jest + Supertest** for backend API tests
- Use **Playwright** or **Cypress** for e2e tests

## 🔒 Security Notes

- Never commit `.env` files or API keys
- The `.env` file is already in `.gitignore`
- User API keys are stored encrypted (AES-256) in the database
- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens use short-lived access + long-lived refresh pattern

## 📐 Code Style

- TypeScript strict mode is enabled
- ESLint is configured for React/TypeScript
- Tailwind CSS for styling (dark mode via `class` strategy)
- Components use functional style with hooks
- State management via Zustand (single store, will be refactored)

## 🤝 Pull Requests

1. Create a feature branch from `develop`
2. Make your changes with clear commit messages
3. Ensure no TypeScript errors: `npx tsc --noEmit`
4. Run linter: `npm run lint`
5. Create a PR with a clear description of changes
6. Reference related issues if applicable
