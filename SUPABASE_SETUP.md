# 🚀 Supabase & Firebase Setup Guide - Complete

## 📋 Table of Contents

1. [Project Setup](#project-setup)
2. [Firebase Setup](#firebase-setup)
3. [Supabase Setup](#supabase-setup)
4. [Dual Database Configuration](#dual-database-configuration)
5. [Installation](#installation)
6. [Database Schema](#database-schema-creation)
7. [Environment Configuration](#environment-configuration)
8. [Backend Configuration](#backend-configuration)
9. [API Endpoints](#api-endpoints)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)

---

## Project Setup

### Architecture Overview

```
Frontend (React Native/Expo)
    ↓
Backend (Express.js)
    ├→ Firebase (Authentication, Firestore, Storage)
    └→ Supabase (PostgreSQL, Auth, Storage, Real-time)
```

**Dual Database Strategy:**

- **Firebase:** Real-time updates, user authentication, quick prototyping
- **Supabase:** Production data, complex queries, relational data
- **Sync:** Both databases store same data for redundancy

---

## Firebase Setup

### 1. Create Firebase Project

```bash
# Go to https://console.firebase.google.com
# Create new project:
#   1. Project name: "turison"
#   2. Enable Google Analytics (optional)
#   3. Click Create Project
```

### 2. Create Service Account

1. Go to **Project Settings** → **Service Accounts** tab
2. Click **Generate New Private Key**
3. Download JSON file
4. Extract these values from JSON:
   - `project_id`
   - `private_key_id`
   - `private_key`
   - `client_email`
   - `client_id`
   - `auth_uri`
   - `token_uri`
   - `auth_provider_x509_cert_url`
   - `client_x509_cert_url`

### 3. Enable Firebase Services

In Firebase Console:

1. **Authentication** → Enable Email/Password
2. **Firestore Database** → Create database (Start in production mode)
3. **Storage** → Create bucket
4. **Realtime Database** (optional) → Create database

---

## Supabase Setup

### 1. Create Supabase Account & Project

```bash
# Go to https://supabase.com
# Sign up or login
# Create new project:
#   1. Name: "turison"
#   2. Database password: strong_password
#   3. Region: Choose closest to you
#   4. Wait for initialization (2-5 minutes)
```

### 2. Get Your Credentials

After project is created:

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values:
   - **Project URL** https://evsogczcljdxvqvlbefi.supabase.co
   - **Anon Key** (public key) : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDYzODQsImV4cCI6MjA4MzEyMjM4NH0.Rv0P3Mtz5GpHH4UsUP2X2dX9pYM5HzNtgQ2HDn8hxY4
   - **Service Role Key** (secret key) : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0NjM4NCwiZXhwIjoyMDgzMTIyMzg0fQ.Vm0heVlZFqbTVunbtZ4vh4prxawyijSpfebXd_F53g0
   - **JWT Secret** (find in JWT Settings) : 41ad3d07-e35e-4484-b0f7-c45da2d668f9

---

## Installation

### 1. Install Required Libraries

```bash
# Backend - Both Firebase and Supabase
cd backend
npm install firebase-admin
npm install @supabase/supabase-js

# Frontend
cd frontend
npm install firebase
npm install @supabase/supabase-js

# Admin Web
cd admin-web
npm install firebase
npm install @supabase/supabase-js
```

### 2. Install Supabase CLI (Optional but Recommended)

```bash
# On Windows (using npm)
npm install -g supabase

# Verify installation
supabase --version
```

---

## Dual Database Configuration

### Strategy: Firebase + Supabase

**Why both?**

- **Firebase:** Real-time updates, easy authentication, good for mobile
- **Supabase:** Strong SQL queries, better relational data, production-ready PostgreSQL
- **Sync:** Both systems have same data

**Which table goes where?**

| Table              | Firebase          | Supabase     | Sync |
| ------------------ | ----------------- | ------------ | ---- |
| Users              | Auth only         | Full profile | ✅   |
| Guides             | Profile cache     | Main storage | ✅   |
| Experiences        | Real-time data    | Main storage | ✅   |
| Bookings           | Real-time updates | Main storage | ✅   |
| Reviews            | Real-time updates | Main storage | ✅   |
| Stay Bookings      | Backup            | Main storage | ✅   |
| Transport Bookings | Backup            | Main storage | ✅   |

**Sync Flow:**

```
User Action
    ↓
Backend API
    ├→ Write to Supabase (main)
    └→ Write to Firebase (cache)
    ↓
Frontend listens to Firebase for real-time updates
```

---

## Database Schema Creation

### Option A: Using Supabase Dashboard (Recommended for First Time)

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy and paste each SQL block below
4. Click **Run**

### Option B: Using Supabase CLI

```bash
# Link your project
supabase link --project-id your-project-id

# Run migrations from file
supabase db push

# View database
supabase db list
```

### SQL Schema - Create All Tables

#### 1. Create Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'guide', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_id FROM users WHERE role = 'admin')
  );
```

#### 2. Create Guides Table

```sql
CREATE TABLE guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  years_of_experience INT DEFAULT 0,
  certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  experiences_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_guides_user_id ON guides(user_id);
CREATE INDEX idx_guides_rating ON guides(rating DESC);

ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guides are publicly readable" ON guides
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own guide profile" ON guides
  FOR UPDATE USING (
    auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id)
  );
```

#### 3. Create Experiences Table

```sql
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('cultural', 'adventure', 'food', 'nature', 'beach', 'historical')),
  location VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  duration VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  currency VARCHAR(10) DEFAULT 'BDT',
  max_participants INT NOT NULL CHECK (max_participants > 0),
  current_participants INT DEFAULT 0,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
  inclusions TEXT[] DEFAULT ARRAY[]::TEXT[],
  exclusions TEXT[] DEFAULT ARRAY[]::TEXT[],
  itinerary JSONB,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_experiences_guide_id ON experiences(guide_id);
CREATE INDEX idx_experiences_status ON experiences(status);
CREATE INDEX idx_experiences_category ON experiences(category);
CREATE INDEX idx_experiences_location ON experiences(location);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active experiences are publicly readable" ON experiences
  FOR SELECT USING (status = 'active');

CREATE POLICY "Guides can view their own experiences" ON experiences
  FOR SELECT USING (
    guide_id IN (SELECT id FROM guides WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  );
```

#### 4. Create Bookings Table

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  number_of_participants INT NOT NULL CHECK (number_of_participants > 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  currency VARCHAR(10) DEFAULT 'BDT',
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('card', 'wallet', 'cash')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  booking_status VARCHAR(20) DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  booker_name VARCHAR(255) NOT NULL,
  booker_email VARCHAR(255) NOT NULL,
  booker_phone VARCHAR(20) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  payment_details JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_experience_id ON bookings(experience_id);
CREATE INDEX idx_bookings_booking_status ON bookings(booking_status);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Guides can view bookings for their experiences" ON bookings
  FOR SELECT USING (
    experience_id IN (SELECT id FROM experiences WHERE guide_id IN (SELECT id FROM guides WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())))
  );
```

#### 5. Create Reviews Table

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  helpful INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_experience_id ON reviews(experience_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));
```

#### 6. Create Stay Bookings Table

```sql
CREATE TABLE stay_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id VARCHAR(255),
  property_name VARCHAR(255) NOT NULL,
  property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('hotel', 'resort', 'apartment', 'villa', 'hostel')),
  location VARCHAR(255) NOT NULL,
  traveler_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  notes TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INT NOT NULL CHECK (number_of_guests > 0),
  number_of_nights INT NOT NULL CHECK (number_of_nights > 0),
  room_type VARCHAR(100),
  base_fare DECIMAL(10,2) NOT NULL CHECK (base_fare >= 0),
  taxes DECIMAL(10,2) NOT NULL CHECK (taxes >= 0),
  service_fee DECIMAL(10,2) NOT NULL CHECK (service_fee >= 0),
  discount DECIMAL(10,2) DEFAULT 0 CHECK (discount >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method VARCHAR(50) NOT NULL,
  card_last_four VARCHAR(4),
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stay_bookings_user_id ON stay_bookings(user_id);
CREATE INDEX idx_stay_bookings_status ON stay_bookings(status);

ALTER TABLE stay_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stay bookings" ON stay_bookings
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create stay bookings" ON stay_bookings
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));
```

#### 7. Create Transport Bookings Table

```sql
CREATE TABLE transport_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transport_type VARCHAR(50) NOT NULL CHECK (transport_type IN ('car', 'bus', 'bike', 'boat')),
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  traveler_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  notes TEXT,
  base_fare DECIMAL(10,2) NOT NULL CHECK (base_fare >= 0),
  taxes DECIMAL(10,2) NOT NULL CHECK (taxes >= 0),
  service_fee DECIMAL(10,2) NOT NULL CHECK (service_fee >= 0),
  discount DECIMAL(10,2) DEFAULT 0 CHECK (discount >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method VARCHAR(50) NOT NULL,
  card_last_four VARCHAR(4),
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  travel_date DATE,
  duration VARCHAR(100),
  provider VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transport_bookings_user_id ON transport_bookings(user_id);
CREATE INDEX idx_transport_bookings_status ON transport_bookings(status);

ALTER TABLE transport_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transport bookings" ON transport_bookings
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create transport bookings" ON transport_bookings
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));
```

#### 8. Create Storage Buckets

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('experiences', 'experiences', true),
  ('reviews', 'reviews', true)
ON CONFLICT (id) DO NOTHING;

-- Set bucket policies (optional - allows public read)
CREATE POLICY "Public avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Public experiences" ON storage.objects
  FOR SELECT USING (bucket_id = 'experiences');

CREATE POLICY "Public reviews" ON storage.objects
  FOR SELECT USING (bucket_id = 'reviews');
```

---

## Environment Configuration

### 1. Backend Environment (.env)

Create `.env` file in root directory:

```env
# Node
NODE_ENV=development
PORT=3000

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# Firebase Admin SDK
FIREBASE_PROJECT_ID=tourism-app-test
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-test@tourism-app-test.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-test%40tourism-app-test.iam.gserviceaccount.com

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_test_...

# Email (if using nodemailer)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Frontend Environment (frontend/.env.local)

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tourism-app-test
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef1234567890
```

### 3. Admin Web Environment (admin-web/.env.local)

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tourism-app-test
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

---

## Supabase CLI Commands

### Installation & Setup

```bash
# Install CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-id your-project-id

# Verify connection
supabase status
```

### Database Operations

```bash
# Create new migration
supabase migration new create_users_table

# Run migrations
supabase db push

# Pull changes from remote
supabase db pull

# Reset database (⚠️ deletes all data)
supabase db reset

# View local database
supabase start

# Stop local database
supabase stop
```

### Database Inspection

```bash
# List tables
supabase db list

# List functions
supabase db list-functions

# View table schema
supabase db info table_name

# Generate types
supabase gen types typescript --project-id your-project-id > types/database.ts
```

### Local Development

```bash
# Start local Supabase instance
supabase start

# View logs
supabase logs

# Reset local database
supabase db reset

# Stop local development
supabase stop
```

---

## Backend Configuration

### 1. Configure Firebase Admin

File: `backend/src/config/firebase.ts`

```typescript
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
  console.log("✓ Firebase Admin initialized");
} catch (error) {
  console.warn(
    "⚠ Firebase initialization issue:",
    error instanceof Error ? error.message : error
  );
}

export const firebaseAuth = admin.auth();
export const firebaseDB = admin.firestore();
export const firebaseStorage = admin.storage();

export default admin;
```

### 2. Configure Supabase Client

File: `backend/src/config/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const connectSupabaseDB = async () => {
  try {
    // Test connection
    const { data, error } = await supabase
      .from("users")
      .select("count()", { count: "exact" });

    if (error) throw error;

    console.log("✓ Supabase connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Supabase connection failed:", error);
    throw error;
  }
};

export default supabase;
```

### 3. Update Database Connection

File: `backend/src/config/database.ts`

```typescript
import { connectSupabaseDB, supabase } from "./supabase";

export const connectDB = async () => {
  try {
    // Connect to both Firebase and Supabase
    console.log("🔗 Connecting to databases...");

    // Firebase initialization happens in firebase.ts
    console.log("✓ Firebase ready");

    // Connect to Supabase
    await connectSupabaseDB();

    console.log("✓ Both databases connected successfully");
  } catch (error) {
    console.error("❌ Failed to connect to databases", error);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export { supabase };
export default supabase;
```

### 4. Update Authentication Middleware

File: `backend/src/middleware/auth.ts`

```typescript
import { NextFunction, Request, Response } from "express";
import { supabase } from "../config/supabase";
import { firebaseAuth } from "../config/firebase";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: "admin" | "traveler" | "guide";
  };
  userId?: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    let user: any = null;

    // Try Firebase first (for client-side auth)
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      user = {
        id: decodedToken.uid,
        email: decodedToken.email,
      };
    } catch {
      // If Firebase fails, try Supabase
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser(token);
      user = supabaseUser;
    }

    if (!user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Get user profile from Supabase
    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: userProfile?.role as "admin" | "traveler" | "guide" | undefined,
    };
    req.userId = user.id;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateOptional = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (token) {
      let user: any = null;

      try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        user = {
          id: decodedToken.uid,
          email: decodedToken.email,
        };
      } catch {
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser(token);
        user = supabaseUser;
      }

      if (user) {
        const { data: userProfile } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", user.id)
          .single();

        req.user = {
          id: user.id,
          email: user.email,
          role: userProfile?.role as "admin" | "traveler" | "guide" | undefined,
        };
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    console.error("Optional authentication error:", error);
    next();
  }
};
```

---

## API Endpoints

### Authentication

```
POST   /api/auth/signup           - Register new user
POST   /api/auth/login            - Login user
POST   /api/auth/logout           - Logout user
POST   /api/auth/refresh          - Refresh token
GET    /api/auth/verify           - Verify token
```

### Experiences

```
GET    /api/experiences           - List all active experiences
GET    /api/experiences/:id       - Get experience details
POST   /api/experiences           - Create experience (auth required)
PUT    /api/experiences/:id       - Update experience (auth required)
DELETE /api/experiences/:id       - Delete experience (auth required)
```

### Bookings

```
GET    /api/bookings              - List user's bookings (auth required)
GET    /api/bookings/:id          - Get booking details (auth required)
POST   /api/bookings              - Create booking (auth required)
PUT    /api/bookings/:id          - Update booking (auth required)
DELETE /api/bookings/:id          - Cancel booking (auth required)
```

### Reviews

```
GET    /api/reviews/:experienceId - Get experience reviews
POST   /api/reviews               - Create review (auth required)
PUT    /api/reviews/:id           - Update review (auth required)
DELETE /api/reviews/:id           - Delete review (auth required)
```

### Guides

```
GET    /api/guides                - List all guides
GET    /api/guides/:id            - Get guide details
POST   /api/guides                - Create guide profile (auth required)
PUT    /api/guides/:id            - Update guide profile (auth required)
```

### Stays

```
GET    /api/stays                 - List user's stays (auth required)
POST   /api/stays                 - Create stay booking (auth required)
PUT    /api/stays/:id             - Update stay booking (auth required)
```

### Transport

```
GET    /api/transport             - List user's transport (auth required)
POST   /api/transport             - Create transport booking (auth required)
PUT    /api/transport/:id         - Update transport booking (auth required)
```

---

## Testing

### 1. Test Database Connection

```bash
cd backend
npm run dev

# Check console output for:
# ✓ Supabase connected successfully
```

### 2. Test API Health Check

```bash
curl http://localhost:3000/api/health
```

### 3. Test Experiences Endpoint

```bash
curl http://localhost:3000/api/experiences
```

### 4. Test with Authentication

```bash
# 1. Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# 2. Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# 3. Use token to create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "experienceId": "experience-uuid",
    "numberOfParticipants": 2,
    "totalPrice": 5000,
    "paymentMethod": "card",
    "bookerName": "John Doe",
    "bookerEmail": "john@example.com",
    "bookerPhone": "+880123456789",
    "startDate": "2024-01-15T09:00:00Z",
    "endDate": "2024-01-15T17:00:00Z"
  }'
```

### 5. Test in Postman

1. Create new collection "Turison API"
2. Add environment variables:
   ```
   base_url: http://localhost:3000/api
   token: (get from login response)
   ```
3. Create requests using token in Authorization header

---

## Troubleshooting

### Connection Issues

**Problem:** "Cannot connect to Supabase"

**Solution:**

```bash
# 1. Verify .env has correct values
# 2. Check Supabase project is running
# 3. Test with curl
curl https://your-project.supabase.co/rest/v1/users \
  -H "apikey: YOUR_ANON_KEY"
```

### Authentication Issues

**Problem:** "Invalid or expired token"

**Solution:**

```bash
# 1. Get fresh token from login
# 2. Verify token is in Authorization header as "Bearer TOKEN"
# 3. Check JWT_SECRET matches Supabase
# 4. Ensure token not expired
```

### RLS Policy Issues

**Problem:** "Permission denied" errors

**Solution:**

```sql
-- Check RLS is enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'bookings';

-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'bookings';

-- Temporarily disable RLS for testing (NOT for production)
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
```

### Table Not Found

**Problem:** "Relation 'experiences' does not exist"

**Solution:**

```bash
# 1. Run all SQL schema creation queries again
# 2. Verify in Supabase Dashboard > Tables
# 3. Check spelling is exact (lowercase with underscores)
```

### Performance Issues

**Solution:**

```sql
-- Verify indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'bookings';

-- Add missing indexes
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_experiences_price ON experiences(price);
```

---

## Quick Commands Reference

```bash
# Start backend
npm run dev

# Build
npm run build

# Test connection
curl http://localhost:3000/api/health

# View logs
supabase logs

# Reset database
supabase db reset

# Generate TypeScript types
supabase gen types typescript --project-id your-project-id > types/database.ts
```

---

## Complete Setup Checklist

- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project and get credentials
- [ ] Create `.env` file with Supabase URL and keys
- [ ] Run all SQL schema creation queries in Supabase SQL Editor
- [ ] Verify all tables appear in Tables list
- [ ] Install Supabase client: `npm install @supabase/supabase-js`
- [ ] Create `backend/src/config/supabase.ts`
- [ ] Update `backend/src/config/database.ts`
- [ ] Update `backend/src/middleware/auth.ts`
- [ ] Update controllers to use Supabase queries
- [ ] Update frontend `.env.local` with Supabase keys
- [ ] Test database connection: `npm run dev`
- [ ] Test API endpoints with curl
- [ ] Test authentication flow
- [ ] Deploy to production

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/current/
- **Supabase CLI:** https://supabase.com/docs/guides/cli
- **Row Level Security:** https://supabase.com/docs/guides/auth/row-level-security
- **Storage Guide:** https://supabase.com/docs/guides/storage

---

**Last Updated:** January 2026
**Status:** Ready for Production ✅
