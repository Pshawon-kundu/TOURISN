# 🏗️ TURISON - Monorepo Structure (Option 3)

## Project Structure

```
TOURISN/                           (Monorepo Root)
├── 📁 frontend/                   (React Native + Expo App)
│   ├── src/
│   │   ├── app/                   Navigation & screens
│   │   ├── components/            UI components
│   │   ├── constants/             Theme & design
│   │   ├── hooks/                 Custom React hooks
│   │   └── lib/                   Utilities
│   ├── assets/                    Images, icons
│   ├── app.json                   Expo configuration
│   ├── package.json               Frontend dependencies
│   ├── tsconfig.json              TypeScript config
│   ├── eslint.config.js           Linting rules
│   └── README.md                  Frontend docs
│
├── 📁 backend/                    (Express.js + Node.js Server)
│   ├── src/
│   │   ├── config/                Firebase & DB config
│   │   ├── controllers/           Business logic
│   │   ├── middleware/            Auth & error handling
│   │   ├── models/                MongoDB schemas
│   │   ├── routes/                API endpoints
│   │   ├── utils/                 Helper functions
│   │   └── index.ts               Server entry point
│   ├── package.json               Backend dependencies
│   ├── tsconfig.json              TypeScript config
│   └── README.md                  Backend docs
│
├── 📄 package.json                (Root Monorepo Config)
├── 📄 .env.example                (Environment template)
├── 📄 MONOREPO_STRUCTURE.md       (This file)
├── 📄 SETUP.md                    (Setup instructions)
├── 📄 ARCHITECTURE.md             (Architecture docs)
└── .gitignore                     (Git ignore rules)
```

---

## 🎯 Directory Organization

### Frontend (`frontend/`)
Contains all React Native + Expo code:
- App screens and navigation
- UI components
- Custom hooks
- Styling and assets
- Frontend-specific configuration

### Backend (`backend/`)
Contains all Express.js code:
- API routes
- Controllers with business logic
- MongoDB models
- Middleware (auth, errors)
- Utility functions
- Server configuration

### Root Level
Monorepo configuration and documentation:
- Root package.json (workspaces)
- Environment variables template
- Overall documentation

---

## 📦 Package Structure

### Root `package.json` (Monorepo)
```json
{
  "name": "turison",
  "version": "1.0.0",
  "private": true,
  "description": "Tourism Platform - Frontend & Backend",
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "frontend": "cd frontend && npm start",
    "backend": "cd backend && npm run dev",
    "dev": "concurrently \"npm:frontend\" \"npm:backend\"",
    "install-all": "npm install && npm install --workspace=frontend && npm install --workspace=backend",
    "lint": "npm run lint --workspace=frontend && npm run lint --workspace=backend"
  }
}
```

### Frontend `package.json`
```json
{
  "name": "turison-frontend",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  }
}
```

### Backend `package.json`
```json
{
  "name": "turison-backend",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "start": "ts-node src/index.ts",
    "build": "tsc"
  }
}
```

---

## 🚀 Running the Application

### Install All Dependencies
```bash
npm install
```
This will install in root + frontend + backend workspaces.

### Run Frontend Only
```bash
cd frontend
npm start
```

### Run Backend Only
```bash
cd backend
npm run dev
```

### Run Both Together (Recommended)
```bash
npm run dev
```
Uses `concurrently` to run both frontend and backend.

---

## 🔄 Development Workflow

```
Project Root (TOURISN/)
    │
    ├── frontend/          Start with: npm start
    │   └── [React Native App]
    │
    └── backend/           Start with: npm run dev
        └── [Express Server on :5000]
```

---

## 🗂️ File Organization

### Frontend Structure
```
frontend/
├── src/
│   ├── app/              React Navigation & screens
│   ├── components/       Reusable UI components
│   ├── constants/        Colors, typography, theme
│   ├── hooks/            Custom React hooks
│   ├── lib/              Firebase & utilities
│   └── assets/           Images, fonts, icons
├── package.json
└── tsconfig.json
```

