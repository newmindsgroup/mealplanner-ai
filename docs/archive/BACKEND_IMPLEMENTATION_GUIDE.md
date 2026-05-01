# Backend Implementation Guide - Meal Plan Assistant

## 📋 Overview

This guide provides step-by-step instructions for implementing the backend API server for the Meal Plan Assistant's user management and collaboration system.

## 🛠️ Technology Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+ (or MongoDB)
- **ORM**: Prisma (recommended) or Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcrypt
- **Email**: SendGrid or Nodemailer
- **Real-time**: Socket.io
- **Validation**: Zod or Joi
- **API Docs**: Swagger/OpenAPI

## 🚀 Quick Start

### 1. Project Initialization

```bash
# Create backend directory
mkdir meal-plan-backend
cd meal-plan-backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors dotenv bcrypt jsonwebtoken pg

# Install development dependencies
npm install --save-dev typescript @types/node @types/express @types/bcrypt @types/jsonwebtoken @types/cors ts-node nodemon prisma

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init
```

### 2. Project Structure

```
meal-plan-backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── householdController.ts
│   │   ├── invitationController.ts
│   │   ├── memberController.ts
│   │   └── userController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── models/
│   │   └── (if using Sequelize)
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── householdRoutes.ts
│   │   ├── invitationRoutes.ts
│   │   └── userRoutes.ts
│   ├── services/
│   │   ├── emailService.ts
│   │   ├── authService.ts
│   │   └── tokenService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── validation.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

## 📊 Database Schema (Prisma)

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  name          String
  avatar        String?
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  lastLogin     DateTime?
  updatedAt     DateTime  @updatedAt

  // Relations
  profile            UserProfile?
  ownedHouseholds    Household[]         @relation("HouseholdOwner")
  householdMembers   HouseholdMember[]
  sentInvitations    Invitation[]        @relation("InvitationSender")
  receivedInvitations Invitation[]       @relation("InvitationRecipient")
  mealPlans          MealPlan[]
  
  @@index([email])
}

model UserProfile {
  id                  String   @id @default(uuid())
  userId              String   @unique
  bio                 String?
  phone               String?
  timezone            String   @default("UTC")
  language            String   @default("en")
  dietaryPreferences  String[]
  favoriteCuisines    String[]
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Household {
  id        String   @id @default(uuid())
  name      String
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Settings
  allowMemberInvites  Boolean @default(false)
  mealPlanVisibility  String  @default("all") // 'all' | 'admins' | 'owner'
  requireApproval     Boolean @default(true)
  allowGuestAccess    Boolean @default(false)

  // Relations
  owner        User              @relation("HouseholdOwner", fields: [ownerId], references: [id])
  members      HouseholdMember[]
  invitations  Invitation[]
  mealPlans    MealPlan[]
  groceryLists GroceryList[]
  
  @@index([ownerId])
}

model HouseholdMember {
  id          String   @id @default(uuid())
  householdId String
  userId      String
  role        String   // 'owner' | 'admin' | 'member' | 'viewer'
  status      String   @default("active") // 'active' | 'inactive'
  invitedBy   String
  joinedAt    DateTime @default(now())

  // Relations
  household Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([householdId, userId])
  @@index([householdId])
  @@index([userId])
}

model Invitation {
  id           String    @id @default(uuid())
  householdId  String
  email        String
  role         String    // 'admin' | 'member' | 'viewer'
  token        String    @unique
  invitedById  String
  status       String    @default("pending") // 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked'
  expiresAt    DateTime
  createdAt    DateTime  @default(now())
  acceptedAt   DateTime?
  declinedAt   DateTime?

  // Relations
  household  Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  invitedBy  User      @relation("InvitationSender", fields: [invitedById], references: [id])
  acceptedBy User?     @relation("InvitationRecipient", fields: [acceptedById], references: [id])
  acceptedById String?
  
  @@index([householdId])
  @@index([email])
  @@index([token])
}

model MealPlan {
  id          String   @id @default(uuid())
  householdId String
  weekStart   DateTime
  createdBy   String
  data        Json     // Store the meal plan data as JSON
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  household Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  creator   User      @relation(fields: [createdBy], references: [id])
  
  @@index([householdId])
  @@index([weekStart])
}

model GroceryList {
  id          String   @id @default(uuid())
  householdId String
  data        Json     // Store grocery list data as JSON
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  household Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  
  @@index([householdId])
}
```

