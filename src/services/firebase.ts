import { getApps, initializeApp, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
  getDocFromServer,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// --- Error Handling & Metrics ---
interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) => {
  const user = auth.currentUser;
  const errorInfo: FirestoreErrorInfo = {
    error: error?.message || "Unknown Firestore Error",
    operationType,
    path,
    authInfo: {
      userId: user?.uid || 'anonymous',
      email: user?.email || '',
      emailVerified: user?.emailVerified || false,
      isAnonymous: user?.isAnonymous || true,
      providerInfo: user?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || ''
      })) || []
    }
  };

  console.error(`[Firestore Error - ${operationType}]`, errorInfo);
  if (error?.message?.includes('insufficient permissions')) {
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};

// Singleton-style initialization for App and Auth
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Set persistence to LOCAL (IndexedDB/LocalStorage) to avoid dependency on cookies for session storage
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Auth persistence setup failed:", err);
});

// Use a variable to hold Firestore instance to handle potential re-init errors
let firestoreInstance: Firestore;

try {
  firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      tabManager: persistentMultipleTabManager()
    })
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  // If already initialized with different settings or by a previous HMR cycle, 
  // we fall back to getFirestore which returns the existing instance.
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;

/**
 * Diagnostic connection check with retry logic.
 */
export const verifyConnection = async (retries = 3): Promise<{ success: boolean, error?: string, restricted?: boolean }> => {
  for (let i = 0; i < retries; i++) {
    try {
      await getDocFromServer(doc(db, 'settings', 'config'));
      return { success: true };
    } catch (error: any) {
      if (error?.code === 'permission-denied' || error?.message?.includes('permission-denied')) {
        return { success: true, restricted: true };
      }
      
      const isRetryable = error?.message?.toLowerCase().includes('offline') || 
                          error?.code === 'unavailable' ||
                          error?.code === 'available';
      
      if (isRetryable && i < retries - 1) {
        console.warn(`Firestore availability check ${i + 1} failed. Retrying in 2s...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      return { success: false, error: error?.message || "Unknown connection error" };
    }
  }
  return { success: false, error: "Connection timed out after retries" };
};

// Delayed silent check to avoid boot noise
setTimeout(() => {
  verifyConnection().then(res => {
    if (res.success) {
      console.log("Firestore connection: Active");
    } else {
      console.warn("Firestore connection: Offline or Delayed. Check Firebase setup.", res.error);
    }
  });
}, 8000);

const googleProvider = new GoogleAuthProvider();

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string | null;
  photoURL: string | null;
}

// List of Super Admins (hardcoded for initial bootstrap as requested)
const BOOTSTRAP_SUPER_ADMINS = ['mohammaduzzalmiah.bd@gmail.com'];

export const clearAuthCache = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('foundation_profile');
    // Clear Firestore cache indirectly by reloading or specific API if needed
    window.location.reload();
  } catch (error) {
    console.error("Error clearing auth cache", error);
  }
};

export const signInWithGoogle = async () => {
  try {
    // Popup is preferred to maintain the session in the same window context
    // and avoid iframe redirect issues.
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    
    // Check for specific cross-origin or blocked iframe errors
    if (error.code === 'auth/network-request-failed' || error.message?.includes('cross-origin')) {
       throw new Error("আপনার ব্রাউজারের সিকিউরিটি সেটিংস বা পপ-আপ ব্লকার সিঙ্ক হতে বাধা দিচ্ছে। অনুগ্রহ করে পপ-আপ এলাউ করুন অথবা সরাসরি ব্রাউজারে অ্যাপটি ওপেন করুন।");
    }
    throw error;
  }
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error("Error handling redirect result", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

/**
 * Retrieves the current user's JWT ID Token.
 * Useful for verified token-based authentication without relying on platform-managed cookies.
 */
export const getSessionToken = async (forceRefresh = false): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error("Error retrieving JWT token:", error);
    return null;
  }
};

export const syncUserDocument = async (user: FirebaseUser): Promise<AppUser> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as AppUser;
    }

    // Determine initial role
    let role: UserRole = 'USER';
    if (user.email && BOOTSTRAP_SUPER_ADMINS.includes(user.email)) {
      role = 'SUPER_ADMIN';
    }

    const newUser: AppUser = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName,
      photoURL: user.photoURL,
      role,
    };

    await setDoc(userRef, {
      ...newUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newUser;
  } catch (error) {
    handleFirestoreError(error, 'write', `users/${user.uid}`);
    // Rollback or return a minimal user object to avoid crashing
    return {
      uid: user.uid,
      email: user.email || '',
      role: 'USER',
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }
};

export const getAllUsers = async (): Promise<AppUser[]> => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => doc.data() as AppUser);
};

export const updateUserRole = async (uid: string, role: UserRole) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { 
    role,
    updatedAt: serverTimestamp()
  });
};

// --- Blood Donors Management ---
export const getBloodDonors = async (): Promise<any[]> => {
  try {
    const donorsRef = collection(db, 'donors');
    const snapshot = await getDocs(donorsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, 'list', 'donors');
    return [];
  }
};

export const addBloodDonor = async (donor: any) => {
  try {
    const donorsRef = collection(db, 'donors');
    const docRef = doc(donorsRef, donor.id || undefined);
    const data = {
      ...donor,
      createdAt: serverTimestamp()
    };
    if (data.id) delete data.id;
    
    await setDoc(docRef, data);
    return { success: true, id: docRef.id };
  } catch (error) {
    handleFirestoreError(error, 'create', 'donors');
    return { success: false, error };
  }
};

export const deleteBloodDonor = async (id: string) => {
  try {
    const donorRef = doc(db, 'donors', id);
    await deleteDoc(donorRef);
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, 'delete', `donors/${id}`);
    throw error;
  }
};

// --- Generic Collections Management ---
export const getCollectionData = async (collectionName: string): Promise<any[]> => {
  try {
    const ref = collection(db, collectionName);
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, 'list', collectionName);
    return [];
  }
};

export const upsertDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, 'write', `${collectionName}/${id}`);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, 'delete', `${collectionName}/${id}`);
    throw error;
  }
};

// Specific helpers for cleanliness
export const getMembers = () => getCollectionData('members');
export const updateMember = (id: string, data: any) => upsertDocument('members', id, data);
export const deleteMember = (id: string) => deleteDocument('members', id);

export const getTransactions = () => getCollectionData('transactions');
export const updateTransaction = (id: string, data: any) => upsertDocument('transactions', id, data);
export const deleteTransaction = (id: string) => deleteDocument('transactions', id);

export const getNotices = () => getCollectionData('notices');
export const updateNotice = (id: string, data: any) => upsertDocument('notices', id, data);
export const deleteNotice = (id: string) => deleteDocument('notices', id);

export const getConstitution = () => getCollectionData('constitution');
export const updateConstitutionSection = (id: string, data: any) => upsertDocument('constitution', id, data);

// --- Settings Management ---
export const getAppSettingsFromFirestore = async (): Promise<any | null> => {
  try {
    const settingsRef = doc(db, 'settings', 'config');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    // Only log, don't throw to avoid breaking the UI for public users
    console.warn("Retrying settings fetch from server...");
    try {
      const snap = await getDocFromServer(doc(db, 'settings', 'config'));
      return snap.data();
    } catch (innerError) {
      handleFirestoreError(innerError, 'get', 'settings/config');
      return null;
    }
  }
};

export const updateAppSettingsInFirestore = async (settings: any) => {
  try {
    const settingsRef = doc(db, 'settings', 'config');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating app settings:", error);
    handleFirestoreError(error, 'write' as any, 'settings/config');
    throw error;
  }
};
