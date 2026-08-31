// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAjX1NuY1yyueGpHL9ojqeqC065zv0OM3c",
  authDomain: "bhadabook-9ba62.firebaseapp.com",
  projectId: "bhadabook-9ba62",
  storageBucket: "bhadabook-9ba62.firebasestorage.app",
  messagingSenderId: "845123566014",
  appId: "1:845123566014:web:077ba12be8f3cfe16a61ef",
  measurementId: "G-ZB42NPSEPJ"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);