## 🔧 Core Implementation

### 1. Environment Configuration (`.env`)

```env
# Server
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/mealplan

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# Email
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@mealplan.app
EMAIL_FROM_NAME=Meal Plan Assistant

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 2. Main Server (`src/server.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import householdRoutes from './routes/householdRoutes';
import invitationRoutes from './routes/invitationRoutes';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### 3. Authentication Middleware (`src/middleware/auth.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };

    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 4. Auth Controller (`src/controllers/authController.ts`)

```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Additional endpoints: logout, forgotPassword, resetPassword, verifyEmail
```

### 5. Household Controller (`src/controllers/householdController.ts`)

```typescript
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createHousehold = async (req: AuthRequest, res: Response) => {
  try {
    const { name, settings } = req.body;
    const userId = req.user!.id;

    const household = await prisma.household.create({
      data: {
        name,
        ownerId: userId,
        ...settings,
        members: {
          create: {
            userId,
            role: 'owner',
            status: 'active',
            invitedBy: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: household });
  } catch (error) {
    console.error('Create household error:', error);
    res.status(500).json({ error: 'Failed to create household' });
  }
};

export const getUserHouseholds = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const households = await prisma.household.findMany({
      where: {
        members: {
          some: {
            userId,
            status: 'active',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.json({ success: true, data: households });
  } catch (error) {
    console.error('Get households error:', error);
    res.status(500).json({ error: 'Failed to fetch households' });
  }
};

// Additional endpoints: getHousehold, updateHousehold, deleteHousehold
```

## 📧 Email Service Integration

### SendGrid Example (`src/services/emailService.ts`)

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.EMAIL_API_KEY!);

export const sendInvitationEmail = async (
  to: string,
  householdName: string,
  inviterName: string,
  token: string
) => {
  const inviteUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${token}`;

  const msg = {
    to,
    from: process.env.EMAIL_FROM!,
    subject: `You've been invited to join ${householdName}`,
    html: `
      <h1>Household Invitation</h1>
      <p>${inviterName} has invited you to join the ${householdName} household on Meal Plan Assistant.</p>
      <p><a href="${inviteUrl}">Click here to accept the invitation</a></p>
      <p>This invitation will expire in 7 days.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Invitation email sent to:', to);
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Failed to send invitation email');
  }
};
```

## 🔒 Security Best Practices

1. **Password Hashing**: Use bcrypt with 12+ rounds
2. **JWT Secrets**: Use strong, random secrets
3. **Rate Limiting**: Implement rate limiting on auth endpoints
4. **Input Validation**: Validate all inputs
5. **SQL Injection**: Use parameterized queries (Prisma does this)
6. **XSS Prevention**: Sanitize outputs
7. **CORS**: Restrict to frontend domain
8. **HTTPS**: Use HTTPS in production
9. **Environment Variables**: Never commit secrets

## 🚀 Deployment

### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create meal-plan-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set EMAIL_API_KEY=your-key

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

## 📝 Complete Implementation Checklist

- ✅ Project setup and dependencies
- ✅ Database schema with Prisma
- ✅ Authentication system
- ✅ Household management
- ✅ Invitation system
- ✅ Permission middleware
- ✅ Email service
- ⏳ WebSocket for real-time updates
- ⏳ File upload for avatars
- ⏳ Rate limiting
- ⏳ API documentation (Swagger)
- ⏳ Unit tests
- ⏳ Integration tests
- ⏳ Production deployment

## 🎯 Next Steps

1. Complete the backend implementation following this guide
2. Test all endpoints with Postman
3. Configure email service (SendGrid/Mailgun)
4. Set up database with migrations
5. Deploy to hosting provider
6. Update frontend `.env` with API URL
7. Test end-to-end functionality
8. Add WebSocket for real-time features

This backend will power a robust, scalable, and secure multi-user meal planning application!

