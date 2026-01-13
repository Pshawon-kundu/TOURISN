import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export function initFirebase(firebaseConfig: any) {
  if (!firebaseConfig) {
    console.error("❌ Firebase config is missing");
    return null;
  }

  try {
    // Check if app is already initialized
    const existingApps = getApps();
    if (existingApps.length === 0) {
      console.log("🔥 Initializing Firebase app...");
      app = initializeApp(firebaseConfig);
      console.log("✅ Firebase app initialized");
    } else {
      console.log("✅ Using existing Firebase app");
      app = existingApps[0];
    }

    // Initialize services
    db = getFirestore(app);
    auth = getAuth(app);

    console.log("✅ Firebase services initialized (Firestore & Auth)");
    return db;
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
    return null;
  }
}

export function getDb() {
  return db;
}

export function getAuthInstance() {
  return auth;
}

export function getAppInstance() {
  return app;
}

export function getChatRoomId(userId: string, guideId: string): string {
  // Create a consistent room ID regardless of order
  return [userId, guideId].sort().join("_");
}

export async function sendMessage(
  collectionPath: string,
  message: { text: string; from?: string; userName?: string }
) {
  if (!db) throw new Error("Firebase not initialized");
  const col = collection(db, collectionPath);
  return addDoc(col, {
    ...message,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(
  collectionPath: string,
  callback: (msgs: any[]) => void
) {
  if (!db) return () => {};
  const col = collection(db, collectionPath);
  const q = query(col, orderBy("createdAt", "asc"));
  const unsub = onSnapshot(q, (snap) => {
    const docs: any[] = [];
    snap.forEach((d) => {
      docs.push({ id: d.id, ...d.data() });
    });
    callback(docs);
  });
  return unsub;
}
