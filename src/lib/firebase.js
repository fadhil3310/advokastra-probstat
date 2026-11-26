import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingConfigKeys = requiredConfigKeys.filter(
  (key) => !String(firebaseConfig[key] ?? '').trim()
);

export const isFirebaseConfigured = missingConfigKeys.length === 0;
export const firebaseConfigurationError = isFirebaseConfigured
  ? null
  : `Konfigurasi Firebase belum lengkap: ${missingConfigKeys.join(', ')}. Salin .env.example ke .env.local lalu isi nilai proyek Firebase.`;

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;

if (isFirebaseConfigured) {
  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  firestoreDb = getFirestore(firebaseApp);
}

export { firebaseApp, firebaseAuth, firestoreDb };

