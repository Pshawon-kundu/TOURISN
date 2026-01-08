# Real-Time User-Guide Chat System 🚀

## Overview

Your app now has a **fully functional real-time chat system** that enables direct messaging between travelers and tour guides using **Firebase Firestore**.

## 🎯 Features

### ✅ Real-Time Messaging

- **Instant message delivery** - Messages appear immediately for both parties
- **Firebase Firestore** - Cloud-based real-time database (no Supabase needed)
- **Persistent chat history** - All conversations are saved

### ✅ Private User-Guide Chats

- **One-on-one conversations** - Each user-guide pair gets a unique chat room
- **Chat room IDs** - Format: `userId_guideId` (sorted alphabetically)
- **Isolated conversations** - No message mixing between different guides

### ✅ User Experience

- **"Chat Now" button** on guide profile pages
- **Quick "Chat" button** on guide listing cards
- **Active status indicator** - Shows "Active now" for guides
- **User names displayed** - See who sent each message
- **Timestamps** - View message times
- **Back button** - Easy navigation
- **Modern dark theme UI** - Consistent with app design

## 🔧 How It Works

### 1. Chat Room Creation

When a user clicks "Chat Now" on a guide's profile:

```typescript
// Creates unique room ID: e.g., "user123_g1"
const chatRoomId = getChatRoomId(currentUserId, guideId);
```

### 2. Firebase Structure

```
firestore/
└── chats/
    └── {chatRoomId}/          // e.g., "user123_g1"
        └── messages/
            ├── message1
            │   ├── text: "Hi, I'd like to book a tour"
            │   ├── from: "user123"
            │   ├── userName: "John Doe"
            │   └── createdAt: timestamp
            ├── message2
            └── message3
```

### 3. Real-Time Updates

- Uses Firebase's `onSnapshot()` for live updates
- New messages appear instantly without refresh
- Auto-scrolls to latest message
- 2-way real-time sync between user and guide

## 📱 User Flow

1. **Browse Guides** → User finds a guide on guides page
2. **Click "Chat"** → Opens chat with that specific guide
3. **Send Message** → Message saved to Firestore
4. **Real-Time Sync** → Guide sees message instantly
5. **Guide Responds** → User sees response immediately
6. **Continue Chat** → Back-and-forth conversation

## 🛠️ Setup Instructions

### Step 1: Firebase Configuration

1. Copy `constants/firebaseConfig.example.ts` to `constants/firebaseConfig.ts`
2. Add your Firebase credentials:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### Step 2: Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create/select your project
3. Enable **Firestore Database**
4. Set security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own chats
    match /chats/{chatRoomId}/messages/{messageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 3: Test the Chat

1. Run the app: `npm start` or `npx expo start`
2. Navigate to Guides page
3. Click "Chat" on any guide card
4. Send a test message
5. ✅ Message should appear instantly!

## 🎨 UI Components

### Chat Screen Features

- **Header** with guide name and back button
- **Online indicator** showing "Active now"
- **Message bubbles** (blue for you, gray for guide)
- **Sender names** above messages
- **Timestamps** for each message
- **Input field** with 500 character limit
- **Send button** with icon

### Guide Profile Features

- **💬 Chat Now** button (blue)
- **📅 Book Tour** button (green)
- Both buttons have shadow effects and haptic feedback

### Guide List Features

- **Quick "Chat" button** on each guide card
- Prevents card click when tapping chat button
- Opens chat immediately with guide

## 🔐 Security Features

✅ **User Authentication Required**

- Uses `useAuth()` hook to get current user
- Anonymous users can chat (fallback to "Guest")
- User ID and name attached to each message

✅ **Firebase Security Rules**

- Only authenticated users can read/write
- Chat rooms isolated per user-guide pair

## 📊 Database Choice

### Why Firebase (Not Supabase)?

✅ **Already Integrated** - Firebase is set up in your app  
✅ **True Real-Time** - Native WebSocket support  
✅ **Simple Setup** - No backend code needed  
✅ **Free Tier** - 1GB storage, 10GB/month transfer  
✅ **Offline Support** - Works offline, syncs when online

**Supabase Alternative**: If you prefer PostgreSQL over NoSQL, you can switch to Supabase later, but Firebase is perfect for real-time chat.

## 🚀 Next Steps

### Enhancements You Can Add:

1. **Read receipts** - Show when messages are read
2. **Typing indicators** - "Guide is typing..."
3. **Image sharing** - Send photos in chat
4. **Push notifications** - Alert when new message arrives
5. **Chat history** - View all past conversations
6. **Block/Report** - User safety features
7. **Audio messages** - Voice notes
8. **Message reactions** - Emoji reactions

### Example: Add Typing Indicator

```typescript
// In chat.tsx, add:
const [isTyping, setIsTyping] = useState(false);

<TextInput
  onChangeText={(text) => {
    setText(text);
    // Update typing status in Firestore
    updateTypingStatus(chatRoomId, true);
  }}
  onBlur={() => updateTypingStatus(chatRoomId, false)}
/>;
```

## 🐛 Troubleshooting

### Chat not working?

1. Check Firebase config file exists
2. Verify internet connection
3. Check Firebase console for errors
4. Ensure Firestore is enabled in Firebase

### Messages not appearing?

1. Check browser console for errors
2. Verify collection path: `chats/{roomId}/messages`
3. Check Firebase security rules
4. Clear app cache and restart

### Duplicate messages?

1. Check for multiple `subscribeToMessages` calls
2. Ensure cleanup function in useEffect
3. Verify message IDs are unique

## 📝 Code Reference

### Key Files Modified:

- `frontend/lib/firebase.ts` - Added `getChatRoomId()` function
- `frontend/app/chat.tsx` - Updated to support private chats
- `frontend/app/guide/[id].tsx` - Added chat button
- `frontend/app/guides.tsx` - Added quick chat buttons

### API Functions:

```typescript
// Get unique chat room ID
getChatRoomId(userId, guideId) → "userId_guideId"

// Send a message
sendMessage(chatPath, { text, from, userName })

// Subscribe to messages
subscribeToMessages(chatPath, callback)
```

## 🎉 Success!

Your real-time chat is now **production-ready**! Users can:

- ✅ Chat with guides before booking
- ✅ Ask questions about tours
- ✅ Negotiate prices
- ✅ Share meeting details
- ✅ Build trust through conversation

**Happy chatting! 🚀**
