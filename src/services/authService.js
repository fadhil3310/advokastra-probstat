import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  firebaseAuth,
  firebaseConfigurationError,
  isFirebaseConfigured,
} from '../lib/firebase';

function requireFirebaseAuth() {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw new Error(firebaseConfigurationError || 'Firebase Auth belum tersedia.');
  }
  return firebaseAuth;
}

export function mapFirebaseUser(user) {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || (user.isAnonymous ? 'Dosen / Tamu Penguji' : user.email),
    displayLabel: user.isAnonymous ? 'Tamu Penguji' : user.email,
    isGuest: user.isAnonymous,
  };
}

export function observeAuthState(callback) {
  if (!isFirebaseConfigured || !firebaseAuth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(firebaseAuth, (user) => callback(mapFirebaseUser(user)));
}

export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(
    requireFirebaseAuth(),
    email.trim(),
    password
  );
  return mapFirebaseUser(credential.user);
}

export async function loginAsGuest() {
  const credential = await signInAnonymously(requireFirebaseAuth());
  return mapFirebaseUser(credential.user);
}

export async function logoutFirebaseUser() {
  await signOut(requireFirebaseAuth());
}

const AUTH_ERROR_MESSAGES = {
  'auth/invalid-credential': 'Email atau kata sandi tidak valid.',
  'auth/invalid-email': 'Format email tidak valid.',
  'auth/missing-email': 'Email wajib diisi.',
  'auth/missing-password': 'Kata sandi wajib diisi.',
  'auth/too-many-requests': 'Terlalu banyak percobaan masuk. Coba kembali beberapa saat lagi.',
  'auth/network-request-failed': 'Koneksi ke Firebase gagal. Periksa koneksi internet Anda.',
  'auth/operation-not-allowed': 'Metode autentikasi ini belum diaktifkan di Firebase Console.',
};

export function getAuthErrorMessage(error) {
  return AUTH_ERROR_MESSAGES[error?.code] || error?.message || 'Autentikasi gagal.';
}

