import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDgo8tCqflhIEMuuqzdwmegumPjM3nohGY",
    authDomain: "devdeakinp4-a8fb3.firebaseapp.com",
    projectId: "devdeakinp4-a8fb3",
    storageBucket: "devdeakinp4-a8fb3.firebasestorage.app",
    messagingSenderId: "65342889248",
    appId: "1:65342889248:web:1241c614bc4d85cf5c0b45",
    measurementId: "G-JC7WYSSW7W"
};

// Initialize Firebase
const app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;