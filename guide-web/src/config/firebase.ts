// Firebase Admin configuration
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKfws5lifYwx8NxJn2oeYXWfIdgExgPOM",
  authDomain: "admin-toursin.firebaseapp.com",
  projectId: "admin-toursin",
  storageBucket: "admin-toursin.firebasestorage.app",
  messagingSenderId: "1094061926168",
  appId: "1:1094061926168:web:5e1a0a12f66f403f6c206d",
  measurementId: "G-5KRZB9QKZ3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;
