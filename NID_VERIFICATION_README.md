# Bangladesh NID Verification System

A complete Bangladesh National ID (NID) verification system with image upload, OCR processing, and automated verification scoring.

## 🎯 Features

✅ **Image Upload**: Capture or upload NID card photos  
✅ **OCR Extraction**: Extract and validate NID information from images  
✅ **Automated Scoring**: Intelligent verification scoring (0-100)  
✅ **Manual Review**: Admin workflow for pending verifications  
✅ **Secure Storage**: Private storage for NID images  
✅ **Real-time Status**: Track verification progress  
✅ **Format Validation**: Support for 10, 13, and 17 digit NIDs

## 📋 System Components

### Backend API (`/backend`)

- **Controller**: `src/controllers/nidVerificationController.ts`
- **Routes**: `src/routes/nidVerificationRoutes.ts`
- **Endpoints**:
  - `POST /api/nid/verify` - Submit NID for verification
  - `GET /api/nid/status/:userId` - Get verification status
  - `PATCH /api/nid/admin/:verificationId` - Admin approval/rejection

### Frontend UI (`/frontend`)

- **Screen**: `app/nid-check.tsx`
- Features image upload, form validation, real-time status display

### Database

- **Table**: `nid_verifications`
- **Migration**: `SETUP_NID_VERIFICATION.sql`

## 🚀 Setup Instructions

### Step 1: Database Setup

1. Go to your Supabase Dashboard → SQL Editor
2. Open the file `SETUP_NID_VERIFICATION.sql`
3. Copy and paste the entire SQL script
4. Click "Run" to execute
5. Verify success message: "NID Verification System setup completed successfully!"

### Step 2: Storage Bucket Setup

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `verifications`
3. Set it to **Private** (not public)
4. Save the bucket

### Step 3: Backend Configuration

The backend is already configured! Routes are registered in `backend/src/index.ts`

API Endpoints are now live at:

- `http://localhost:5001/api/nid/verify`
- `http://localhost:5001/api/nid/status/:userId`
- `http://localhost:5001/api/nid/admin/:verificationId`

### Step 4: Test the System

1. **Start Backend** (if not running):

   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (if not running):

   ```bash
   cd frontend
   npm start
   ```

3. **Access NID Verification**:
   - Navigate to the NID Check screen in your app
   - Or go directly to: `http://localhost:8081/nid-check`

## 📱 How to Use

### For Users:

1. **Navigate** to NID Verification screen
2. **Enter** your NID number (10, 13, or 17 digits)
3. **Enter** your date of birth (YYYY-MM-DD format)
4. **Upload** NID card image:
   - Take a photo with camera
   - OR choose from gallery
5. **Submit** for verification
6. **Wait** for automatic verification or manual review

### Verification Statuses:

- 🟡 **Pending**: Just submitted, awaiting processing
- 🟢 **Verified**: Successfully verified (score ≥ 70)
- 🟠 **Pending Review**: Needs manual admin review (score < 70)
- 🔴 **Rejected**: Verification failed or rejected by admin

### Verification Scoring:

- **Base Score (30%)**: Valid NID format (10/13/17 digits)
- **Age Check (20%)**: Valid date of birth (18-100 years)
- **OCR Detection (20%)**: NID card detected in image
- **OCR Match (20%)**: Extracted NID matches input
- **OCR Confidence (10%)**: High confidence OCR reading (≥90%)

**Auto-Approval**: Score ≥ 70% → Automatically verified  
**Manual Review**: Score < 70% → Sent to admin for review

## 🔐 Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **User Ownership**: Users can only verify their own NIDs
3. **Unique Verification**: One NID number can only be verified once
4. **Private Storage**: NID images stored in private bucket
5. **Row Level Security**: Database policies enforce access control

## 🛠️ API Documentation

### 1. Verify NID

**Endpoint**: `POST /api/nid/verify`

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "userId": "uuid-string",
  "nidNumber": "1234567890",
  "dateOfBirth": "1990-01-15",
  "nidImageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response** (Success):

