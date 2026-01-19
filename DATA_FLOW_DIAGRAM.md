# Guide Registration Data Flow

## From Form to Database

### 1. Form Input (React State)

```javascript
{
  fullName: "Test Guide",
  dateOfBirth: "01/15/1995",    // DD/MM/YYYY format
  phone: "+8801772718XX",        // With +880 prefix
  email: "test@gmail.com",
  nidNumber: "1234567890",
  nidImageUrl: "pending_upload",
  selectedExpertiseCategories: ["Mountain", "Cultural"],
  coverageAreas: ["Dhaka", "Chittagong"],
  perHourRate: "500",            // String from input
  yearsExperience: "5",          // String from input
  experience: "I am a guide..."
}
```

### 2. Validation in handleSubmit()

```javascript
// Each field is validated:
✓ fullName: not empty
✓ dateOfBirth: valid date, age 18-120
✓ phone: matches /^\+880\d{9,10}$/
✓ email: matches email regex
✓ nidNumber: not empty
✓ selectedExpertiseCategories: array with length > 0
✓ coverageAreas: array with length > 0
✓ perHourRate: valid positive number
✓ yearsExperience: not empty
```

### 3. Data Transformation

```javascript
// In handleSubmit(), before API call:
const birthDate = new Date("1995-01-15"); // Convert DD/MM/YYYY to date
const calculatedAge = 29; // Calculate age
const formattedDOB = "1995-01-15"; // DD/MM/YYYY → YYYY-MM-DD

// Create guideData object:
const guideData = {
  firstName: "Test", // Split fullName
  lastName: "Guide", // Split fullName
  email: "test@gmail.com", // Trim and lowercase
  phone: "+8801772718XX", // Trim
  nidNumber: "1234567890", // Trim
  nidImageUrl: "pending_upload",
  age: 29, // Calculated
  dateOfBirth: "1995-01-15", // Formatted
  expertiseArea: "Mountain", // First expertise category
  specialties: ["Mountain", "Cultural"],
  selectedExpertiseCategories: ["Mountain", "Cultural"],
  coverageAreas: ["Dhaka", "Chittagong"],
  perHourRate: 500, // Convert to number
  yearsOfExperience: 5, // Convert to number
  bio: "Experienced guide...",
  languages: ["Bengali", "English"],
  certifications: [],
};
```

### 4. API Request

```javascript
fetch("http://localhost:5001/api/guides/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer [firebase-token]"
  },
  body: JSON.stringify(guideData)
})

// Example body:
{
  "firstName": "Test",
  "lastName": "Guide",
  "email": "test@gmail.com",
  "phone": "+8801772718XX",
  "nidNumber": "1234567890",
  "nidImageUrl": "pending_upload",
  "age": 29,
  "dateOfBirth": "1995-01-15",
  "expertiseArea": "Mountain",
  "specialties": ["Mountain", "Cultural"],
  "selectedExpertiseCategories": ["Mountain", "Cultural"],
  "coverageAreas": ["Dhaka", "Chittagong"],
  "perHourRate": 500,
  "yearsOfExperience": 5,
  "bio": "Experienced guide...",
  "languages": ["Bengali", "English"],
  "certifications": []
}
```

### 5. Backend Validation (guideController.ts)

```javascript
// Backend checks:
✓ firstName: required
✓ lastName: required (can be empty string)
✓ email: valid email format
✓ phone: matches /^\+880\d{9,10}$/
✓ nidNumber: 10-17 characters
✓ nidImageUrl: required (or "pending_upload")
✓ age: 18-120
✓ dateOfBirth: required
✓ expertiseArea: required
✓ specialties/selectedExpertiseCategories: array, length > 0
✓ coverageAreas: array, length > 0
✓ perHourRate: positive number
✓ yearsOfExperience: required

// Backend also checks:
✓ req.user exists (authenticated)
✓ No guide profile already exists for this user
```

### 6. Database Insert (Supabase guides table)

```sql
INSERT INTO guides (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  nid_number,
  nid_image_url,
  age,
  date_of_birth,
  expertise_area,
  specialties,
  coverage_areas,
  per_hour_rate,
  years_of_experience,
  bio,
  languages,
  certifications,
  verified,
  created_at
) VALUES (
  '[firebase-user-id]',
  'Test',
  'Guide',
  'test@gmail.com',
  '+8801772718XX',
  '1234567890',
  'pending_upload',
  29,
  '1995-01-15',
  'Mountain',
  '["Mountain","Cultural"]',
  '["Dhaka","Chittagong"]',
  500,
  5,
  'Experienced guide...',
  '["Bengali","English"]',
  '[]',
  false,
  now()
)
```

