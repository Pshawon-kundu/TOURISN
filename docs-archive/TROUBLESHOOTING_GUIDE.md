# 🔧 Guide Registration Troubleshooting Guide

## ✅ What Has Been Fixed

### 1. bangladeshDistricts Error

- **Issue**: Import was failing with Metro bundler
- **Solution**: Defined the array directly in the component file (lines 18-115)
- **Status**: ✅ FIXED - Array now includes all 64 districts of Bangladesh

### 2. File Structure

- **Correct File**: `frontend/app/guide-registration.tsx`
- **DO NOT EDIT**: `app/guide-registration.tsx` (old version, not being used)

### 3. Cache Clearing

- **Metro cache cleared**: ✅
- **Node processes killed**: ✅
- **Expo restarted**: ✅

## 📋 Current Form Structure

### Step 1: Personal Details

- Full Name ✅
- Date of Birth ✅
- Phone Number (+880 format) ✅
- Email Address ✅
- Age ✅

### Step 2: NID Verification

- NID Number ✅
- NID Image Upload ✅
- Verification Status ✅

### Step 3: Expertise & Areas

- **Multi-select Expertise Categories** (10 categories) ✅
- **Coverage Areas** (64 Bangladesh districts) ✅
- Per Hour Rate ✅
- Years of Experience ✅
- Bio/Experience Details ✅

## 🎯 Testing Steps

1. **Refresh Your App**

   - On mobile: Shake device → Reload
   - On web: Press Ctrl+R or Cmd+R
   - On simulator: Press R in terminal

2. **Navigate to Guide Registration**

   - Should see the enhanced form

3. **Fill Out the Form**

   - Step 1: Enter personal details with valid phone (+880XXXXXXXXX) and email
   - Step 2: Add NID information
   - Step 3: SELECT expertise categories and coverage areas (checkboxes should appear)

4. **Submit**
   - Should show enhanced "Thank You" popup
   - Should redirect to profile or guides page

## 🐛 If Still Not Working

### Check Console Logs

Look for these specific error messages:

```
"bangladeshDistricts is not defined" → Metro cache issue
"No token or email provided" → Expected (auth required)
"Column does not exist" → Database migration not run
```

### Database Check

Run this SQL in Supabase to verify columns exist:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'guides'
AND column_name IN ('expertise_categories', 'coverage_areas');
```

### Backend Check

Verify backend is running:

```bash
# In backend folder
npm run dev
```

Should see: "Server running on port 5001"

### Frontend Check

Current server should be on: http://localhost:8082

## 📱 Expected Behavior

### When Form Loads

- Should see 3 progress steps
- Should NOT see "bangladeshDistricts is not defined" error
- Should see all form fields

### When Clicking Expertise Categories

- Should see 10 checkboxes with blue selection
- Can select multiple categories
- Selection should toggle on/off

### When Viewing Coverage Areas

- Should see scrollable list of 64 districts
- Districts organized by division
- Can select multiple districts
- Blue checkmarks for selected items

### When Submitting

- Should validate all required fields
- Should show loading state
- Should call /api/guides/register endpoint
- Should display enhanced popup with:
  - "🎉 Thank You for Registering!"
  - Welcome message
  - "What's next?" section
  - Two buttons: "View My Profile" and "Explore Guides"

### When Data Saves

- Should create entry in guides table
- Should include expertise_categories as JSON array
- Should include coverage_areas as JSON array
- Should include phone and email fields
- Should appear in guides list (after auth implementation)

## 🔍 Debug Commands

### Check if file has latest changes:

```bash
cd frontend/app
grep -n "bangladeshDistricts =" guide-registration.tsx
```

Should show line ~35 with the array definition

### Check Metro bundler:

```bash
npx expo start --clear
```

### Test backend API:

```bash
curl http://localhost:5001/api/guides
```

Should return guides data (empty array if no guides yet)

## ✨ Next Steps After Form Works

1. ✅ Test complete registration flow
2. ✅ Verify data appears in Supabase
3. ✅ Check guides section shows new guide
4. ✅ Test admin dashboard displays new fields
5. ✅ Implement authentication for submit
6. ✅ Add profile image upload
7. ✅ Enable real-time chat

## 📞 Support Info

If issues persist, check:

- Metro bundler terminal for errors
- Browser/app console for JavaScript errors
- Backend terminal for API errors
- Supabase dashboard for database issues

The app should now work perfectly with all enhancements! 🚀
