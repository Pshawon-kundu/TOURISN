# Authentication & Signup Flow Documentation

## Updated Structure (as of January 6, 2026)

### Pages Overview

#### 1. **Welcome Screen** (`/app/welcome.tsx`)
- Landing page with two clear signup options:
  - "Sign Up as Traveler" → routes to `/user-signup`
  - "Register as Travel Guide" → routes to `/guide-registration`
  - "Log In" → routes to `/login`

#### 2. **User Signup** (`/app/user-signup.tsx`)
- **Purpose**: Simple registration for travelers/tourists
- **Fields Collected**:
  - First Name
  - Last Name
  - Email
  - Phone Number
  - Password
  - Confirm Password
- **Role**: Automatically set to `"user"`
- **API Endpoint**: `POST /api/auth/signup`
- **After Signup**: Redirects to login page

#### 3. **Travel Guide Registration** (`/app/guide-registration.tsx`)
- **Purpose**: Complex multi-step registration for travel guides
- **Steps**:
  1. Basic Details (Name, Age)
  2. NID Verification (NID Number + Image Upload)
  3. Expertise & Rates (Expertise Area, Experience Years, Per Hour Rate)
- **Role**: Set to `"guide"`
- **API Endpoints**:
  - `POST /api/auth/signup` (first creates user account)
  - `POST /api/guides/register` (registers guide profile)
- **Special Fields**: NID verification, expertise details, hourly rates

#### 4. **Login Screen** (`/app/login.tsx`)
- **Purpose**: Authentication for both users and guides
- **Fields**: Email, Password
- **Password Reset**: Available via "Forgot Password" link

#### 5. **Old Signup Redirect** (`/app/signup.tsx`)
- **Purpose**: Redirect to user signup (for backward compatibility)
- **Behavior**: Automatically redirects to `/user-signup`

---

## User Roles

### User (Traveler)
- Can browse and book experiences
- Can write reviews
- Can track bookings
- Minimal profile info needed

### Guide
- Can create and manage experiences
- Can receive bookings
- Can chat with travelers
- Requires NID verification and expertise details
- Has hourly rate settings

### Admin
- System administrators (manual creation only)

---

## API Integration

### Frontend ↔ Backend Communication

**Base URL**: `http://localhost:5001/api`

#### Auth Endpoints

1. **Signup** - `POST /api/auth/signup`
   ```json
   {
     "email": "user@example.com",
     "password": "password123",
     "firstName": "John",
     "lastName": "Doe",
     "phone": "+1234567890",
     "role": "user" // or "guide"
   }
   ```

2. **Login** - `POST /api/auth/login`
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

3. **Guide Registration** - `POST /api/guides/register`
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "phone": "+1234567890",
     "nidNumber": "123456789",
     "nidImageUrl": "url_to_image",
     "age": 30,
     "expertiseArea": "Mountain Trekking",
     "yearsOfExperience": 5,
     "perHourRate": 50
   }
   ```

---

## Key Changes Made

1. ✅ **Created new user signup page** - Simple form for travelers
2. ✅ **Separated concerns** - Guide registration is now distinct
3. ✅ **Updated welcome screen** - Clear navigation between signup types
4. ✅ **Fixed API port** - Changed from 5000 to 5001
5. ✅ **Maintained backward compatibility** - Old `/signup` redirects to `/user-signup`

---

## Testing Checklist

- [ ] Welcome page shows both signup options
- [ ] User signup creates traveler account successfully
- [ ] Guide registration completes multi-step process
- [ ] Login works for both user types
- [ ] Backend receives correct role in signup requests
- [ ] Profile data is saved to Supabase
- [ ] Users can't signup with invalid email/phone
- [ ] Passwords must match during signup
- [ ] NID verification required for guides

---

## Navigation Flow

```
Welcome (/welcome)
├─ Login (/login)
├─ User Signup (/user-signup) → Login
└─ Guide Registration (/guide-registration) → Login

Login (/login)
└─ Home (/) [for both users and guides]
```

---

## Database

### Users Table (Supabase)
- `id` (UUID)
- `auth_id` (Firebase UID)
- `email` (unique)
- `first_name`
- `last_name`
- `phone`
- `role` (user/guide/admin)
- `avatar_url`
- `bio`
- `created_at`
- `updated_at`

### Guides Table (Supabase)
- `id` (UUID)
- `user_id` (FK to users)
- `bio`
- `specialties` (array)
- `languages` (array)
- `years_of_experience`
- `certifications` (array)
- `rating`
- `total_reviews`
- `is_verified`
- `created_at`
- `updated_at`

