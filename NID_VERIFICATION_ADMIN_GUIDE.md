# NID Verification & Admin System - Complete Setup Guide

## 🎯 Overview

This system allows users to signup with NID verification, upload NID images, and enables admins to view/verify all user data including NIDs and bookings.

## ✅ What's Been Implemented

### 1. **Signup Form with NID Upload** (`app/signup.tsx`)

- ✅ NID number input field (10, 13, or 17 digits)
- ✅ NID card image upload using expo-image-picker
- ✅ Image preview before submission
- ✅ Automatic NID extraction from image using OCR
- ✅ Validation: Entered NID must match extracted NID
- ✅ Upload NID image to Supabase storage
- ✅ Save NID data to users table

### 2. **Backend OCR API** (`backend/src/controllers/nidExtractionController.ts`)

- ✅ `/api/nid/extract` - Extract NID from uploaded image using Tesseract.js
- ✅ `/api/nid/verify-match` - Verify entered NID matches image
- ✅ Fake NID pattern detection
- ✅ Bangladesh NID format validation

### 3. **Supabase Storage Setup** (`SUPABASE_STORAGE_SETUP.sql`)

- ✅ Created `nid-documents` storage bucket
- ✅ Storage policies for authenticated users
- ✅ Admin access policies
- ✅ Database schema updates:
  - `users.nid_number`
  - `users.nid_image_url`
  - `users.nid_verified`
  - `users.nid_verification_date`

### 4. **Admin Panel** (`admin-web/src/pages/UsersPage.tsx`)

- ✅ View all users with real-time Supabase data
- ✅ Display NID numbers and verification status
- ✅ View user bookings count
- ✅ NID verification modal with image preview
- ✅ Approve/Reject NID functionality
- ✅ Real-time updates when verifying NIDs

## 📦 Required Packages

### Frontend (Mobile App)

```bash
npm install expo-image-picker @supabase/supabase-js
```

### Backend

```bash
npm install tesseract.js axios
```

### Admin Web

```bash
npm install @supabase/supabase-js
```

## 🚀 Setup Instructions

### Step 1: Run Supabase SQL Script

1. Open Supabase SQL Editor
2. Run `SUPABASE_STORAGE_SETUP.sql`
3. This creates:
   - Storage bucket for NID images
   - Security policies
   - Database columns for NID data

### Step 2: Configure Environment Variables

