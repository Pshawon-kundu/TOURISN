# 🚀 TURISON - Supabase Setup Guide

## Overview

Turison has been migrated from **MongoDB + Firebase** to **Supabase** (PostgreSQL + Auth + Storage + Real-time).

## Project Structure

```
TURISON/
├── 📁 frontend/          React Native + Expo Frontend
├── 📁 backend/           Express.js Backend API
├── 📁 admin-web/         Admin Dashboard (Vite + React)
├── 📁 components/        Shared React Components
├── package.json          Root monorepo config
├── .env                  Environment variables
└── docs/                 Documentation
```

---

## ⚡ Quick Start

### 1️⃣ Supabase Project Setup

1. Go to https://supabase.com and create a new project
2. Wait for initialization
3. Go to **Settings** → **API** and copy your credentials

### 2️⃣ Create .env File

Create a `.env` file in the root directory:

```env
# Backend Configuration
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

### 3️⃣ Frontend .env Setup

Create `frontend/.env` or `frontend/.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4️⃣ Admin Web .env Setup

Create `admin-web/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📋 SQL Database Schema

### Run These in Supabase SQL Editor

#### 1. Users Table (extends Supabase Auth)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = auth_id);
```

#### 2. Guides Table

```sql
CREATE TABLE guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  years_of_experience INT DEFAULT 0,
  certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  experiences_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guides are publicly readable" ON guides FOR SELECT USING (true);
CREATE POLICY "Users can update own guide" ON guides FOR UPDATE USING (
  auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id)
);
```

#### 3. Experiences Table

```sql
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  duration VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BDT',
  max_participants INT NOT NULL,
  current_participants INT DEFAULT 0,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
  inclusions TEXT[] DEFAULT ARRAY[]::TEXT[],
  exclusions TEXT[] DEFAULT ARRAY[]::TEXT[],
  itinerary JSONB,
  rating DECIMAL(3,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experiences publicly readable if active" ON experiences
  FOR SELECT USING (status = 'active');
```

#### 4. Bookings Table

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  number_of_participants INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BDT',
  payment_method VARCHAR(20) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  booking_status VARCHAR(20) DEFAULT 'confirmed',
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

CREATE INDEX bookings_user_id ON bookings(user_id);
CREATE INDEX bookings_experience_id ON bookings(experience_id);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own bookings" ON bookings
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));
```

#### 5. Reviews Table

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  helpful INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX reviews_experience_id ON reviews(experience_id);
CREATE INDEX reviews_user_id ON reviews(user_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id)
);
```

#### 6. Stay Bookings Table

```sql
CREATE TABLE stay_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  property_id VARCHAR(255),
  property_name VARCHAR(255) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  traveler_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  notes TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INT NOT NULL,
  number_of_nights INT NOT NULL,
  room_type VARCHAR(100),
  base_fare DECIMAL(10,2) NOT NULL,
  taxes DECIMAL(10,2) NOT NULL,
  service_fee DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  card_last_four VARCHAR(4),
  status VARCHAR(20) DEFAULT 'confirmed',
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX stay_bookings_user_id ON stay_bookings(user_id);

ALTER TABLE stay_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own stay bookings" ON stay_bookings
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));
```

#### 7. Transport Bookings Table

```sql
CREATE TABLE transport_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transport_type VARCHAR(50) NOT NULL,
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  traveler_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  notes TEXT,
  base_fare DECIMAL(10,2) NOT NULL,
  taxes DECIMAL(10,2) NOT NULL,
  service_fee DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  card_last_four VARCHAR(4),
  status VARCHAR(20) DEFAULT 'confirmed',
  travel_date DATE,
  duration VARCHAR(100),
  provider VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX transport_bookings_user_id ON transport_bookings(user_id);

ALTER TABLE transport_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own transport" ON transport_bookings
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));
```

#### 8. Storage Buckets

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('experiences', 'experiences', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('reviews', 'reviews', true);
```

---

## 5️⃣ Install Dependencies

```bash
# Root
npm install

# Backend (Supabase client)
cd backend
npm install @supabase/supabase-js
npm install

# Frontend
cd frontend
npm install @supabase/supabase-js
npm install

# Admin Web
cd admin-web
npm install @supabase/supabase-js
npm install
```

---

## 6️⃣ Run Development

```bash
# Option A: Both frontend & backend
npm run dev

# Option B: Just backend
cd backend
npm run dev

# Option C: Just frontend
cd frontend
npm start

# Option D: Just admin web
cd admin-web
npm run dev
```

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:3000/api`

### Authentication

- `POST /auth/signup` - Register
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/verify` - Verify token

### Experiences

- `GET /experiences` - List all
- `GET /experiences/:id` - Get details
- `POST /experiences` - Create (auth required)
- `PUT /experiences/:id` - Update (auth required)

### Bookings

- `GET /bookings` - List user's bookings
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking

### Reviews

- `GET /reviews/experience/:experienceId` - Get reviews
- `POST /reviews` - Create review

### Guides

- `GET /guides` - List all
- `GET /guides/:id` - Get guide
- `POST /guides` - Create guide profile

### Stays

- `GET /stays` - List user's stays
- `POST /stays` - Create stay booking

### Transport

- `GET /transport` - List transports
- `POST /transport` - Create booking

---

## 🔐 Authentication Flow

All requests use JWT token from Supabase Auth:

```
Authorization: Bearer <supabase_jwt_token>
```

---

## 📦 Key Dependencies Changed

**Removed:**

- `mongoose` - MongoDB ODM
- `firebase-admin` - Firebase Admin SDK
- `firebase` - Firebase Client SDK

**Added:**

- `@supabase/supabase-js` - Supabase Client
- `@supabase/auth-helpers-nextjs` - Auth helpers (if needed)

---

## ⚠️ Troubleshooting

### Connection Error

- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check RLS policies are enabled
- Ensure tables are created

### Auth Issues

- Verify JWT secret matches
- Check Supabase Auth settings
- Enable email provider in Supabase

### Port Already in Use

```bash
PORT=3001 npm run backend
```

---

## 🎯 Migration Checklist

- ✅ Create Supabase project
- ✅ Copy credentials to .env
- ✅ Run SQL schema in Supabase
- ✅ Update backend database config
- ✅ Update controllers to use Supabase
- ✅ Update middleware for JWT verification
- ✅ Update frontend API calls
- ✅ Test all endpoints
- ✅ Deploy to production

---

**Migration Complete:** MongoDB + Firebase → Supabase ✓

- `backend/README.md` - Backend guide

---

**Happy Coding!** 🎉

Your TURISON tourism platform is ready for development!

**Location:** `c:\Users\user\Desktop\turison\TOURISN\`