### 7. API Response

```javascript
{
  "success": true,
  "data": {
    "id": "guide-uuid",
    "user_id": "firebase-user-id",
    "first_name": "Test",
    "last_name": "Guide",
    "email": "test@gmail.com",
    "phone": "+8801772718XX",
    "nid_number": "1234567890",
    "verified": false,
    "created_at": "2026-01-19T10:30:00Z",
    ...
  }
}
```

### 8. Frontend Success Alert

```
🎉 Thank You for Registering!

Your guide profile has been created successfully
and will be reviewed within 24 hours.

What's next?
• Complete your profile with photos
• Wait for verification
• Start connecting with travelers
```

---

## Validation Examples

### ✅ VALID INPUTS

```
Name: "John Doe"
DOB: "15/01/1995"
Phone: "+8801772718XX"    ← Must have +880
Email: "john@gmail.com"
NID: "1234567890"
```

### ❌ INVALID INPUTS

```
Name: ""                  ← Empty
DOB: "1995-01-15"        ← Wrong format (must be DD/MM/YYYY)
Phone: "01772718XX"      ← Missing +880
Email: "john@gmail"      ← Missing .com
NID: "123456"            ← Too short (< 10)
```

---

## Common Console Logs

### Success Path

```
🔥🔥🔥 BUTTON CLICKED! handleSubmit function started!
✅ User authenticated: test@gmail.com
Form data: {fullName: "Test Guide", ...}
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
📞 Validating phone number: +8801772718XX
📞 Phone matches format? YES
✅ Phone validation PASSED
📧 email: test@gmail.com matches? YES
✅ email format validation PASSED
🎉 ALL VALIDATIONS PASSED! Proceeding to API call...
📤 Submitting guide data to Backend API...
📋 Data Summary: {firstName: "Test", lastName: "Guide", ...}
🔍 Testing backend connectivity...
🌐 Testing URL: http://localhost:5001/api/guides
✅ Backend is reachable, status: 200
📡 Calling registerGuide API...
📡 registerGuide API call starting...
API URL: http://localhost:5001/api/guides/register
Auth token length: 542
Guide data keys: ["firstName", "lastName", "email", ...]
📥 Response received, status: 200
📄 Response data: {success: true, data: {...}}
✅ registerGuide API call successful!
✅ Guide registered successfully via API: {success: true, ...}
```

### Error Path (Phone Format)

```
🔥🔥🔥 BUTTON CLICKED! handleSubmit function started!
✅ User authenticated: test@gmail.com
Form data: {fullName: "Test Guide", phone: "01772718XX", ...}
🔍 Starting field validation...
✅ fullName validation passed
...
📞 Validating phone number: 01772718XX
📞 Phone format check regex: /^\+880\d{9,10}$/
📞 Phone matches format? NO
❌ Phone validation FAILED - showing alert
[ALERT SHOWN TO USER]
```

---

## Database Schema (guides table)

```sql
CREATE TABLE guides (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  nid_number TEXT,
  nid_image_url TEXT,
  age INTEGER,
  date_of_birth DATE,
  expertise_area TEXT,
  specialties TEXT[] -- JSON array as text
  coverage_areas TEXT[], -- JSON array as text
  per_hour_rate DECIMAL,
  years_of_experience INTEGER,
  bio TEXT,
  languages TEXT[],
  certifications TEXT[],
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Timestamps

| Step                      | Time       |
| ------------------------- | ---------- |
| Form filled               | T+0ms      |
| Submit button clicked     | T+0ms      |
| Validation starts         | T+10ms     |
| All validations pass      | T+50ms     |
| Backend connectivity test | T+60ms     |
| API request sent          | T+80ms     |
| Backend processing        | T+80-200ms |
| Response received         | T+200ms    |
| Database insert completes | T+250ms    |
| Success alert shown       | T+250ms    |

---

**Remember**: The phone number format is the #1 cause of failures!
Use: `+880XXXXXXXXX` (with +880 prefix)
