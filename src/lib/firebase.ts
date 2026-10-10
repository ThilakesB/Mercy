import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth'

export interface FirebaseClientConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
}

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBMsynAWFClXSIt5jJwSH87grbsaZC-iBk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mercy-d9aaa.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mercy-d9aaa',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mercy-d9aaa.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '154595633017',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:154595633017:web:66c7ad18825140d50d71a8',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-KHS1PQXNDW',
}

// Initialize Firebase App singleton safely
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// Safely initialize Auth
export const auth: Auth = getAuth(app)
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// Safely initialize analytics in browser environments where indexedDB/cookies are supported
let analyticsInstance: Analytics | null = null
export const initAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === 'undefined') return null
  if (analyticsInstance) return analyticsInstance

  try {
    const supported = await isSupported()
    if (supported) {
      analyticsInstance = getAnalytics(app)
      return analyticsInstance
    }
  } catch (err) {
    console.warn('Firebase Analytics not supported in current environment:', err)
  }
  return null
}

// Auto-run analytics initialization in the browser
if (typeof window !== 'undefined') {
  initAnalytics().catch(() => {})
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
}

/**
 * Sign in using Firebase Google popup
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

/**
 * Sign out of Firebase Auth
 */
export async function signOutFromFirebase(): Promise<void> {
  await fbSignOut(auth)
}

export { onAuthStateChanged }
export type { User }
export default app
