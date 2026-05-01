# Database Schema Documentation

**Engine:** MySQL 5.7+ / MariaDB 10.3+  
**Charset:** utf8mb4, Collation: utf8mb4_unicode_ci  
**Schema File:** `server/database/schema.sql`  
**Migration:** `server/database/migrate.js`

## Table Overview (25 Tables)

### Core
| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Authentication | id, email, password_hash, name, email_verified |
| `user_profiles` | Extended preferences | user_id (FK), preferences (JSON), settings (JSON), onboarding_complete |
| `refresh_tokens` | JWT refresh tokens | user_id (FK), token, expires_at |
| `api_keys` | Encrypted user API keys | user_id (FK), provider (openai/anthropic), encrypted_key, encryption_iv |

### Household
| Table | Purpose | Key Columns |
|---|---|---|
| `households` | Multi-family groups | id, name, owner_id (FK), invite_code |
| `household_members` | Membership junction | household_id (FK), user_id (FK), role (owner/admin/member) |
| `people` | Family member profiles | user_id (FK), household_id (FK), name, blood_type, age, allergies (JSON) |

### Meal Planning
| Table | Purpose | Key Columns |
|---|---|---|
| `meal_plans` | Weekly plans | user_id (FK), week_start, week_end, plan_data (JSON) |
| `meals` | Individual meals | plan_id (FK), day, meal_type, name, recipe (JSON), ingredients (JSON) |
| `favorite_meals` | Saved favorites | user_id (FK), meal_data (JSON), tags (JSON) |

### Pantry
| Table | Purpose | Key Columns |
|---|---|---|
| `pantry_items` | Inventory items | user_id (FK), name, category, quantity, unit, expiration_date, barcode |
| `pantry_settings` | Per-user pantry config | user_id (FK), settings (JSON) |
| `low_stock_alerts` | Low stock notifications | item_id (FK), threshold, current_quantity, acknowledged |
| `expiration_alerts` | Expiry notifications | item_id (FK), expiration_date, days_until_expiry |

### Lab Analysis
| Table | Purpose | Key Columns |
|---|---|---|
| `lab_reports` | Lab report uploads | user_id (FK), member_id (FK), test_date, report_data (JSON) |
| `lab_results` | Individual test results | report_id (FK), test_name, value, unit, status (normal/low/high/critical) |
| `lab_alerts` | Abnormality alerts | member_id (FK), result_id (FK), severity, message |
| `lab_insights` | AI-generated insights | member_id (FK), insight_type, title, content, recommendations (JSON) |

### Other Features
| Table | Purpose |
|---|---|
| `grocery_lists` | Shopping lists linked to meal plans |
| `label_analyses` | Food label OCR/AI analysis results |
| `knowledge_base_files` | Uploaded documents with full-text search |
| `chat_history` | AI conversation sessions |
| `notifications` | System notifications |
| `email_notifications` | Email sending history |
| `user_food_guides` | Custom food guide preferences |
| `food_inquiries` | Food compatibility questions |
| `user_progress` | Gamification (level, XP, streak, badges) |

## Known Issue

Line 148 in `schema.sql` has a syntax error:
```sql
-- Wrong:
meal_type ENUM('breakfast', 'lunch', dinner', 'snack')
-- Should be:
meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack')
```
