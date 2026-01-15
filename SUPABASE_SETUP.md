# Supabase Setup Guide

## Installation

The app has been updated to use **Supabase** instead of Firebase.

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

The Supabase package (`@supabase/supabase-js`) is now installed.

### Step 2: Get Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com
2. Navigate to **Project Settings → API**
3. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Create `.env` File

Create a `.env` file in the `frontend` folder:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=http://localhost:5001/api
```

### Step 4: Test Login

1. Make sure you have a user account in Supabase Authentication
2. Use the email and password to login
3. If login fails, check:
   - Console logs for error messages
   - Supabase credentials are correct
   - User exists in Supabase Auth

## File Changes

### Updated Files:

- `frontend/lib/auth.ts` - Complete rewrite for Supabase
- `frontend/package.json` - Replaced Firebase with Supabase
- `frontend/constants/supabaseConfig.ts` - New Supabase config

### Removed:

- Firebase authentication
- firebaseConfig.ts imports from auth.ts

## Login Flow

1. User enters email and password
2. Supabase authenticates the user
3. Session is stored in localStorage
4. Access token is used for subsequent API calls

## Common Issues

### "Invalid email or password"

- ✅ Check if user exists in Supabase Authentication
- ✅ Verify email and password are correct
- ✅ Check Supabase credentials in .env

### "Supabase config missing"

- ✅ Create .env file with credentials
- ✅ Reload the app

### "Network error"

- ✅ Check backend is running on localhost:5001
- ✅ Check EXPO_PUBLIC_API_URL is correct

## API Configuration

The API is configured in `frontend/lib/api.ts` and uses:

- Base URL: `EXPO_PUBLIC_API_URL`
- Supabase token from localStorage for authenticated requests
