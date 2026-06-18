// Server Configuration Mapping Environment Variables to JS Properties
module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    name: process.env.DATABASE_NAME || 'mealplan_assistant',
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  },
  
  upload: {
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxSize: parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 10485760, // Default 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },
  
  ai: {
    openaiKey: process.env.OPENAI_API_KEY || '',
    anthropicKey: process.env.ANTHROPIC_API_KEY || '',
    preferredProvider: process.env.AI_PROVIDER || 'anthropic',
  },
  
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    from: process.env.SMTP_FROM || 'noreply@mealplan.app',
  },
  
  validation: {
    passwordMinLength: 8,
  },
  
  bcryptRounds: 10,
  
  jwt: {
    secret: process.env.JWT_SECRET || 'CHANGE_ME_TO_A_STRONG_RANDOM_SECRET',
    expiresIn: process.env.JWT_EXPIRY || '7d',
  },
  
  passwordResetExpiry: 1 * 60 * 60 * 1000, // 1 hour in milliseconds
  
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'CHANGE_ME_TO_A_32_CHAR_HEX_KEY',
  }
};
