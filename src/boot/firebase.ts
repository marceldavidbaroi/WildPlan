import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

// Define the shape of your Firebase config
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Get config from environment variables with non-null assertion (assuming they're set)
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY!,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN!,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID!,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: import.meta.env.VITE_FIREBASE_APP_ID!,
};

// Initialize Firebase app
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services with explicit types
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
// console.log('Firebase initialized with config:', firebaseConfig);
export { app, auth, db };
