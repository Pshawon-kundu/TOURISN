# Guide Registration Debugging Guide

## What's Fixed ✅

1. **Platform Detection**: API now uses correct URLs based on device
   - Android: `http://10.0.2.2:5001/api` (emulator)
   - Web/iOS: `http://localhost:5001/api`

2. **Comprehensive Logging**: Every step is logged to console
   - Button clicks
   - Field validations
   - API connectivity
   - Request/response data
   - Error details

3. **Enhanced Error Messages**: Specific error descriptions for each validation

## Console Output Flow

When you click **Submit Registration**, you'll see these logs in order:

```
🔥🔥🔥 BUTTON CLICKED! handleSubmit function started!
✅ User authenticated: [your-email@gmail.com]
Form data: { fullName, dateOfBirth, phone, email, ... }
🔍 Starting field validation...
✅ fullName validation passed
✅ dateOfBirth validation passed
✅ phone basic validation passed
✅ email basic validation passed
✅ nidNumber validation passed
✅ expertiseCategories validation passed
✅ coverageAreas validation passed
✅ perHourRate validation passed
✅ yearsExperience validation passed
📞 Validating phone number: 0177271811
📞 Phone format check regex: /^\+880\d{9,10}$/
📞 Phone matches format? NO
❌ Phone validation FAILED - showing alert
```

## Common Issues & Fixes

### Issue 1: Phone Validation Fails

**Error**: "Please enter a valid Bangladesh phone number (e.g., +880XXXXXXXXX)"
**Problem**: Phone not in correct format
**Solution**: Enter phone WITH the `+880` prefix

- ❌ Wrong: `0177271811`
- ✅ Correct: `+880177271811` or `+8801772718XX`

### Issue 2: Data Not Reaching API

**Symptom**: All validations pass, but no API call happens
**Check**: Look for these logs:

```
🎉 ALL VALIDATIONS PASSED! Proceeding to API call...
🔍 Testing backend connectivity...
🌐 Testing URL: http://localhost:5001/api/guides
✅ Backend is reachable, status: 200
📤 Submitting guide data to Backend API...
📡 Calling registerGuide API...
```

### Issue 3: API Call Fails

**Check**: Look for these logs:

```
📡 registerGuide API call starting...
API URL: http://localhost:5001/api/guides/register
Auth token length: [number]
Guide data keys: [array of keys]
📥 Response received, status: [status code]
```

**If status is NOT 200**:

```
❌ API returned error: [error message from backend]
```

## What to Do When Submitting

1. **Open Browser Console** (F12 → Console tab)
2. **Fill Form**:
   - Full Name: erty
   - Date of Birth: 12/12/1995 (or any valid date)
   - Phone: `+8801772718XX` (with +880 prefix!)
   - Email: pm@gmail.com
   - NID: 7353004331
   - Select expertise areas
   - Select coverage areas
   - Per hour rate: any number
   - Years of experience: any number

3. **Click Submit Registration**

4. **Read Console Output**:
   - ✅ If you see "✅ Guide registered successfully", you're done!
   - ❌ If you see "❌ ...", scroll up and find the first error message
   - Copy all error messages and share with me

## Data Being Sent to API

```json
{
  "firstName": "erty",
  "lastName": "",
  "email": "pm@gmail.com",
  "phone": "+880177271811",
  "nidNumber": "7353004331",
  "nidImageUrl": "pending_upload",
  "age": 29,
  "dateOfBirth": "1995-12-12",
  "expertiseArea": "Tourism",
  "specialties": ["Mountain", "Cultural", "etc"],
  "selectedExpertiseCategories": ["Mountain", "Cultural"],
  "coverageAreas": ["Dhaka", "Chittagong"],
  "perHourRate": 500,
  "yearsOfExperience": 5,
  "bio": "Experienced guide...",
  "languages": ["Bengali", "English"],
  "certifications": []
}
```

## Key Validation Rules

| Field         | Rule                 | Example            |
| ------------- | -------------------- | ------------------ |
| Phone         | Must start with +880 | +8801772718XX      |
| Email         | Valid email format   | pm@gmail.com       |
| NID           | 10-17 digits         | 7353004331         |
| Age           | 18-120 years         | 29                 |
| Per Hour Rate | Positive number      | 500                |
| Expertise     | At least 1 selected  | Mountain, Cultural |
| Coverage      | At least 1 selected  | Dhaka, Chittagong  |

## If Something Still Doesn't Work

1. Share the **FULL CONSOLE OUTPUT** starting from "BUTTON CLICKED" to the error
2. Include any error messages shown in alerts
3. Tell me which step fails first:
   - Form validation?
   - Backend connectivity?
   - API request?
   - Database save?

---

**Made on**: January 19, 2026
**Backend URL**: http://localhost:5001/api
**Database**: Supabase (guides table)
**Status**: All logging in place, ready for debugging
