import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously as fbSignInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { LeaderboardEntry } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

// Check for client configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!db) {
    db = getFirestore(firebaseApp);
  }
  return db;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) {
    auth = getAuth(firebaseApp);
  }
  return auth;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentAuth = getFirebaseAuth();
  const currentUser = currentAuth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error caught:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Authentication Helpers
export async function signInAnonymousUser(): Promise<User | null> {
  const authInstance = getFirebaseAuth();
  if (!authInstance) return null;
  try {
    const cred = await fbSignInAnonymously(authInstance);
    return cred.user;
  } catch (err) {
    console.warn('Anonymous sign-in not available or failed:', err);
    return null;
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  const authInstance = getFirebaseAuth();
  if (!authInstance) return null;
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(authInstance, provider);
    return cred.user;
  } catch (err) {
    console.warn('Google sign-in failed:', err);
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  const authInstance = getFirebaseAuth();
  if (!authInstance) return;
  await fbSignOut(authInstance);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(authInstance, callback);
}

// Submit score to Firestore
export async function submitScoreToFirestore(scoreData: {
  userId: string;
  displayName: string;
  score: number;
  accuracy: number;
  region: string;
  isDaily?: boolean;
}): Promise<boolean> {
  const firestore = getDb();
  if (!firestore) return false;

  const path = 'scores';
  try {
    await addDoc(collection(firestore, path), {
      ...scoreData,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Fetch global leaderboard from Firestore
export async function fetchGlobalLeaderboard(limitCount = 20): Promise<LeaderboardEntry[]> {
  const firestore = getDb();
  if (!firestore) return [];

  const path = 'scores';
  try {
    const q = query(collection(firestore, path), orderBy('score', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId || 'anon',
        displayName: data.displayName || 'Safari Scout',
        score: Number(data.score) || 0,
        accuracy: Number(data.accuracy) || 0,
        region: data.region || 'all-zambia',
        date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString(),
        isDaily: Boolean(data.isDaily),
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
