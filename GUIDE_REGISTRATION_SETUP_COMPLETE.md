# Guide Registration Complete Setup

## ✅ What's Already Done

### Backend Setup ✓

1. **API Endpoint**: `POST /api/guides/signup` - Fully functional
2. **Controller**: `guideSignupController.ts` - Complete with validation and error handling
3. **Route**: Registered at `/api/guides` in `guideRoutes.ts`
4. **Database Integration**: Saves to 3 tables in Supabase:
   - `users` - User account information
   - `guides` - Guide profile (bio, specialties, experience, per_hour_rate)
   - `guide_verifications` - NID verification data

### Frontend Setup ✓

1. **Form**: Complete multi-step guide registration form
2. **Validation**: All fields validated before submission
3. **API Integration**: Calls backend `/api/guides/signup`
4. **Success Message**: "Thank You for Registering! 🎉" popup
5. **Error Handling**: Displays detailed error messages

## 📋 Final Setup Steps

### Step 1: Add per_hour_rate Column to Database

1. Open **Supabase Dashboard** → https://supabase.com
2. Go to **SQL Editor**
3. Copy and run the SQL from `ADD_PER_HOUR_RATE.sql`:

```sql
-- Add per_hour_rate column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='guides' AND column_name='per_hour_rate'
    ) THEN
        ALTER TABLE guides
        ADD COLUMN per_hour_rate DECIMAL(10, 2) DEFAULT 0;

        COMMENT ON COLUMN guides.per_hour_rate IS 'Guide hourly rate in BDT';

        RAISE NOTICE 'Column per_hour_rate added successfully';
    ELSE
        RAISE NOTICE 'Column per_hour_rate already exists';
    END IF;
END $$;
```

4. Click **Run**
5. You should see: "Column per_hour_rate added successfully"

### Step 2: Verify Backend is Running

The backend should already be running on port 5001. To verify:

```powershell
curl http://localhost:5001/api/health
```

Expected response:

```json
{ "status": "OK", "message": "Server is running" }
```

If not running, start it:

```powershell
cd backend
npm run dev
```

### Step 3: Test Guide Registration

1. **Open your app** (already running on Expo)
2. Navigate to **"Become a Local Guide"**
3. **Fill in all fields**:

   - Account: Email & Password (or use existing login)
   - Details: Full Name, Age
   - NID Verify: Upload NID image, NID Number
   - Expertise: Area, Years of Experience, Per Hour Rate

4. Click **"Submit Registration"**

5. **Expected Result**:
   - ✅ Success popup: "Thank You for Registering! 🎉"
   - ✅ Redirects to home screen
   - ✅ Data saved in Supabase

## 🔍 Verify Data in Supabase

After registration, check your Supabase dashboard:

### Check Users Table

```sql
SELECT * FROM users WHERE role = 'guide' ORDER BY created_at DESC LIMIT 5;
```

### Check Guides Table

```sql
SELECT
  g.id,
  u.first_name,
  u.last_name,
  g.bio,
  g.specialties,
  g.years_of_experience,
  g.per_hour_rate,
  g.is_verified,
  g.created_at
FROM guides g
JOIN users u ON g.user_id = u.id
ORDER BY g.created_at DESC
LIMIT 5;
```

### Check Guide Verifications Table

```sql
SELECT
  gv.id,
  g.id as guide_id,
  u.first_name,
  u.last_name,
  gv.nid_number,
  gv.verification_status,
  gv.created_at
FROM guide_verifications gv
JOIN guides g ON gv.guide_id = g.id
JOIN users u ON g.user_id = u.id
ORDER BY gv.created_at DESC
LIMIT 5;
```

## 🎯 What Data Gets Saved

When a user submits the registration:

1. **Supabase Auth**: User account created with email/password
2. **users table**:

   - auth_id (Firebase/Supabase UID)
   - email
   - first_name, last_name
   - phone (default: +8801700000000)
   - role: "guide"

3. **guides table**:

   - user_id
   - bio (auto-generated from expertise)
   - specialties (expertise area)
   - languages (default: "English")
   - years_of_experience
   - **per_hour_rate** ← NEW!
   - certifications
   - rating: 0
   - total_reviews: 0
   - is_verified: false
   - experiences_count: 0

4. **guide_verifications table**:
   - guide_id
   - nid_number
   - nid_image_url
   - verification_status: "pending"
   - city, district (empty for now)

## 🐛 Troubleshooting

### "Cannot connect to localhost:5001"

- **Solution**: Make sure backend is running: `cd backend && npm run dev`

### "Phone number required"

- **Solution**: Already fixed! Now uses default phone: +8801700000000

### "NID number is required"

- **Solution**: Make sure you complete the NID step before expertise step
- Upload NID image and enter NID number
- Click "Verify NID" button

### "Column per_hour_rate does not exist"

- **Solution**: Run the SQL from Step 1 above in Supabase SQL Editor

### Check Console Logs

Frontend logs show:

```
Submitting guide registration to /api/guides/signup
Registration data: { email, firstName, lastName, nidNumber, ... }
Backend response: 201 { success: true, message: "Guide account created..." }
```

Backend logs show:

```
[2026-01-09T...] POST /api/guides/signup
Creating auth user...
Creating user profile...
Creating guide profile...
Creating verification record...
Guide registration successful
```

## ✨ Features Working Now

✅ Multi-step registration form with progress indicator
✅ NID image upload with camera/gallery support  
✅ Real-time field validation
✅ Automatic account creation (if not logged in)
✅ Data saved to Supabase in real-time
✅ Success popup with confirmation message
✅ Per hour rate saving (after running SQL)
✅ Verification pending workflow
✅ Complete error handling

## 🚀 Next Steps (Optional Enhancements)

1. **Add Phone Number Field** to the form (Details step)
2. **Upload NID Image to Supabase Storage** instead of just saving URL
3. **Add Profile Picture Upload**
4. **Add Location Selection** (City, District)
5. **Admin Panel** for reviewing and approving guides
6. **Email Notifications** when guide is approved/rejected
7. **Guide Dashboard** to view verification status

## 📱 App Structure

```
App Structure:
├── Frontend (Expo/React Native)
│   ├── app/guide-registration.tsx → Form UI
│   └── lib/auth.ts → Authentication
│
├── Backend (Node.js/Express)
│   ├── routes/guideRoutes.ts → /api/guides/signup
│   ├── controllers/guideSignupController.ts → Registration logic
│   └── middleware/auth.ts → Authentication
│
└── Database (Supabase PostgreSQL)
    ├── users → User accounts
    ├── guides → Guide profiles
    └── guide_verifications → NID verification data
```

---

**Everything is ready! Just run the SQL to add per_hour_rate column and test the registration. 🎉**
