# 🔴 Real-Time Admin Dashboard System

## Overview

Your Tourism app now has a **fully functional real-time admin dashboard** that instantly updates when users login, signup, or perform any actions in the system.

## ✅ What's Implemented

### Backend (Port 5001)

1. **Socket.IO Server** - Real-time WebSocket server
2. **Supabase Real-Time Listeners** - Automatically detects changes in database tables:

   - `users` table - New signups, profile updates
   - `guides` table - Guide registrations, status changes
   - `bookings` table - New bookings, booking updates
   - `transport_bookings` table - Transport bookings

3. **Real-Time Events Emitted:**
   - `user-login` - When a traveler/user logs in
   - `user-signup` - When a new user registers
   - `user-activity` - Any user table changes
   - `guide-activity` - Guide-related activities
   - `booking-activity` - Booking-related activities
   - `transport-activity` - Transport booking activities
   - `stats-update` - Updated dashboard statistics
   - `initial-data` - Complete data sent when admin connects

### Admin Dashboard (Port 4173)

1. **Socket.IO Client** - Connects to backend
2. **RealtimeContext** - React context providing real-time data to all components
3. **Live Dashboard** with:
   - Real-time statistics (Total Users, Active Guides, Monthly Revenue)
   - Recent bookings list (updates instantly)
   - Recent guides list (updates instantly)
   - **Live Activity Feed** - Shows all activities in real-time with color-coded events
   - Live connection indicator (green pulse = connected, red = disconnected)

### Frontend Mobile App (Port 8081)

- Login/Signup functionality triggers real-time updates to admin dashboard
- All user actions are tracked

## 🚀 How It Works

### 1. When User Logs In:

```
Mobile App → Backend API → emitUserLogin() → Socket.IO → Admin Dashboard
```

The admin dashboard instantly shows:

- "User logged in" notification in activity feed
- Updated user statistics

### 2. When User Signs Up:

```
Mobile App → Backend API → Database Insert → Supabase Real-Time → Socket.IO → Admin Dashboard
```

The admin dashboard instantly shows:

- "New user registered" notification in activity feed
- User added to recent users list
- Updated total users count

### 3. When Booking Created:

```
App → Database Insert → Supabase Listener → Socket.IO → Admin Dashboard
```

The admin dashboard instantly shows:

- "Booking created" notification
- Booking added to recent bookings list
- Updated booking statistics

## 📊 Real-Time Features

### Live Activity Feed

Shows all activities with color coding:

- 🟢 **Green** - User logins (success)
- 🔵 **Blue** - New signups (info)
- 🟡 **Orange** - Bookings (warning)
- 🟣 **Purple** - Guide activities (info)

### Auto-Updating Stats

- Total Users
- Active Guides
- Pending Guides
- Total Bookings
- Monthly Revenue
- Last Updated timestamp

### Connection Status

- **Live** (green pulse) - Connected to real-time server
- **Disconnected** (red) - Connection lost

## 🔧 Technical Details

### Backend Architecture

```
backend/src/
├── index.ts                      # Socket.IO server setup
├── services/
│   └── realtimeService.ts       # Supabase listeners & Socket.IO events
└── controllers/
    └── authController.ts        # Emits login/signup events
```

### Frontend Architecture

```
admin-web/src/
├── context/
│   └── RealtimeContext.tsx      # Socket.IO client & state management
├── pages/
│   └── DashboardPage.tsx        # Real-time dashboard UI
└── main.tsx                     # RealtimeProvider wrapper
```

### Socket.IO Events

**Server → Client (Admin Dashboard):**

- `connect` - Connection established
- `disconnect` - Connection lost
- `initial-data` - Complete data snapshot
- `stats-update` - Updated statistics
- `user-login` - User logged in
- `user-signup` - User signed up
- `user-activity` - User table changes
- `guide-activity` - Guide table changes
- `booking-activity` - Booking table changes
- `transport-activity` - Transport table changes

**Client → Server:**

- `connection` - Automatic when dashboard loads

## 🎯 Usage

### Access the Admin Dashboard

1. Open browser: http://localhost:4173
2. Login with admin credentials
3. You'll see the live connection indicator (green pulse)
4. Dashboard automatically updates in real-time

### Test Real-Time Updates

1. Open mobile app: http://localhost:8081
2. Login or signup as a user
3. Watch admin dashboard instantly update with:
   - New activity in the feed
   - Updated statistics
   - New user in recent users list

### Monitor Activity

- All user actions appear in the **Live Activity Feed**
- Each activity shows timestamp and details
- Feed auto-scrolls to show latest activities
- Keeps last 50 activities

## 🔌 Connection Details

| Service          | URL                   | Status     |
| ---------------- | --------------------- | ---------- |
| Backend API      | http://localhost:5001 | ✅ Running |
| Socket.IO Server | ws://localhost:5001   | ✅ Active  |
| Admin Dashboard  | http://localhost:4173 | ✅ Live    |
| Mobile App       | http://localhost:8081 | ✅ Running |

## 🎨 Dashboard Features

### Real-Time Stats Cards

- **Total Users** - Live count with pending guides info
- **Active Guides** - Approved guides count
- **Monthly Revenue** - Current month's revenue with last update time

### Recent Data Tables

- **Recent Bookings** - Last 5 bookings with traveler, guide, date, amount, status
- **Recent Guides** - Last 5 guides with status badges and hourly rates

### Live Activity Feed

- Real-time notifications of all system activities
- Color-coded by activity type
- Timestamps for each event
- Auto-updates without page refresh

## 🔄 Auto-Reconnection

- Automatically reconnects if connection is lost
- Retries up to 5 times with 1-second delay
- Shows connection status to admin

## 📱 Supported Events

### User Events

- Login
- Signup/Registration
- Profile updates
- Role changes

### Guide Events

- New guide registration
- Status approval/rejection
- Profile updates
- Rate changes

### Booking Events

- New bookings
- Booking confirmations
- Status changes
- Cancellations

### Transport Events

- New transport bookings
- Status updates

## 🎉 Benefits

1. **Instant Visibility** - See all user activities as they happen
2. **No Refresh Needed** - Dashboard updates automatically
3. **Better Monitoring** - Track user engagement in real-time
4. **Quick Response** - Identify and respond to issues immediately
5. **Improved UX** - Admin always has latest information

## 🛠️ Configuration

### Backend Environment Variables

All required environment variables are already set in your `.env` file:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- Firebase credentials

### CORS Configuration

Admin dashboard URL (http://localhost:4173) is whitelisted in backend CORS settings.

## 📝 Notes

- All Supabase real-time channels are subscribed and active
- Socket.IO uses WebSocket with polling fallback
- Data is fetched from Supabase PostgreSQL database
- Real-time events do not affect database performance
- Connection is secure with proper CORS configuration

## 🚨 Troubleshooting

If real-time updates aren't working:

1. **Check Backend Logs** - Look for "SUBSCRIBED" status for all channels
2. **Check Admin Dashboard Console** - Should see "Connected to real-time server"
3. **Verify Connection** - Green pulse indicator should be visible
4. **Test Login** - Try logging in from mobile app
5. **Check Network** - Ensure ports 5001 and 4173 are accessible

## ✨ Future Enhancements

Possible additions:

- Real-time chat messages
- Live map of active users
- Push notifications to admins
- Export activity logs
- Advanced filtering and search
- Historical data visualization

---

**Your real-time admin dashboard is now fully operational! 🎉**

Log in any user from the mobile app and watch the magic happen on the admin dashboard!
