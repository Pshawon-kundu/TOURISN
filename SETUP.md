# 🚀 TURISON Monorepo Setup Guide

## Project Structure

```
TURISON/
├── 📁 frontend/          React Native + Expo Frontend
├── 📁 backend/           Express.js Backend API
├── package.json          Root monorepo config
├── .env                  Environment variables
└── docs/                 Documentation
```

---

## ⚡ Quick Start

### 1️⃣ Install All Dependencies

```bash
cd c:\Users\user\Desktop\turison\TOURISN
npm install
```

This installs:
- Root dependencies (`concurrently`)
- Frontend dependencies (React Native, Expo, Firebase)
- Backend dependencies (Express, Mongoose, Firebase Admin)

### 2️⃣ Create .env File

Create a `.env` file in the root `TURISON/` directory:

```env
# Backend Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/turison
MONGODB_ATLAS_URI=your_mongodb_atlas_uri

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=your_cert_url

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_public_key

# Email (Nodemailer)
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Frontend
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### 3️⃣ Run Development Mode

**Option A: Run Both Frontend & Backend Together**
```bash
npm run dev
```
This starts:
- Frontend on `http://localhost:19000` (Expo)
- Backend on `http://localhost:5000`

**Option B: Run Frontend Only**
```bash
cd frontend
npm start
```

**Option C: Run Backend Only**
```bash
cd backend
npm run dev
```

---

## 📁 Directory Structure

### Frontend (`frontend/`)
```
frontend/
├── src/
│   ├── app/              Navigation & screens
│   ├── components/       Reusable UI components
│   ├── constants/        Design tokens & config
│   ├── hooks/            Custom React hooks
│   └── lib/              Firebase & utilities
├── assets/               Images, fonts, icons
├── app.json              Expo configuration
├── package.json          Frontend dependencies
└── tsconfig.json         TypeScript config
```

### Backend (`backend/`)
```
backend/
├── src/
│   ├── config/           Firebase & MongoDB config
│   ├── controllers/      Business logic (4 files)
│   ├── middleware/       Auth & error handling
│   ├── models/           MongoDB schemas (4 files)
│   ├── routes/           API endpoints (4 files)
│   ├── utils/            Helpers & utilities
│   └── index.ts          Express server entry point
├── package.json          Backend dependencies
└── tsconfig.json         TypeScript config
```

---

## 🔧 Available Commands

### Root Level (Monorepo)
```bash
npm run dev              # Run both frontend & backend
npm run frontend         # Run frontend only
npm run backend          # Run backend only
npm run lint             # Lint both frontend & backend
npm install-all          # Reinstall all dependencies
```

### Frontend
```bash
cd frontend
npm start                # Start Expo development server
npm run android          # Run on Android emulator
npm run ios              # Run on iOS simulator
npm run web              # Run in web browser
npm run lint             # Lint frontend code
```

### Backend
```bash
cd backend
npm run dev              # Start with hot-reload (Nodemon)
npm start                # Start production mode
npm run build            # Build TypeScript
```

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:5000/api`

### Health Check
- `GET /health` - Server status

### Experiences
- `GET /experiences` - List all
- `GET /experiences/search` - Search
- `GET /experiences/:id` - Get details
- `POST /experiences` - Create (auth required)
- `PATCH /experiences/:id` - Update (auth required)
- `DELETE /experiences/:id` - Delete (auth required)

### Bookings
- `GET /bookings` - List user's (auth required)
- `GET /bookings/:id` - Get details (auth required)
- `POST /bookings` - Create (auth required)
- `PATCH /bookings/:id` - Update (auth required)
- `DELETE /bookings/:id` - Cancel (auth required)

### Reviews
- `GET /reviews/:experienceId` - List
- `POST /reviews` - Create (auth required)
- `PATCH /reviews/:id` - Update (auth required)
- `DELETE /reviews/:id` - Delete (auth required)

### Guides
- `GET /guides` - List all
- `GET /guides/:id` - Get details
- `GET /guides/profile/me` - My profile (auth required)
- `POST /guides` - Create profile (auth required)
- `PATCH /guides/profile/me` - Update profile (auth required)

---

## 🔐 Authentication

All protected endpoints require Firebase ID token in header:

```
Authorization: Bearer <firebase_id_token>
```

---

## 🗄️ Database

### MongoDB Connection
Connects to local or MongoDB Atlas:

```javascript
// Local
mongodb://localhost:27017/turison

// Atlas
mongodb+srv://user:password@cluster.mongodb.net/turison
```

### Collections
- `experiences` - Tourism experiences
- `bookings` - Reservations
- `reviews` - Ratings & reviews
- `guides` - Tour guide profiles

---

## 🧪 Testing

### Test Frontend
```bash
cd frontend
npm run lint
```

### Test Backend API
```bash
curl http://localhost:5000/api/health
```

### Test with Postman/Thunder Client
1. Get Firebase ID token
2. Create request to `http://localhost:5000/api/experiences`
3. Add header: `Authorization: Bearer <token>`

---

## 📦 Dependencies

### Frontend
- React Native 0.81
- Expo 54.0
- React Navigation
- Firebase SDK
- TypeScript

### Backend
- Express.js 4.18
- MongoDB/Mongoose 7.5
- Firebase Admin SDK 12.0
- Stripe 13.6
- Nodemailer 6.9
- TypeScript

### Root (Monorepo)
- Concurrently (run both servers)

---

## ⚠️ Troubleshooting

### "npm: command not found"
Install Node.js from https://nodejs.org

### "Port 5000 already in use"
```bash
PORT=5001 npm run backend
```

### "Cannot find module"
```bash
npm install
```

### "MONGODB_URI not found"
Check .env file exists at root with correct URI

### "Firebase credentials invalid"
Verify all 10 Firebase environment variables are correct

### "Expo not starting"
```bash
cd frontend
npm start
# Press 'a' for Android or 'i' for iOS
```

---

## 🚀 Development Workflow

```
1. Start monorepo
   └─ npm run dev

2. Frontend starts
   └─ http://localhost:19000

3. Backend starts
   └─ http://localhost:5000

4. Connect frontend to backend
   └─ API calls to http://localhost:5000/api

5. Make changes
   └─ Auto-reload on both frontend & backend

6. Test APIs
   └─ Use Postman or curl
```

---

## 📚 Documentation Files

- `MONOREPO_STRUCTURE.md` - Detailed structure overview
- `ARCHITECTURE.md` - Architecture diagrams
- `frontend/README.md` - Frontend-specific docs
- `backend/README.md` - Backend-specific docs

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Create .env file
3. ✅ Start development: `npm run dev`
4. ✅ Test health check: `curl http://localhost:5000/api/health`
5. ✅ Open frontend in Expo
6. ✅ Start building!

---

## 📞 Support

Need help? Check:
- `MONOREPO_STRUCTURE.md` - How it's organized
- `ARCHITECTURE.md` - How it works
- `frontend/README.md` - Frontend guide
- `backend/README.md` - Backend guide

---

**Happy Coding!** 🎉

Your TURISON tourism platform is ready for development!

**Location:** `c:\Users\user\Desktop\turison\TOURISN\`