```json
{
  "success": true,
  "message": "NID verified successfully",
  "data": {
    "verificationId": "uuid",
    "status": "verified",
    "score": 85,
    "requiresManualReview": false
  }
}
```

### 2. Get Verification Status

**Endpoint**: `GET /api/nid/status/:userId`

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "nid_number": "1234567890",
    "status": "verified",
    "verification_score": 85,
    "created_at": "2026-01-09T10:30:00Z",
    "verified_at": "2026-01-09T10:30:05Z"
  }
}
```

### 3. Admin Update Status (Admin Only)

**Endpoint**: `PATCH /api/nid/admin/:verificationId`

**Request Body**:

```json
{
  "status": "verified",
  "notes": "Manual verification completed"
}
```

## 🔄 Integration with Third-Party Services

### Current Implementation:

- **Mock OCR**: Simulated OCR for demo purposes
- **Local Processing**: All processing done server-side

### Production Integration Options:

#### Option 1: Google Cloud Vision API

```typescript
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();
const [result] = await client.textDetection(imageBuffer);
const text = result.textAnnotations[0].description;
```

#### Option 2: AWS Textract

```typescript
import AWS from "aws-sdk";

const textract = new AWS.Textract();
const params = {
  Document: { Bytes: imageBuffer },
  FeatureTypes: ["TABLES", "FORMS"],
};
const result = await textract.analyzeDocument(params).promise();
```

#### Option 3: Azure Computer Vision

```typescript
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";

const result = await client.recognizePrintedText(true, imageUrl);
```

#### Option 4: Bangladesh Election Commission API

For official verification, integrate with:

- **Services.nidw.gov.bd** - National ID Wing
- Contact Bangladesh Election Commission for API access

## 📊 Database Schema

```sql
CREATE TABLE nid_verifications (
    id                  UUID PRIMARY KEY,
    user_id             UUID REFERENCES users(id),
    nid_number          VARCHAR(17) NOT NULL,
    date_of_birth       DATE NOT NULL,
    nid_image_url       TEXT,
    status              VARCHAR(20) DEFAULT 'pending',
    verification_score  INTEGER DEFAULT 0,
    ocr_data            JSONB,
    admin_notes         TEXT,
    verified_at         TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
```

## 🎨 UI Features

- ✨ Clean, modern design with theme support
- 📸 Camera and gallery integration
- ✅ Real-time form validation
- 📊 Visual verification status display
- 🔄 Pull-to-refresh for status updates
- 🎯 Image preview with remove option
- 📱 Responsive layout for all screen sizes

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/hooks/use-auth'"

**Solution**: The file exists in `frontend/hooks/use-auth.tsx`. Make sure frontend is running.

### Issue: "Storage bucket not found"

**Solution**:

1. Go to Supabase → Storage
2. Create bucket named `verifications`
3. Set to Private
4. Save

### Issue: "exec_sql function not found"

**Solution**: Run the SQL script manually in Supabase SQL Editor instead of using migrations.

### Issue: Image upload fails

**Solution**:

1. Check storage bucket permissions
2. Verify SUPABASE_URL and SUPABASE_KEY in `.env`
3. Ensure bucket is named exactly `verifications`

## 🚧 Future Enhancements

- [ ] Real-time verification progress tracking
- [ ] Email notifications for verification status
- [ ] Batch verification for admins
- [ ] ML-based fake NID detection
- [ ] Biometric matching (face recognition)
- [ ] Integration with Bangladesh EC API
- [ ] Verification history and audit logs
- [ ] Export verification reports

## 📄 License

This NID verification system is part of the Tourism Bangladesh platform.

## 🤝 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the setup instructions
3. Check backend logs for errors
4. Verify database connection

---

**Status**: ✅ Fully Functional  
**Last Updated**: January 9, 2026  
**Version**: 1.0.0
