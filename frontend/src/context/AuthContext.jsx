// @refresh reset
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  doc, 
  getDoc, 
  setDoc,
  updateProfile
} from '../services/firebase';
import { kaarigarService } from '../services/kaarigarService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [kaarigarProfile, setKaarigarProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile from Firestore
  const fetchUserProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setUserProfile(null);
      setKaarigarProfile(null);
      return null;
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const profile = { uid: firebaseUser.uid, ...userDocSnap.data() };
        setUserProfile(profile);

        // If user is a Kaarigar, fetch their artisan profile as well
        if (profile.role === 'kaarigar') {
          try {
            const kProfile = await kaarigarService.getKaarigarByUserId(firebaseUser.uid);
            setKaarigarProfile(kProfile);
          } catch (e) {
            console.warn('Could not fetch artisan profile on auth change:', e);
          }
        }
        return profile;
      } else {
        // Fallback default if users collection document was not created yet
        const defaultProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          role: 'visitor', // Default fallback
          createdAt: new Date().toISOString()
        };
        setUserProfile(defaultProfile);
        return defaultProfile;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const fallback = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        role: 'visitor'
      };
      setUserProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
        setKaarigarProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register with role (kaarigar or visitor)
  const register = async (name, email, password, role = 'visitor', phone = '') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth display name
      await updateProfile(user, { displayName: name });

      // Create document in users collection
      const userDocData = {
        uid: user.uid,
        name,
        email,
        role: role.toLowerCase(),
        phone: phone || '',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userDocData);
      setUserProfile(userDocData);

      // If registered as Kaarigar, also initialize empty kaarigar profile shell
      if (role.toLowerCase() === 'kaarigar') {
        const kData = {
          userId: user.uid,
          name,
          email,
          phone: phone || '',
          craftType: '',
          description: '',
          city: '',
          state: '',
          profilePhoto: '',
          craftPhoto: '',
          createdAt: new Date().toISOString()
        };
        await kaarigarService.saveProfile(user.uid, kData);
        setKaarigarProfile(kData);
      }

      return userDocData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(userCredential.user);
      return profile;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setKaarigarProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Refresh artisan profile in context
  const refreshKaarigarProfile = async () => {
    if (currentUser) {
      const kp = await kaarigarService.getKaarigarByUserId(currentUser.uid);
      setKaarigarProfile(kp);
    }
  };

  const value = {
    currentUser,
    userProfile,
    kaarigarProfile,
    role: userProfile?.role || null,
    isAdmin: userProfile?.role === 'admin',
    isKaarigar: userProfile?.role === 'kaarigar',
    isVisitor: userProfile?.role === 'visitor',
    loading,
    login,
    register,
    logout,
    refreshKaarigarProfile,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
