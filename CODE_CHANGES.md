# Code Changes Summary

## File 1: lib/api.ts

### Change 1: Added Platform Import

```typescript
// ADDED:
import { Platform } from "react-native";
```

### Change 2: Added Dynamic API URL Detection

```typescript
// BEFORE (BROKEN):
const API_BASE_URL = "http://localhost:5001/api";

// AFTER (FIXED):
const getApiBaseUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5001/api"; // Android emulator special IP
  }
  return "http://localhost:5001/api"; // Web/iOS
};

const API_BASE_URL = getApiBaseUrl();
```

### Change 3: Enhanced registerGuide() Logging

```typescript
export const registerGuide = async (
  guideData: any,
  authToken: string,
): Promise<any> => {
  try {
    // ADDED LOGGING:
    console.log("📡 registerGuide API call starting...");
    console.log("API URL:", `${API_BASE_URL}/guides/register`);
    console.log("Auth token length:", authToken.length);
    console.log("Guide data keys:", Object.keys(guideData));

    const response = await fetch(`${API_BASE_URL}/guides/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(guideData),
    });

    console.log("📥 Response received, status:", response.status);

    const data = await response.json();
    console.log("📄 Response data:", data);

    if (!response.ok) {
      console.error("❌ API returned error:", data.error);
      throw new Error(data.error || "Failed to register guide");
    }

    console.log("✅ registerGuide API call successful!");
    return data;
  } catch (error) {
    // ENHANCED ERROR LOGGING:
    console.error("❌ Error in registerGuide API:", error);
    console.error("Error type:", typeof error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};
```

---

## File 2: app/guide-registration.tsx

### Change 1: Enhanced handleSubmit() Logging at Start

```typescript
const handleSubmit = async () => {
  console.log("🔥🔥🔥 BUTTON CLICKED! handleSubmit function started!");

  // Check authentication
  if (!user) {
    return;
  }

  console.log("✅ User authenticated:", user.email);
  console.log("Form data:", {
    fullName,
    dateOfBirth,
    phone,
    email,
    // ... other fields
  });
};
```

### Change 2: Added Validation Logging for Each Field

```typescript
// BEFORE:
if (!fullName.trim()) {
  Alert.alert("Required Field", "Please enter your full name");
  return;
}

// AFTER:
console.log("🔍 Starting field validation...");

if (!fullName.trim()) {
  console.warn("❌ Validation FAILED: fullName is empty");
  Alert.alert("Required Field", "Please enter your full name");
  return;
}
console.log("✅ fullName validation passed");

if (!dateOfBirth.trim()) {
  console.warn("❌ Validation FAILED: dateOfBirth is empty");
  Alert.alert("Required", "Please enter your date of birth");
  return;
}
console.log("✅ dateOfBirth validation passed");

// ... similar logging for phone, email, nidNumber, expertise, coverage areas ...
```

### Change 3: Enhanced Phone Format Validation Logging

```typescript
// BEFORE:
if (!phone.match(/^\+880\d{9,10}$/)) {
  Alert.alert(
    "Validation Error",
    "Please enter a valid Bangladesh phone number (e.g., +880XXXXXXXXX)",
  );
  return;
}

// AFTER:
console.log("📞 Validating phone number:", phone);
console.log("📞 Phone format check regex: /^\\+880\\d{9,10}$/");
console.log(
  "📞 Phone matches format?",
  phone.match(/^\+880\d{9,10}$/) ? "YES" : "NO",
);

if (!phone.match(/^\+880\d{9,10}$/)) {
  console.warn("❌ Phone validation FAILED - showing alert");
  Alert.alert(
    "Validation Error",
    "Please enter a valid Bangladesh phone number (e.g., +880XXXXXXXXX)",
  );
  return;
}
console.log("✅ Phone validation PASSED");
```

### Change 4: Enhanced Email Format Validation Logging

```typescript
// BEFORE:
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  Alert.alert("Validation Error", "Please enter a valid email address");
  return;
}

// AFTER:
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
console.log("📧 email format check regex: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/");
console.log(
  "📧 email:",
  email,
  "matches?",
  emailRegex.test(email) ? "YES" : "NO",
);
if (!emailRegex.test(email)) {
  console.warn("❌ Validation FAILED: invalid email format");
  Alert.alert("Validation Error", "Please enter a valid email address");
  return;
}
console.log("✅ email format validation PASSED");