**Mobile App** (`.env` or `app.config.ts`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://evsogczcljdxvqvlbefi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Admin Web** (`.env`):

```env
VITE_SUPABASE_URL=https://evsogczcljdxvqvlbefi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Start Services

**Backend Server**:

```bash
cd backend
npm run dev
```

Should run on `http://localhost:5001`

**Mobile App**:

```bash
npm start
```

Metro bundler on `http://localhost:8081`

**Admin Web**:

```bash
cd admin-web
npm run dev
```

Runs on `http://localhost:4173`

## 🔄 User Signup Flow

1. **User fills signup form** with:
   - Full Name
   - Email
   - NID Number (10/13/17 digits)
   - NID Card Image (uploaded from gallery)
   - Password
   - Confirm Password

2. **Validation**:
   - All fields required
   - NID format validated (Bangladesh format)
   - Password must be 6+ characters
   - Passwords must match

3. **Account Creation**:
   - User account created in Supabase Auth
   - User record created in `users` table

4. **NID Processing**:
   - Image uploaded to Supabase Storage (`nid-documents` bucket)
   - Backend OCR extracts NID from image
   - System compares extracted NID with entered NID
   - If match: `nid_verified = true`
   - If no match: `nid_verified = false` (manual review needed)

5. **Result**:
   - Success: User redirected to home
   - Partial Success: Account created, NID pending verification
   - Error: User shown error message

## 🛡️ Admin Panel Features

### Users Management Page

- **View All Users**: Real-time data from Supabase
- **User Details**:
  - Name, Email, Role
  - NID Number
  - Verification Status (Verified/Pending)
  - Total Bookings Count
  - Join Date

### NID Verification Modal

- **View NID Image**: Full-size preview of uploaded NID
- **User Information**: Name, email, NID number
- **Actions**:
  - ✅ **Approve NID**: Mark as verified
  - ❌ **Reject NID**: Mark as unverified (requires re-upload)
  - View bookings history

### Real-Time Updates

- Admin actions immediately update database
- Users table refreshes after verification
- No page reload needed

## 🔐 Security Features

### Frontend Security

- Fake NID patterns blocked before submission
- Required fields validation
- Image format validation
- Password strength requirements

### Backend Security

- OCR validation with Tesseract.js
- Fake pattern detection:
  - `1234567890`, `123456789010`
  - `1111111111`, `0000000000`
  - `9999999999`, etc.
- Bangladesh NID format enforcement

### Storage Security

- RLS (Row Level Security) policies
- Users can only access their own NIDs
- Admins can access all NIDs
- Public read access blocked

## 📊 Database Schema

### Users Table

```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT,
  nid_number VARCHAR(17),         -- NEW
  nid_image_url TEXT,              -- NEW
  nid_verified BOOLEAN DEFAULT false, -- NEW
  nid_verification_date TIMESTAMP, -- NEW
  created_at TIMESTAMP
)
```

### Storage Bucket Structure

```
nid-documents/
  └── nid-images/
      └── {userId}_{timestamp}.jpg
```

## 🎯 Testing the System

### Test Signup

1. Open mobile app
2. Navigate to Signup
3. Fill all fields
4. Click "Upload NID Card" and select image
5. Enter NID number matching the card
6. Submit form
7. Check success message

### Test Admin Panel

1. Open admin web at `http://localhost:4173`
2. Login as admin
3. Navigate to "Users" page
4. You should see:
   - All registered users
   - NID numbers
   - Verification status
   - Bookings count
5. Click "View NID" on any user
6. Modal shows NID image and details
7. Click "Approve NID" to verify
8. Status updates to "Verified" ✅

### Test OCR Extraction

```bash
# Using curl or Postman
POST http://localhost:5001/api/nid/extract
Body: {
  "imageUrl": "https://your-supabase-url/storage/v1/object/public/nid-documents/..."
}

Response: {
  "success": true,
  "nidNumber": "1234567890123",
  "confidence": "medium",
  "message": "NID extracted successfully"
}
```

## 🐛 Troubleshooting

### Issue: "Image upload failed"

**Solution**:

- Check Supabase storage bucket is created
- Verify storage policies are set
- Check network connection

### Issue: "OCR not extracting NID"

**Solution**:

- Ensure image quality is good
- NID should be clearly visible
- Try different image angle
- Check backend logs for Tesseract errors

### Issue: "Admin can't see NIDs"

**Solution**:

- Verify user role is 'admin' in database
- Check RLS policies allow admin access
- Refresh Supabase connection

### Issue: "NID not verified after signup"

**Solution**:

- Check backend is running (`http://localhost:5001`)
- Verify OCR API is accessible
- Check entered NID matches image
- Review backend logs for errors

## 📱 User Experience Flow

### For Users

1. ✅ Simple signup form
2. ✅ Easy image upload
3. ✅ Instant feedback on NID match
4. ✅ Clear verification status
5. ✅ Secure data storage

### For Admins

1. ✅ Comprehensive user dashboard
2. ✅ Visual NID verification
3. ✅ One-click approval/rejection
4. ✅ Real-time data updates
5. ✅ Booking history tracking

## 🎉 Next Steps

### Recommended Enhancements

1. **Email notifications** when NID is verified
2. **User profile page** showing NID status
3. **NID re-upload** functionality for rejected NIDs
4. **Advanced OCR** using Google Cloud Vision API for better accuracy
5. **Audit log** tracking all admin actions
6. **Bulk verification** for multiple users
7. **Export user data** to CSV/Excel
8. **Advanced filters** in admin panel

## 📞 Support

If you encounter issues:

1. Check backend console logs
2. Check frontend Metro bundler logs
3. Check Supabase logs
4. Verify all environment variables are set
5. Ensure all services are running

## ✨ Features Summary

✅ **NID Upload** - Users upload NID during signup
✅ **OCR Extraction** - Automatic NID number extraction
✅ **Match Verification** - Entered vs extracted NID comparison
✅ **Secure Storage** - Supabase storage with RLS
✅ **Admin Panel** - Full user management
✅ **Real-time Data** - Live updates from Supabase
✅ **Verification System** - Admin approve/reject workflow
✅ **Bookings Tracking** - See user booking history
✅ **Security** - Fake NID pattern detection

---

**System Status**: ✅ Fully Implemented and Ready for Testing!