### Backend Structure
```
backend/
├── src/
│   ├── config/           Firebase & MongoDB setup
│   ├── controllers/      4 controllers (crud logic)
│   ├── middleware/       Auth, error handling
│   ├── models/           4 MongoDB schemas
│   ├── routes/           4 route files
│   ├── utils/            Validation, email, stripe
│   └── index.ts          Express server
├── package.json
└── tsconfig.json
```

---

## 📡 Communication

### Frontend → Backend
- Base URL: `http://localhost:5000/api`
- Sends Firebase token in header
- REST API calls

### Backend Response
- JSON responses
- Status codes (200, 201, 400, 401, 404, 500)
- Error messages

---

## 🔐 Environment Variables

Create `.env` at root level:

```env
# Backend
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
FIREBASE_PROJECT_ID=your_firebase_id
FIREBASE_PRIVATE_KEY=your_key
FIREBASE_CLIENT_EMAIL=your_email
STRIPE_SECRET_KEY=your_key
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
JWT_SECRET=your_secret

# Frontend (if needed)
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_FIREBASE_CONFIG={}
```

---

## 🎯 Key Features

✅ **Monorepo Setup**
- Single repository for frontend & backend
- Shared dependencies where possible
- Easy to manage and deploy

✅ **Workspaces**
- Each folder is independent
- Own package.json
- Own TypeScript config
- Separate development servers

✅ **Scalability**
- Can add more packages (admin, API docs, etc.)
- Easy to share utilities between packages
- Clear separation of concerns

---

## 📝 Dependencies

### Shared (Install at Both Levels)
- typescript
- typescript-eslint

### Frontend Only
- expo
- react
- react-native
- react-navigation
- firebase (client)

### Backend Only
- express
- mongoose
- firebase-admin
- stripe
- nodemailer
- jwt

---

## 🔧 Configuration Files

### tsconfig.json (Root)
Base TypeScript configuration for both frontend and backend.

### tsconfig.json (Frontend)
Extends root config, adds React-specific settings.

### tsconfig.json (Backend)
Extends root config, adds Node.js-specific settings.

### .env
Single environment file at root level, used by both.

---

## 📚 Documentation Structure

```
Root Docs:
├── MONOREPO_STRUCTURE.md    (This file - structure overview)
├── SETUP.md                 (Setup & installation guide)
├── ARCHITECTURE.md          (Architecture & diagrams)
└── README.md                (Main project README)

Frontend Docs:
└── frontend/README.md       (Frontend-specific docs)

Backend Docs:
└── backend/README.md        (Backend-specific docs)
```

---

## 🚀 Getting Started

### 1. Navigate to Project
```bash
cd c:\Users\user\Desktop\turison\TOURISN
```

### 2. Install Everything
```bash
npm install
```

### 3. Create .env File
```bash
Copy .env.example to .env
Fill in your credentials
```

### 4. Run Development
```bash
npm run dev
```
This starts both frontend and backend!

### 5. Test
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api/health

---

## 📊 Project Statistics

| Component | Files | Purpose |
|-----------|-------|---------|
| Frontend App | 50+ | React Native + Expo |
| Backend API | 23 | Express.js + Node.js |
| Models | 4 | MongoDB schemas |
| Controllers | 4 | Business logic |
| Routes | 4 | API endpoints |
| Middleware | 3 | Auth & errors |
| Utilities | 5 | Helpers |
| Docs | 7+ | Documentation |

---

## ✅ Monorepo Benefits

✅ Single repository for entire project
✅ Shared .env and configuration
✅ Unified version control
✅ Easy deployment (both from same repo)
✅ Clear folder structure
✅ Independent package.json for each
✅ Shared node_modules (if using workspaces)
✅ Simple development workflow

---

## 🎊 Conclusion

This monorepo structure provides:
- Clear separation of frontend and backend
- Easy to navigate and understand
- Simple to develop locally
- Ready for production deployment
- Professional project organization

**Location:** `c:\Users\user\Desktop\turison\TOURISN\`

**Structure:** 
```
TOURISN/
├── frontend/
├── backend/
├── package.json
└── docs/
```

Ready to go! 🚀
