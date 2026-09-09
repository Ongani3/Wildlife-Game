import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
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
import { LeaderboardEntry, Puzzle, UserProfile } from '../types';
import { STARTER_PUZZLES } from '../data/puzzles';
import appletConfig from '../../firebase-applet-config.json';

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

// Check for client configuration from firebase-applet-config.json or environment
const firebaseConfig = {
  apiKey: appletConfig?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: appletConfig?.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: appletConfig?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: appletConfig?.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: appletConfig?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: appletConfig?.appId || import.meta.env.VITE_FIREBASE_APP_ID || '',
  firestoreDatabaseId: appletConfig?.firestoreDatabaseId || '',
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
    const dbId = firebaseConfig.firestoreDatabaseId;
    db = dbId ? getFirestore(firebaseApp, dbId) : getFirestore(firebaseApp);
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

const LOCAL_SCORES_KEY = 'luangwa_leaderboard_records';

export const DEFAULT_RANGER_STANDINGS: LeaderboardEntry[] = [
  {
    id: 'scout-mfuwe-01',
    userId: 'scout-01',
    displayName: 'Mfuwe Conservation Ranger',
    score: 2850,
    accuracy: 95,
    region: 'south-luangwa',
    date: 'Expedition',
    isDaily: true,
  },
  {
    id: 'scout-busanga-02',
    userId: 'scout-02',
    displayName: 'Busanga Plains Guide',
    score: 2420,
    accuracy: 90,
    region: 'kafue',
    date: 'Expedition',
    isDaily: false,
  },
  {
    id: 'scout-chiawa-03',
    userId: 'scout-03',
    displayName: 'Chiawa Zambezi Scout',
    score: 2180,
    accuracy: 88,
    region: 'lower-zambezi',
    date: 'Expedition',
    isDaily: true,
  },
  {
    id: 'scout-kasanka-04',
    userId: 'scout-04',
    displayName: 'Bangweulu Shoebill Tracker',
    score: 1950,
    accuracy: 85,
    region: 'all-zambia',
    date: 'Expedition',
    isDaily: false,
  },
];

function getStoredLocalScores(): LeaderboardEntry[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_SCORES_KEY) : null;
    if (!raw) return DEFAULT_RANGER_STANDINGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RANGER_STANDINGS;
  } catch {
    return DEFAULT_RANGER_STANDINGS;
  }
}

function saveStoredLocalScores(scores: LeaderboardEntry[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(scores.slice(0, 50)));
    }
  } catch (e) {
    console.warn('Could not cache leaderboard scores locally:', e);
  }
}

// Submit score to Firestore & sync locally
export async function submitScoreToFirestore(scoreData: {
  userId: string;
  displayName: string;
  score: number;
  accuracy: number;
  region: string;
  isDaily?: boolean;
}): Promise<boolean> {
  const newEntry: LeaderboardEntry = {
    id: `score-${Date.now()}`,
    userId: scoreData.userId,
    displayName: scoreData.displayName,
    score: scoreData.score,
    accuracy: scoreData.accuracy,
    region: scoreData.region,
    date: new Date().toLocaleDateString(),
    isDaily: Boolean(scoreData.isDaily),
  };

  // Always record locally so player instantly sees their rank
  const existing = getStoredLocalScores().filter(
    (e) => !(e.userId === scoreData.userId && e.score === scoreData.score)
  );
  const updated = [newEntry, ...existing].sort((a, b) => b.score - a.score);
  saveStoredLocalScores(updated);

  const firestore = getDb();
  if (!firestore) return true;

  const authInstance = getFirebaseAuth();
  let currentUid = authInstance?.currentUser?.uid;
  if (!currentUid && authInstance) {
    try {
      const anon = await signInAnonymousUser();
      currentUid = anon?.uid;
    } catch {
      // continue
    }
  }

  const path = 'scores';
  try {
    await addDoc(collection(firestore, path), {
      ...scoreData,
      userId: currentUid || scoreData.userId,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore sync note:', err);
    return true;
  }
}

// Fetch global leaderboard from Firestore or fallback to cached standings
export async function fetchGlobalLeaderboard(limitCount = 20): Promise<LeaderboardEntry[]> {
  const firestore = getDb();
  if (!firestore) {
    return getStoredLocalScores().slice(0, limitCount);
  }

  const path = 'scores';
  try {
    const q = query(collection(firestore, path), orderBy('score', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getStoredLocalScores().slice(0, limitCount);
    }
    const onlineScores = snapshot.docs.map((doc) => {
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
    return onlineScores;
  } catch (err) {
    console.warn('Using local scout standings fallback:', err);
    return getStoredLocalScores().slice(0, limitCount);
  }
}

// Fetch wildlife puzzles from Firestore, fallback to cached starter puzzles
export async function fetchPuzzlesFromFirestore(): Promise<Puzzle[]> {
  const firestore = getDb();
  if (!firestore) return STARTER_PUZZLES;

  const path = 'puzzles';
  try {
    const snapshot = await getDocs(collection(firestore, path));
    if (snapshot.empty) {
      return STARTER_PUZZLES;
    }
    const puzzles: Puzzle[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as Puzzle;
      puzzles.push({
        ...data,
        id: d.id,
      });
    });
    return puzzles.length > 0 ? puzzles : STARTER_PUZZLES;
  } catch (err) {
    console.warn('Could not fetch puzzles from Firestore, using offline cache:', err);
    return STARTER_PUZZLES;
  }
}

// Track completed puzzle in user document on Firestore
export async function saveCompletedPuzzleToFirestore(
  userId: string,
  puzzleId: string
): Promise<void> {
  const firestore = getDb();
  if (!firestore || !userId) return;

  const userDocRef = doc(firestore, 'users', userId);
  try {
    await updateDoc(userDocRef, {
      completedPuzzles: arrayUnion(puzzleId),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // If document doesn't exist yet, create it with setDoc merge
    try {
      await setDoc(
        userDocRef,
        {
          uid: userId,
          completedPuzzles: [puzzleId],
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Could not sync completed puzzle to Firestore:', e);
    }
  }
}

// Sync full user profile with badges and scores to Firestore
export async function syncUserProfileToFirestore(user: UserProfile): Promise<void> {
  const firestore = getDb();
  if (!firestore || !user.uid) return;

  const userDocRef = doc(firestore, 'users', user.uid);
  try {
    await setDoc(
      userDocRef,
      {
        uid: user.uid,
        displayName: user.displayName,
        totalQuizzesPlayed: user.totalQuizzesPlayed,
        highestScore: user.highestScore,
        highestStreak: user.highestStreak,
        unlockedBadges: user.unlockedBadges,
        unlockedRegions: user.unlockedRegions,
        completedPuzzles: user.completedPuzzles || [],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not sync user profile to Firestore:', err);
  }
}