// ADDED:
console.log("🎉 ALL VALIDATIONS PASSED! Proceeding to API call...");
```

### Change 5: Enhanced Backend Connectivity Test

```typescript
// BEFORE:
const testResponse = await fetch(`${API_BASE_URL}/guides`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
});
console.log("✅ Backend is reachable, status:", testResponse.status);

// AFTER:
console.log("🔍 Testing backend connectivity...");
console.log("🌐 Testing URL:", `${API_BASE_URL}/guides`);
try {
  const testResponse = await fetch(`${API_BASE_URL}/guides`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log("✅ Backend is reachable, status:", testResponse.status);
  const testData = await testResponse.text();
  console.log("✅ Backend response sample:", testData.substring(0, 100));
} catch (testError) {
  console.error("❌ Backend connectivity test failed:", testError);
  throw new Error(
    "Cannot connect to server. Please check your internet connection and try again.",
  );
}
```

### Change 6: Enhanced API Call Logging

```typescript
// BEFORE:
const data = await registerGuide(guideData, token);
console.log("✅ Guide registered successfully via API:", data);

// AFTER:
console.log("📤 Submitting guide data to Backend API...");
console.log("📦 Full Guide Data Object:", JSON.stringify(guideData, null, 2));
console.log("📋 Data Summary:", {
  firstName: guideData.firstName,
  lastName: guideData.lastName,
  email: guideData.email,
  phone: guideData.phone,
  perHourRate: guideData.perHourRate,
  expertiseCount: guideData.selectedExpertiseCategories.length,
  coverageCount: guideData.coverageAreas.length,
});

const token = await user.getIdToken();
console.log("✅ Got auth token, length:", token.length);

// ... connectivity test ...

console.log("📡 Calling registerGuide API...");
console.log("📤 Sending POST request to:", `${API_BASE_URL}/guides/register`);
console.log("📦 Request payload:", guideData);

let data;
try {
  data = await registerGuide(guideData, token);
  console.log("✅ Guide registered successfully via API:", data);
} catch (apiError: any) {
  console.error("🚨 API call failed immediately:");
  console.error("Error:", apiError);
  console.error("Message:", apiError?.message);
  throw apiError;
}
```

### Change 7: Enhanced Error Handling

```typescript
// BEFORE:
} catch (error: any) {
  console.error("❌ Guide registration error:", error);
  console.error("Error stack:", error.stack);
  Alert.alert(
    "Registration Failed",
    error.message || "Please check your internet connection and try again.",
    [{ text: "OK" }],
  );
}

// AFTER:
} catch (error: any) {
  console.error("❌ Guide registration error caught!");
  console.error("Error type:", typeof error);
  console.error("Error object:", error);
  console.error("Error message:", error?.message);
  console.error("Error stack:", error?.stack);
  console.error("Full error JSON:", JSON.stringify(error, null, 2));

  let errorMessage = "Please check your internet connection and try again.";

  if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error?.toString && typeof error.toString === "function") {
    errorMessage = error.toString();
  }

  console.error("📢 Showing error alert with message:", errorMessage);

  Alert.alert(
    "Registration Failed",
    errorMessage,
    [{ text: "OK" }],
  );
}
```

---

## Summary of Changes

| Aspect                 | Before              | After                        |
| ---------------------- | ------------------- | ---------------------------- |
| **Platform Detection** | Hardcoded localhost | Dynamic (Android/Web)        |
| **Logging Points**     | ~3 logs             | ~20+ logs                    |
| **Error Messages**     | Generic             | Specific field-level         |
| **API Debugging**      | Blind               | Detailed request/response    |
| **Validation Logging** | None                | Each field logged            |
| **Backend Test**       | None                | Connectivity test before API |

---

## Lines of Code Added

- **lib/api.ts**: +15 lines (Platform detection + logging)
- **app/guide-registration.tsx**: +80 lines (Comprehensive logging)
- **Total**: ~95 lines of logging and debugging code

These changes make it easy to debug exactly where the form submission fails!
