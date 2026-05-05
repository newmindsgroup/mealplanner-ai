-- Meal Plan Assistant Database Schema
-- MySQL 5.7+ / MariaDB 10.3+

-- Create database (optional - may be created by installer)
-- CREATE DATABASE IF NOT EXISTS mealplan_assistant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE mealplan_assistant;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table - Authentication and core user data
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255) NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires DATETIME NULL,
    last_login DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_verification_token (email_verification_token),
    INDEX idx_reset_token (password_reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User profiles - Extended user data and preferences
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id VARCHAR(36) PRIMARY KEY,
    preferences JSON NULL,
    settings JSON NULL,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens for JWT
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API keys storage (encrypted)
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    provider ENUM('openai', 'anthropic') NOT NULL,
    encrypted_key TEXT NOT NULL,
    encryption_iv VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_provider (user_id, provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- HOUSEHOLD MANAGEMENT
-- ============================================================================

-- Households for multi-family support
CREATE TABLE IF NOT EXISTS households (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id VARCHAR(36) NOT NULL,
    invite_code VARCHAR(50) UNIQUE,
    invite_code_expires DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id),
    INDEX idx_invite_code (invite_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Household members junction table
CREATE TABLE IF NOT EXISTS household_members (
    id VARCHAR(36) PRIMARY KEY,
    household_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('owner', 'admin', 'member') DEFAULT 'member',
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_household_user (household_id, user_id),
    INDEX idx_household (household_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- People (family members) for meal planning
CREATE TABLE IF NOT EXISTS people (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    household_id VARCHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    blood_type VARCHAR(10) NULL,
    age INT NULL,
    allergies JSON NULL,
    goals JSON NULL,
    dietary_restrictions JSON NULL,
    health_conditions JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_household (household_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- MEAL PLANNING
-- ============================================================================

-- Meal plans (weekly)
CREATE TABLE IF NOT EXISTS meal_plans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    household_id VARCHAR(36) NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    plan_data JSON NOT NULL,
    people_ids JSON NULL,
    preferences JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_household (household_id),
    INDEX idx_week (week_start, week_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Individual meals
CREATE TABLE IF NOT EXISTS meals (
    id VARCHAR(36) PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL,
    day VARCHAR(20) NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    name VARCHAR(255) NOT NULL,
    recipe JSON NULL,
    ingredients JSON NULL,
    rationale TEXT NULL,
    nutrition_info JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    INDEX idx_plan (plan_id),
    INDEX idx_day_type (day, meal_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Favorite meals
CREATE TABLE IF NOT EXISTS favorite_meals (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    meal_data JSON NOT NULL,
    tags JSON NULL,
    notes TEXT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- GROCERY LISTS
-- ============================================================================

-- Grocery lists
CREATE TABLE IF NOT EXISTS grocery_lists (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    household_id VARCHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    list_data JSON NOT NULL,
    meal_plan_id VARCHAR(36) NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL,
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_household (household_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PANTRY MANAGEMENT
-- ============================================================================

-- Pantry items
CREATE TABLE IF NOT EXISTS pantry_items (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    household_id VARCHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit VARCHAR(50) NOT NULL,
    location VARCHAR(100) NULL,
    barcode VARCHAR(100) NULL,
    brand VARCHAR(255) NULL,
    price DECIMAL(10, 2) NULL,
    purchase_date DATE NULL,
    expiration_date DATE NULL,
    low_stock_threshold DECIMAL(10, 2) DEFAULT 1,
    is_low_stock BOOLEAN DEFAULT FALSE,
    custom_fields JSON NULL,
    usage_history JSON NULL,
    nutritional_info JSON NULL,
    allergens JSON NULL,
    ingredients JSON NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_household (household_id),
    INDEX idx_category (category),
    INDEX idx_expiration (expiration_date),
    INDEX idx_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pantry settings per user
CREATE TABLE IF NOT EXISTS pantry_settings (
    user_id VARCHAR(36) PRIMARY KEY,
    settings JSON NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Low stock alerts
CREATE TABLE IF NOT EXISTS low_stock_alerts (
    id VARCHAR(36) PRIMARY KEY,
    item_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    threshold DECIMAL(10, 2) NOT NULL,
    current_quantity DECIMAL(10, 2) NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES pantry_items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_item (item_id),
    INDEX idx_acknowledged (acknowledged)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expiration alerts
CREATE TABLE IF NOT EXISTS expiration_alerts (
    id VARCHAR(36) PRIMARY KEY,
    item_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    expiration_date DATE NOT NULL,
    days_until_expiry INT NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES pantry_items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_item (item_id),
    INDEX idx_acknowledged (acknowledged),
    INDEX idx_expiration (expiration_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- LAB ANALYSIS
-- ============================================================================

-- Lab reports
CREATE TABLE IF NOT EXISTS lab_reports (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    member_id VARCHAR(36) NOT NULL,
    test_date DATE NOT NULL,
    provider VARCHAR(255) NULL,
    report_type VARCHAR(100) NULL,
    file_path VARCHAR(500) NULL,
    report_data JSON NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES people(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_member (member_id),
    INDEX idx_test_date (test_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lab results (individual tests)
CREATE TABLE IF NOT EXISTS lab_results (
    id VARCHAR(36) PRIMARY KEY,
    report_id VARCHAR(36) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    value VARCHAR(100) NOT NULL,
    numeric_value DECIMAL(15, 4) NULL,
    unit VARCHAR(50) NULL,
    reference_range VARCHAR(100) NULL,
    status ENUM('normal', 'low', 'high', 'critical') DEFAULT 'normal',
    is_priority BOOLEAN DEFAULT FALSE,
    notes TEXT NULL,
    FOREIGN KEY (report_id) REFERENCES lab_reports(id) ON DELETE CASCADE,
    INDEX idx_report (report_id),
    INDEX idx_status (status),
    INDEX idx_test_name (test_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lab alerts
CREATE TABLE IF NOT EXISTS lab_alerts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    member_id VARCHAR(36) NOT NULL,
    report_id VARCHAR(36) NOT NULL,
    result_id VARCHAR(36) NOT NULL,
    severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
    message TEXT NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES people(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES lab_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (result_id) REFERENCES lab_results(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_member (member_id),
    INDEX idx_acknowledged (acknowledged),
    INDEX idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lab insights (AI-generated)
CREATE TABLE IF NOT EXISTS lab_insights (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    member_id VARCHAR(36) NOT NULL,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    recommendations JSON NULL,
    dismissed BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES people(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_member (member_id),
    INDEX idx_dismissed (dismissed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- LABEL ANALYSIS
-- ============================================================================

-- Label analyses
CREATE TABLE IF NOT EXISTS label_analyses (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    image_path VARCHAR(500) NULL,
    product_name VARCHAR(255) NULL,
    brand VARCHAR(255) NULL,
    ocr_text TEXT NULL,
    analysis_data JSON NOT NULL,
    conflicts JSON NULL,
    recommendations JSON NULL,
    safety_flags JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- KNOWLEDGE BASE
-- ============================================================================

-- Knowledge base files
CREATE TABLE IF NOT EXISTS knowledge_base_files (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    household_id VARCHAR(36) NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    content_text LONGTEXT NULL,
    metadata JSON NULL,
    tags JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_household (household_id),
    INDEX idx_file_type (file_type),
    FULLTEXT INDEX idx_content (content_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CHAT & AI INTERACTION
-- ============================================================================

-- Chat history
CREATE TABLE IF NOT EXISTS chat_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    messages JSON NOT NULL,
    context JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_session (session_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- System notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('info', 'success', 'warning', 'error', 'alert') DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL,
    read_status BOOLEAN DEFAULT FALSE,
    read_at DATETIME NULL,
    link VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (read_status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email notification history
CREATE TABLE IF NOT EXISTS email_notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    error_message TEXT NULL,
    sent_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- FOOD GUIDE CUSTOMIZATIONS
-- ============================================================================

-- User food guides (custom foods, hidden items)
CREATE TABLE IF NOT EXISTS user_food_guides (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    person_id VARCHAR(36) NOT NULL,
    custom_foods JSON NULL,
    hidden_foods JSON NULL,
    food_notes JSON NULL,
    last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_person (user_id, person_id),
    INDEX idx_user (user_id),
    INDEX idx_person (person_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Food inquiries (user questions about specific foods)
CREATE TABLE IF NOT EXISTS food_inquiries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    person_id VARCHAR(36) NULL,
    food_name VARCHAR(255) NOT NULL,
    blood_type VARCHAR(10) NULL,
    inquiry_text TEXT NOT NULL,
    response TEXT NULL,
    status ENUM('pending', 'answered') DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answered_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PROGRESS & GAMIFICATION
-- ============================================================================

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    user_id VARCHAR(36) PRIMARY KEY,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    xp_to_next_level INT DEFAULT 100,
    streak INT DEFAULT 0,
    last_activity_date DATE NULL,
    meals_completed INT DEFAULT 0,
    badges JSON NULL,
    weekly_activity JSON NULL,
    achievements JSON NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_meals_plan_day ON meals(plan_id, day);
CREATE INDEX idx_pantry_user_category ON pantry_items(user_id, category);
CREATE INDEX idx_lab_member_date ON lab_reports(member_id, test_date DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_status, created_at DESC);


-- ============================================================================
-- FITNESS MODULE
-- ============================================================================

-- User fitness profiles
CREATE TABLE IF NOT EXISTS fitness_profiles (
    id                   VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id              VARCHAR(36) NOT NULL UNIQUE,
    height_cm            DECIMAL(5,2) NULL,
    weight_kg            DECIMAL(5,2) NULL,
    body_fat_pct         DECIMAL(4,2) NULL,
    fitness_level        ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
    primary_goal         ENUM('weight_loss','muscle_gain','endurance','flexibility','general_health') NULL,
    secondary_goals      JSON NULL,
    equipment            JSON NULL,
    training_styles      JSON NULL,
    days_per_week        INT DEFAULT 3,
    session_duration_min INT DEFAULT 45,
    preferred_time       ENUM('morning','afternoon','evening') DEFAULT 'morning',
    injuries             JSON NULL,
    photo_retention      ENUM('30_days','immediate') DEFAULT '30_days',
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_fitness_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Body photo analyses
CREATE TABLE IF NOT EXISTS body_analyses (
    id            VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id       VARCHAR(36) NOT NULL,
    photo_path    VARCHAR(500) NULL,
    analyzed_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delete_at     DATETIME NULL,
    body_type     ENUM('ectomorph','mesomorph','endomorph') NULL,
    estimated_bf  DECIMAL(4,2) NULL,
    muscle_mass   ENUM('low','moderate','high') NULL,
    ai_notes      TEXT NULL,
    recommendations JSON NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_body_user (user_id),
    INDEX idx_body_delete (delete_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI-generated workout plans
CREATE TABLE IF NOT EXISTS workout_plans (
    id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id     VARCHAR(36) NOT NULL,
    name        VARCHAR(255) NOT NULL,
    week_start  DATE NOT NULL,
    goal        VARCHAR(100) NULL,
    plan_data   JSON NOT NULL,
    ai_provider VARCHAR(50) NULL,
    is_active   TINYINT(1) DEFAULT 1,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_plan_user_week (user_id, week_start DESC),
    INDEX idx_plan_active (user_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Individual workout sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
    id             VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    plan_id        VARCHAR(36) NOT NULL,
    user_id        VARCHAR(36) NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_at   DATETIME NULL,
    duration_min   INT NULL,
    exercises      JSON NULL,
    notes          TEXT NULL,
    mood           ENUM('great','good','ok','tired','skipped') NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id)  REFERENCES workout_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_user (user_id),
    INDEX idx_session_date (user_id, scheduled_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Body measurements history
CREATE TABLE IF NOT EXISTS body_measurements (
    id           VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id      VARCHAR(36) NOT NULL,
    measured_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    weight_kg    DECIMAL(5,2) NULL,
    body_fat_pct DECIMAL(4,2) NULL,
    chest_cm     DECIMAL(5,2) NULL,
    waist_cm     DECIMAL(5,2) NULL,
    hips_cm      DECIMAL(5,2) NULL,
    bicep_cm     DECIMAL(5,2) NULL,
    thigh_cm     DECIMAL(5,2) NULL,
    notes        TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_measurements_user (user_id, measured_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Personal records / PRs
CREATE TABLE IF NOT EXISTS personal_records (
    id           VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id      VARCHAR(36) NOT NULL,
    exercise     VARCHAR(255) NOT NULL,
    record_type  ENUM('max_weight','max_reps','fastest_time','longest_distance') NOT NULL,
    value        DECIMAL(10,2) NOT NULL,
    unit         VARCHAR(20) NULL,
    achieved_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_pr_user (user_id),
    INDEX idx_pr_exercise (user_id, exercise)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
