import { getApps, initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

let db: ReturnType<typeof getFirestore> | null = null;

export function initFirebase(firebaseConfig: any) {
  if (!firebaseConfig) return null;
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  db = getFirestore();
  return db;
}

export function getDb() {
  return db;
}

export async function sendMessage(
  collectionPath: string,
  message: { text: string; from?: string }
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
