// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDJWyEg9PeRTxZp2wE_FHj_VLOJsPRNTTA",
  authDomain: "campusresolve-144c8.firebaseapp.com",
  databaseURL: "https://campusresolve-144c8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "campusresolve-144c8",
  storageBucket: "campusresolve-144c8.firebasestorage.app",
  messagingSenderId: "578139933188",
  appId: "1:578139933188:web:a2f350fcaad5bc0c24c351"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export initialized services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
