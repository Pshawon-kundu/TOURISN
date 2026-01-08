# Authentication Token Debug Guide

## Issue: "Invalid authentication token"

This error means the token verification is failing. Here's how to diagnose it:

---

## **Step 1: Check Backend Logs**

When you try to login, watch the backend terminal for these logs:

```
🔐 Login attempt received
   Email: your@email.com
   Has idToken: true
   Has password: false

📤 Verifying Firebase ID Token...
✅ ID Token verified successfully
   UID: xxxxx
   Email: your@email.com
```

### **If you see token verification failure:**

```
❌ Token verification failed:
   code: auth/invalid-argument
   message: "Illegal argument provided"
```

**Possible causes:**

1. **Token is malformed** - Frontend sending wrong format
2. **Token is expired** - Took too long between signup/login
3. **Firebase Admin SDK not initialized** - Missing environment variables
4. **Wrong Firebase project** - Frontend and backend using different Firebase projects

---

## **Step 2: Verify Firebase Admin SDK Setup**

Check backend logs on startup:

```
🔍 Firebase Config Check:
  Project ID: ✓ Set
  Client Email: ✓ Set
  Private Key: ✓ Set
✅ Firebase Admin SDK initialized successfully
```

### **If you see errors:**

```
❌ Firebase Admin SDK initialization FAILED:
   Missing required environment variables
```

**Fix**: Check `.env` file in backend directory has:

```
FIREBASE_PROJECT_ID=turison-96886
FIREBASE_PRIVATE_KEY_ID=xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@turison-96886.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxxxx
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=xxxxx
```

---

## **Step 3: Verify Frontend Sends idToken Correctly**

Open browser console (F12) and watch for:

```
🔐 Attempting Firebase sign in for: your@email.com
✅ Firebase sign in successful
   UID: xxxxx
✅ ID Token obtained
📤 Sending token to backend...
```

The token should be a JWT starting with `eyJ...`

**If you see this error on frontend:**

```
auth/user-not-found
auth/wrong-password
auth/invalid-login-credentials
```

**Fix**: The user account doesn't exist in Firebase. **Sign up first** at `/signup`.

---

## **Step 4: Check User Exists in Supabase**

When token verification passes but user not found, you see:

```
❌ User profile not found in Supabase:
   error: "no rows returned"
   uid: xxxxx
```

**This means:**

- Firebase account exists ✓
- Token verification works ✓
- But NO user profile in Supabase database ✗

**Fix**:

1. Go to Supabase dashboard
2. Check `users` table
3. Look for row with `auth_id = xxxxx` (the UID from logs)
4. If missing, user wasn't created in Supabase signup

**Solution**: Sign up again with same email - this will create the Supabase profile.

---

## **Step 5: Verify Backend is Restarted**

After changing auth code, the backend must restart to pick up changes.

```bash
# Kill old process
taskkill /F /IM node.exe

# Restart backend
cd backend
npm run dev
```

You should see:

```
✅ Firebase Admin SDK initialized successfully
🚀 Server running on port 5001
```

---

## **Complete Authentication Flow - What Should Happen**

### **Signup Flow:**

```
1. Frontend: User clicks "Sign Up as Traveler"
   📝 Starting Firebase signup for: user@example.com

2. Frontend: Firebase creates account
   ✅ Firebase user created successfully
   UID: abc123

3. Frontend: Gets idToken from Firebase
   ✅ ID Token obtained

4. Frontend: Sends idToken to backend
   📤 Sending signup data to backend...

5. Backend: Verifies token with Firebase Admin SDK
   🔐 Verifying Firebase ID Token...
   ✅ ID Token verified successfully

6. Backend: Creates user profile in Supabase
   📤 Attempting to store user profile in Supabase...
   ✅ User profile stored in Supabase

7. Backend: Generates custom token
   🔑 Generating Firebase custom token with claims...
   ✅ Custom token generated successfully

8. Frontend: Sets token for API requests
   ✅ Backend confirmed signup
   ✅ Signup complete!
```

### **Login Flow:**

```
1. Frontend: User clicks login
   🔐 Attempting Firebase sign in for: user@example.com

2. Frontend: Firebase authenticates user
   ✅ Firebase sign in successful
   UID: abc123

3. Frontend: Gets idToken from Firebase
   ✅ ID Token obtained

4. Frontend: Sends idToken to backend
   📤 Sending token to backend...

5. Backend: Verifies token with Firebase Admin SDK
   📤 Verifying Firebase ID Token...
   ✅ ID Token verified successfully

6. Backend: Fetches user profile from Supabase
   📤 Fetching user profile from Supabase...
   ✓ User profile fetched from Supabase

7. Backend: Generates custom token
   🔑 Generating custom token...
   ✅ Custom token generated

8. Frontend: Sets token for API requests
   ✅ Backend verified token successfully
   ✅ Login complete!
```

---

## **Quick Troubleshooting Checklist**

- [ ] Frontend shows "Firebase sign in successful"? → Firebase account exists
- [ ] Frontend shows "ID Token obtained"? → Token generation works
- [ ] Backend shows "ID Token verified successfully"? → Firebase Admin SDK works
- [ ] Backend shows "User profile fetched from Supabase"? → Supabase profile exists
- [ ] User is redirected to home page? → Login successful

---

## **Common Solutions**

### **Problem: "Invalid authentication token" on login**

```
❌ Token verification failed
```

**Causes & Fixes:**

1. **User hasn't signed up** → Go to `/signup` and create account
2. **Firebase project mismatch** → Verify both frontend/backend use same Firebase project ID
3. **Firebase Admin SDK not initialized** → Check .env has all Firebase credentials
4. **Backend not restarted** → Run `npm run dev` in backend directory again

### **Problem: "User profile not found"**

```
❌ User profile not found in Supabase
```

**Causes & Fixes:**

1. **Old signup before this fix** → User was in Supabase but never created Supabase profile
2. **Signup failed silently** → Sign up again
3. **Wrong email** → Check email matches between signup and login

### **Problem: Getting errors during signup**

```
auth/email-already-in-use
auth/weak-password
```

**Fixes:**

1. **Email already exists** → Use login page instead
2. **Weak password** → Use 6+ characters with mix of letters/numbers
3. **Invalid email** → Check email format

---

## **Enable Maximum Debugging**

For detailed troubleshooting, temporary add this to frontend `login.tsx`:

```typescript
const handleLogin = async () => {
  try {
    console.log("=== LOGIN START ===");
    console.log("Email:", email);
    console.log("Password length:", password.length);

    const result = await signIn(email.trim(), password);

    console.log("=== LOGIN SUCCESS ===");
    console.log("Result:", result);
    router.replace("/");
  } catch (err: any) {
    console.log("=== LOGIN ERROR ===");
    console.log("Error code:", err.code);
    console.log("Error message:", err.message);
    console.log("Full error:", err);
    setError(err?.message ?? "Login failed");
  }
};
```

---

## **Still Having Issues?**

1. **Check browser console (F12)** for detailed error messages
2. **Check backend terminal** for verification logs
3. **Check Supabase dashboard** for user records
4. **Verify `.env` file** in backend has all required fields
5. **Restart both servers** - frontend and backend
6. **Try signup first** - don't attempt login with non-existent account
7. **Use different email** - test account may be cached somewhere
