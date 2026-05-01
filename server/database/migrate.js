// Database Migration Script
// Run migrations and create initial database structure

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigrations() {
  const config = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    multipleStatements: true,
  };

  console.log('🔄 Starting database migration...');
  console.log(`📍 Database: ${config.database} @ ${config.host}`);

  let connection;

  try {
    // Connect to MySQL
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    console.log('📄 Executing schema...');

    // Execute schema
    await connection.query(schema);

    console.log('✅ Schema created successfully');

    // Check if admin user needs to be created (passed via environment)
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_NAME) {
      const adminId = generateUUID();
      const now = new Date();

      // Insert admin user
      await connection.query(
        `INSERT INTO users (id, email, password_hash, name, email_verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, TRUE, ?, ?)
         ON DUPLICATE KEY UPDATE id=id`,
        [adminId, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD_HASH, process.env.ADMIN_NAME, now, now]
      );

      // Insert user profile
      await connection.query(
        `INSERT INTO user_profiles (user_id, preferences, settings, onboarding_complete)
         VALUES (?, '{}', '{}', FALSE)
         ON DUPLICATE KEY UPDATE user_id=user_id`,
        [adminId]
      );

      // Insert user progress
      await connection.query(
        `INSERT INTO user_progress (user_id, level, xp, xp_to_next_level)
         VALUES (?, 1, 0, 100)
         ON DUPLICATE KEY UPDATE user_id=user_id`,
        [adminId]
      );

      console.log('✅ Admin user created');
      console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
    }

    console.log('🎉 Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };

