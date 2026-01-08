# Guide Signup & Chat System - Complete Setup Guide 🚀

## ✅ What's Been Implemented

### 1. **Backend - Supabase Guide Signup API**

#### Files Created/Modified:

- `backend/src/controllers/guideSignupController.ts` - New controller with 3 endpoints
- `backend/src/routes/guideRoutes.ts` - Added new routes
- `backend/migrations/003_add_guide_verification_and_status.sql` - Database migrations

#### API Endpoints:

**POST /api/guides/signup** (Public - No auth required)

- Creates new guide account with Supabase Auth
- Creates user profile in `users` table
- Creates guide profile in `guides` table
- Creates verification record in `guide_verifications` table
- Returns guide data on success

Request body:

```json
{
  "email": "guide@example.com",
  "password": "secure123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+880XXXXXXXXXX",
  "bio": "Experienced tour guide...",
  "specialties": ["Heritage walks", "Food tours"],
  "languages": ["Bangla", "English"],
  "yearsOfExperience": 5,
  "certifications": ["Tour Guide License"],
  "nidNumber": "1234567890123",
  "nidImageUrl": "https://...",
  "city": "Dhaka",
  "district": "Dhaka"
}
```

**GET /api/guides/with-status**

- Returns all verified guides with online/offline status
- Used by chat page to show available guides
- Includes user info, guide details, and real-time status

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "guide-uuid",
      "name": "John Doe",
      "email": "guide@example.com",
      "avatarUrl": null,
      "bio": "...",
      "specialties": ["Heritage walks"],
      "languages": ["Bangla", "English"],
      "rating": 4.8,
      "totalReviews": 125,
      "isOnline": true,
      "lastSeen": "2026-01-08T10:30:00Z"
    }
  ],
  "count": 5
}
```

**POST /api/guides/status** (Requires authentication)

- Updates guide's online/offline status
- Called when guide app opens/closes
- Updates `guide_online_status` table

Request body:

```json
{
  "guideId": "guide-uuid",
  "isOnline": true
}
```

### 2. **Database Schema**

#### New Tables:

**guide_verifications**

```sql
- id (UUID, primary key)
- guide_id (UUID, references guides)
- nid_number (VARCHAR, unique)
- nid_image_url (TEXT)
- city (VARCHAR)
- district (VARCHAR)
- verification_status (pending|approved|rejected)
- verification_notes (TEXT)
- verified_at (TIMESTAMPTZ)
- verified_by (UUID)
- created_at, updated_at
```

**guide_online_status**

```sql
- guide_id (UUID, primary key, references guides)
- is_online (BOOLEAN, default false)
- last_seen (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### Security (RLS Policies):

- Guides can view their own verification status
- Admins can view/modify all verifications
- Anyone can view guide online status (for chat)
- Guides can update their own online status

### 3. **Frontend - Chat with Guide Selection**

#### Files Created/Modified:

- `frontend/app/chat.tsx` - **NEW**: Guide list with online status
- `frontend/app/chat-room.tsx` - **RENAMED** from `chat.tsx` (actual chat interface)
- `frontend/app/guide-signup-new.tsx` - Complete guide signup form
- `frontend/app/guide/[id].tsx` - Updated to use `/chat-room`
- `frontend/app/guides.tsx` - Updated chat button route

#### Chat Flow:

**Before** (Old):

1. Click "Chat" on guide → Opens chat directly

**After** (New):

1. Navigate to **Chat tab** → See list of all guides
2. Shows online/offline status with green/gray dots
3. Search guides by name, specialty, or language
4. Pull to refresh for updated status
5. Click guide → Opens private chat room

#### Chat Page Features:

✅ **Guide List View**

- All verified guides displayed
- Real-time online/offline indicators
- Green dot = Active now
- Gray dot = Offline (with "Last seen X ago")
- Guide ratings, specialties, languages shown
- Search functionality
- Pull-to-refresh
- Auto-refresh every 30 seconds

✅ **Guide Card Info**

- Avatar (or initials if no image)
- Name with rating badge
- Online status text
- Top 2 specialties
- Up to 3 language chips
- Tap to open chat

#### Chat Room Features:

- Private 1-on-1 conversation
- Real-time Firebase sync
- Message history
- User names & timestamps
- Back button to guide list

### 4. **Frontend - Guide Signup Form**

**Location**: `/guide-signup-new`

**Features**:

- 3-section form:
  1. Personal Information (email, password, name, phone)
  2. Professional Details (bio, specialties, languages, experience)
  3. Verification (NID number, image URL, location)
- Client-side validation:

  - Required fields marked with \*
  - Password matching check
  - Phone number validation (+880 format)
  - NID length validation
  - Email format check

- Success flow:
  - Submits to `/api/guides/signup`
  - Shows success alert
  - Redirects to login
  - Guides notified of 24-48hr verification wait

## 🛠️ Setup Instructions

### Step 1: Run Database Migrations

```bash
cd backend
# Run the migration SQL file in your Supabase SQL editor
cat migrations/003_add_guide_verification_and_status.sql
```

Or in Supabase Dashboard:

1. Go to SQL Editor
2. Paste contents of `003_add_guide_verification_and_status.sql`
3. Run query

### Step 2: Configure Environment Variables

**Backend** (`backend/.env`):

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=http://localhost:8082
PORT=5001
```

**Frontend** (`frontend/.env` or `frontend/.env.local`):

```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:5001
```

### Step 3: Start Backend Server

```bash
cd backend
npm install
npm run dev
```

Backend should start on: `http://localhost:5001`

### Step 4: Start Frontend

```bash
cd frontend
npm install
npx expo start
```

Press `w` for web or scan QR for mobile

## 🧪 Testing Guide

### Test 1: Guide Signup

1. Navigate to `/guide-signup-new`
2. Fill in all required fields:
   - Email: `testguide@example.com`
   - Password: `test123`
   - First Name: `Test`
   - Last Name: `Guide`
   - Phone: `+8801712345678`
   - NID: `1234567890123`
3. Click "Create Guide Account"
4. ✅ Should see success message
5. ✅ Check Supabase dashboard:
   - `users` table: new user with role "guide"
   - `guides` table: new guide profile
   - `guide_verifications` table: verification record with status "pending"

### Test 2: View Guides with Status

**API Test:**

```bash
curl http://localhost:5001/api/guides/with-status
```

**Frontend Test:**

1. Open app and go to Chat tab (or navigate to `/chat`)
2. ✅ Should see list of guides
3. ✅ Each guide shows online/offline status
4. ✅ Pull down to refresh
5. ✅ Search for guides by name

### Test 3: Chat Flow

1. Go to Chat tab
2. Click on any guide
3. ✅ Opens chat room for that guide
4. ✅ Can send messages
5. ✅ Press back button
6. ✅ Returns to guide list
7. Click different guide
8. ✅ Opens different chat room (no message mixing)

### Test 4: Update Guide Status

**Set guide online:**

```bash
curl -X POST http://localhost:5001/api/guides/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "guideId": "guide-uuid-here",
    "isOnline": true
  }'
```

**Verify:**

1. Refresh chat list
2. ✅ Guide should show green dot
3. ✅ Status text: "Active now"

**Set guide offline:**

```bash
curl -X POST http://localhost:5001/api/guides/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "guideId": "guide-uuid-here",
    "isOnline": false
  }'
```

**Verify:**

1. Refresh chat list
2. ✅ Guide shows gray dot
3. ✅ Status text: "Last seen X ago"

## 📱 User Experience Flow

### For Travelers:

1. **Browse Guides** → Guides page
2. **Want to chat?** → Click "Chat" button OR go to Chat tab
3. **Select Guide** → See all guides with online status
4. **Start Chatting** → Click guide to open private chat
5. **Ask Questions** → About tours, prices, availability
6. **Book Tour** → After confirming details

### For Guides:

1. **Sign Up** → Use `/guide-signup-new` form
2. **Wait for Verification** → 24-48 hours
3. **Get Approved** → Account activated by admin
4. **Open App** → Status automatically set to "online"
5. **Receive Messages** → From travelers in chat
6. **Respond** → Answer questions, confirm bookings
7. **Close App** → Status set to "offline"

## 🔐 Security Features

### Backend:

✅ Supabase Auth for user management
✅ Password hashing (handled by Supabase)
✅ Row Level Security (RLS) policies
✅ Service role key for admin operations
✅ API authentication middleware
✅ Verification status checks

### Frontend:

✅ Form validation before submission
✅ Password confirmation
✅ Phone number format validation
✅ NID length validation
✅ Secure password input (hidden text)

## 🎨 UI/UX Highlights

### Chat List:

- Dark theme (#0F172A background)
- Online status with colored dots
- Search with instant filtering
- Pull-to-refresh
- Loading states
- Empty states with helpful messages
- Auto-refresh every 30s

### Guide Signup:

- Multi-section form
- Clear labels with required markers (\*)
- Placeholder text for guidance
- Validation error alerts
- Loading indicator during submission
- Success confirmation
- Link to login page

## 🚀 Next Steps

### Phase 1: Admin Panel

- [ ] Create admin dashboard
- [ ] View pending verifications
- [ ] Approve/reject guides
- [ ] Upload/verify NID images

### Phase 2: Enhanced Chat

- [ ] Read receipts
- [ ] Typing indicators
- [ ] Push notifications
- [ ] Image sharing
- [ ] Quick booking from chat

### Phase 3: Guide App

- [ ] Separate guide mobile app
- [ ] Auto online/offline status
- [ ] Push notifications for messages
- [ ] Quick replies
- [ ] Earnings dashboard

### Phase 4: Advanced Features

- [ ] Video calls with guides
- [ ] In-app payments
- [ ] Review system
- [ ] Guide availability calendar
- [ ] Multi-language support

## 📊 Database Monitoring

### Check Guide Signups:

```sql
SELECT
  u.email,
  u.first_name,
  u.last_name,
  g.is_verified,
  gv.verification_status,
  gv.created_at
FROM users u
JOIN guides g ON g.user_id = u.id
LEFT JOIN guide_verifications gv ON gv.guide_id = g.id
WHERE u.role = 'guide'
ORDER BY gv.created_at DESC;
```

### Check Online Guides:

```sql
SELECT
  u.first_name || ' ' || u.last_name as name,
  gos.is_online,
  gos.last_seen,
  gos.updated_at
FROM guides g
JOIN users u ON u.id = g.user_id
LEFT JOIN guide_online_status gos ON gos.guide_id = g.id
WHERE g.is_verified = true
ORDER BY gos.is_online DESC, gos.last_seen DESC;
```

## 🐛 Troubleshooting

### Backend Issues:

**Error: "Missing Supabase credentials"**

- Check `.env` file has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Restart backend server after adding

**Error: "Failed to create guide account"**

- Check Supabase project is active
- Verify service role key has admin permissions
- Check database migrations ran successfully

**Error: "Guide not found"**

- Ensure guide exists in `guides` table
- Check `is_verified` is true
- Verify joins between tables are correct

### Frontend Issues:

**Chat list empty:**

- Check backend is running on correct port
- Verify `EXPO_PUBLIC_BACKEND_URL` env variable
- Test API endpoint directly: `curl http://localhost:5001/api/guides/with-status`

**Guide signup fails:**

- Check all required fields are filled
- Verify phone format: `+880XXXXXXXXXX`
- Check NID is at least 10 digits
- Ensure passwords match

**Chat room not opening:**

- Check route name is `/chat-room` (not `/chat`)
- Verify guide ID is passed correctly
- Check Firebase config is set up

## ✨ Success Criteria

Your system is working if:

- ✅ Guides can sign up through form
- ✅ Backend creates all required records
- ✅ Chat page shows guide list
- ✅ Online/offline status displays correctly
- ✅ Clicking guide opens private chat
- ✅ Messages are isolated per guide
- ✅ Search and refresh work smoothly
- ✅ No errors in console

## 🎉 Congratulations!

You now have a complete guide signup and chat system with:

- Supabase database backend
- Real-time online status
- Guide verification workflow
- Beautiful chat UI with guide selection
- Secure authentication
- Scalable architecture

**Start testing and building amazing travel experiences! 🌍✈️**
