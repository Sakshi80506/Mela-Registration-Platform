import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCR99KFaf6cLehmM_1PIPTBYebwT1nTpM8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kaarigar-expo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kaarigar-expo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kaarigar-expo.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "371615538367",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:371615538367:web:a2e22e531ab26c3b5bfa0a"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  storageRef,
  uploadBytes,
  getDownloadURL
};

export default app;
