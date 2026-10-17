/// <reference types="vite/client" />

import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';

const requiredConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseAuth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (firebaseAuth) return firebaseAuth;
  const missing = Object.entries(requiredConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length) {
    throw new Error(`Firebase is not configured. Add the VITE_FIREBASE_* values in Vercel Environment Variables.`);
  }
  const app: FirebaseApp = getApps().length ? getApp() : initializeApp(requiredConfig);
  firebaseAuth = getAuth(app);
  return firebaseAuth;
}
