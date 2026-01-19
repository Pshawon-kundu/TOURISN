# Quick Test Checklist for Guide Registration

## Before Testing

- [ ] Backend running on port 5001 (check: `netstat -ano | findstr ":5001"`)
- [ ] Frontend Expo app running
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible
- [ ] Phone number formatted correctly: `+880` prefix required

## Test Steps

### Step 1: Enter Form Data

```
Full Name: Test Guide
Date of Birth: 01/15/1995 (must be valid, shows age 29+)
Phone: +8801772718XX (replace XX with any digits)
Email: test@gmail.com
NID Number: 1234567890 (10-17 digits)
Experience: Your experience here
Per Hour Rate: 500
Years of Experience: 5
```

### Step 2: Select Required Options

- [ ] Select at least 1 Expertise Category (scroll down)
- [ ] Select at least 1 Coverage Area/District (scroll down)

### Step 3: Click Submit Registration

- [ ] Watch console immediately

### Step 4: Read Console Output

Copy everything from "🔥🔥🔥 BUTTON CLICKED!" to either:

- Success message: "🎉 Thank You for Registering!"
- Or first error message

## Expected Success Flow

```
🔥🔥🔥 BUTTON CLICKED! handleSubmit function started!
✅ User authenticated: your-email@gmail.com
Form data: { fullName: 'Test Guide', ... }
🔍 Starting field validation...
✅ [All validations pass]
🎉 ALL VALIDATIONS PASSED! Proceeding to API call...
🌐 Testing URL: http://localhost:5001/api/guides
✅ Backend is reachable, status: 200
📤 Submitting guide data to Backend API...
📡 Calling registerGuide API...
📡 registerGuide API call starting...
📥 Response received, status: 200
✅ registerGuide API call successful!
✅ Guide registered successfully via API: {data}
[SUCCESS ALERT APPEARS]
```

## Debugging Checklist

### If validation fails:

- [ ] Check which field failed (scroll up in console)
- [ ] For phone: ensure it's `+880XXXXXXXXX` format
- [ ] For email: ensure it has @ and .
- [ ] For expertise/coverage: scroll down to select

### If API connectivity fails:

- [ ] Check backend is running: `netstat -ano | findstr ":5001"`
- [ ] Check backend logs in terminal
- [ ] Try accessing `http://localhost:5001/api/guides` directly in browser

### If API call fails with 400+ status:

- [ ] Check the error message in console
- [ ] Common: phone format wrong, missing fields
- [ ] Check guide data was formatted correctly

### If API call fails with no status:

- [ ] Network error - check internet connection
- [ ] CORS issue - check backend headers
- [ ] Check browser Network tab (F12 → Network)

## What NOT to Do

- ❌ Don't submit without +880 phone prefix
- ❌ Don't submit without selecting expertise areas
- ❌ Don't submit without selecting coverage areas
- ❌ Don't close console while testing (you'll lose logs)

---

**Share these logs with issue if something fails**:

1. All console output from button click to error
2. The error message shown in alert
3. Which step failed (validation, connectivity, API, etc.)
