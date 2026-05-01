# API Endpoints Reference

All endpoints are prefixed with `/api`. Authentication is via JWT Bearer token unless marked as public.

## Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login with email/password |
| POST | `/auth/logout` | Token | Logout and invalidate refresh token |
| POST | `/auth/refresh` | Token | Refresh access token |
| POST | `/auth/forgot-password` | Public | Request password reset email |
| POST | `/auth/reset-password` | Public | Reset password with token |
| POST | `/auth/verify-email` | Public | Verify email with token |

## User Management (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | Token | Get current user profile |
| PATCH | `/users/me` | Token | Update profile (name, avatar) |
| PATCH | `/users/settings` | Token | Update app settings |
| PATCH | `/users/preferences` | Token | Update dietary preferences |
| POST | `/users/api-keys` | Token | Store encrypted API key |
| GET | `/users/api-keys` | Token | List configured API key providers |
| PATCH | `/users/password` | Token | Change password |
| GET | `/users/progress` | Token | Get gamification progress |
| POST | `/users/progress/xp` | Token | Add XP points |
| DELETE | `/users/account` | Token | Delete account and all data |

## Household Management (`/api/households`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/households` | Token | List user's households |
| POST | `/households` | Token | Create new household |
| GET | `/households/:id` | Token | Get household details |
| PATCH | `/households/:id` | Token | Update household settings |
| DELETE | `/households/:id` | Token | Delete household (owner only) |
| POST | `/households/:id/invite` | Token | Generate invite code |
| POST | `/households/join/:code` | Token | Join household via invite code |
| POST | `/households/:id/leave` | Token | Leave household |
| PATCH | `/households/:id/members/:userId/role` | Token | Update member role |

## People / Family Members (`/api/people`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/people` | Token | List family members |
| POST | `/people` | Token | Add family member |
| GET | `/people/:id` | Token | Get person details |
| PATCH | `/people/:id` | Token | Update person |
| DELETE | `/people/:id` | Token | Remove person |

## Meal Planning (`/api/meals`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/meals/plans` | Token | List meal plans |
| POST | `/meals/plans` | Token | Generate AI meal plan |
| GET | `/meals/plans/:id` | Token | Get plan details |
| DELETE | `/meals/plans/:id` | Token | Delete plan |
| GET | `/meals/favorites` | Token | List favorite meals |
| POST | `/meals/favorites` | Token | Add to favorites |
| DELETE | `/meals/favorites/:id` | Token | Remove from favorites |
| PATCH | `/meals/favorites/:id` | Token | Update favorite (notes, tags) |

## Pantry Management (`/api/pantry`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/pantry/items` | Token | List pantry items |
| POST | `/pantry/items` | Token | Add pantry item |
| GET | `/pantry/items/:id` | Token | Get item details |
| PATCH | `/pantry/items/:id` | Token | Update item |
| DELETE | `/pantry/items/:id` | Token | Remove item |
| GET | `/pantry/settings` | Token | Get pantry settings |
| PATCH | `/pantry/settings` | Token | Update pantry settings |
| GET | `/pantry/alerts` | Token | Get active alerts |
| POST | `/pantry/alerts/:id/acknowledge` | Token | Acknowledge alert |
| GET | `/pantry/stats` | Token | Get pantry statistics |

## Lab Reports (`/api/labs`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/labs/reports` | Token | List lab reports |
| POST | `/labs/reports` | Token | Upload/create lab report |
| GET | `/labs/reports/:id` | Token | Get report details |
| PATCH | `/labs/reports/:id` | Token | Update report |
| DELETE | `/labs/reports/:id` | Token | Delete report |
| GET | `/labs/alerts` | Token | Get lab alerts |
| POST | `/labs/alerts/:id/acknowledge` | Token | Acknowledge alert |
| GET | `/labs/insights` | Token | Get AI-generated insights |
| POST | `/labs/insights/:id/dismiss` | Token | Dismiss insight |
| GET | `/labs/trends/:memberId/:testName` | Token | Get trend data for a test |

## Grocery Lists (`/api/grocery`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/grocery/lists` | Token | List grocery lists |
| POST | `/grocery/lists` | Token | Create grocery list |
| GET | `/grocery/lists/:id` | Token | Get list details |
| PATCH | `/grocery/lists/:id` | Token | Update list (check items, etc.) |
| DELETE | `/grocery/lists/:id` | Token | Delete list |

## Label Analysis (`/api/labels`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/labels/analyze` | Token | Analyze label image with AI |
| GET | `/labels/history` | Token | Get analysis history |
| GET | `/labels/:id` | Token | Get analysis details |
| DELETE | `/labels/:id` | Token | Delete analysis |

## Chat (`/api/chat`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chat/message` | Token | Send message, get AI response |
| GET | `/chat/history` | Token | List chat sessions |
| GET | `/chat/sessions/:sessionId` | Token | Get session messages |
| DELETE | `/chat/sessions/:sessionId` | Token | Delete session |
| DELETE | `/chat/clear` | Token | Clear all chat history |

## Knowledge Base (`/api/knowledge`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/knowledge/files` | Token | List uploaded files |
| POST | `/knowledge/upload` | Token | Upload file (multipart) |
| GET | `/knowledge/:id` | Token | Get file content |
| DELETE | `/knowledge/:id` | Token | Delete file |
| GET | `/knowledge/search` | Token | Full-text search |

## Data Import (`/api/import`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/import/data` | Token | Import localStorage data to DB |

## Common Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "errors": [ ... ]  // Validation errors (optional)
}
```

## Authentication

Include the JWT token in the `Authorization` header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Tokens expire after 7 days (configurable via `JWT_EXPIRY`). Use the `/auth/refresh` endpoint to get a new token.
