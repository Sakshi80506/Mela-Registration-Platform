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
      const sessionRole = localStorage.getItem('active_portal_role');

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const activeRole = (sessionRole || data.role || 'visitor').toLowerCase();
        const profile = { uid: firebaseUser.uid, ...data, role: activeRole };
        setUserProfile(profile);

        // If active role is Kaarigar, fetch artisan profile
        if (activeRole === 'kaarigar') {
          try {
            const kProfile = await kaarigarService.getKaarigarByUserId(firebaseUser.uid);
            setKaarigarProfile(kProfile);
          } catch (e) {
            console.warn('Could not fetch artisan profile on auth change:', e);
          }
        }
        return profile;
      } else {
        const activeRole = (sessionRole || 'visitor').toLowerCase();
        const defaultProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          role: activeRole,
          createdAt: new Date().toISOString()
        };
        setUserProfile(defaultProfile);
        return defaultProfile;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const sessionRole = localStorage.getItem('active_portal_role') || 'visitor';
      const fallback = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        role: sessionRole
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

  // Register with role (kaarigar or visitor or admin)
  const register = async (name, email, password, role = 'visitor', phone = '') => {
    try {
      const targetRole = role.toLowerCase();
      localStorage.setItem('active_portal_role', targetRole);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth display name
      await updateProfile(user, { displayName: name });

      // Create document in users collection
      const userDocData = {
        uid: user.uid,
        name,
        email,
        role: targetRole,
        phone: phone || '',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userDocData);
      setUserProfile(userDocData);

      // If registered as Kaarigar, also initialize kaarigar profile shell
      if (targetRole === 'kaarigar') {
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

  // Login with explicit role selection (guarantees chosen role is active)
  const login = async (email, password, desiredRole = null) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let targetRole = (desiredRole || 'visitor').toLowerCase();
      localStorage.setItem('active_portal_role', targetRole);

      // Fetch base profile
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let userData = userDocSnap.exists() ? userDocSnap.data() : {};

      // If user logs in as Admin, check if they are admin or save admin
      if (targetRole === 'admin' && userData.role && userData.role !== 'admin') {
        targetRole = userData.role;
        localStorage.setItem('active_portal_role', targetRole);
      } else {
        // Sync the chosen role into Firestore
        await setDoc(userDocRef, { role: targetRole, updatedAt: new Date().toISOString() }, { merge: true });
      }

      const activeProfile = {
        uid: user.uid,
        name: user.displayName || userData.name || 'User',
        email: user.email,
        phone: userData.phone || '',
        ...userData,
        role: targetRole
      };

      setUserProfile(activeProfile);

      // If Kaarigar role is selected, load or create the artisan profile
      if (targetRole === 'kaarigar') {
        try {
          let kp = await kaarigarService.getKaarigarByUserId(user.uid);
          if (!kp) {
            const kData = {
              userId: user.uid,
              name: activeProfile.name || 'Artisan',
              email: user.email,
              phone: activeProfile.phone || '',
              craftType: '',
              description: '',
              city: '',
              state: '',
              profilePhoto: '',
              craftPhoto: '',
              createdAt: new Date().toISOString()
            };
            kp = await kaarigarService.saveProfile(user.uid, kData);
          }
          setKaarigarProfile(kp);
        } catch (e) {
          console.warn('Kaarigar profile sync warning:', e);
        }
      } else {
        setKaarigarProfile(null);
      }

      return activeProfile;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Switch role on the fly (between Kaarigar and Visitor)
  const switchRole = async (newRole) => {
    if (!currentUser) return;
    const targetRole = newRole.toLowerCase();
    try {
      localStorage.setItem('active_portal_role', targetRole);

      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, { role: targetRole, updatedAt: new Date().toISOString() }, { merge: true });
      
      const updatedProfile = { ...userProfile, role: targetRole };
      setUserProfile(updatedProfile);

      if (targetRole === 'kaarigar') {
        let kp = await kaarigarService.getKaarigarByUserId(currentUser.uid);
        if (!kp) {
          const kData = {
            userId: currentUser.uid,
            name: userProfile?.name || currentUser.displayName || 'Artisan',
            email: currentUser.email,
            phone: userProfile?.phone || '',
            craftType: '',
            description: '',
            city: '',
            state: '',
            profilePhoto: '',
            craftPhoto: '',
            createdAt: new Date().toISOString()
          };
          kp = await kaarigarService.saveProfile(currentUser.uid, kData);
        }
        setKaarigarProfile(kp);
      } else {
        setKaarigarProfile(null);
      }

      return updatedProfile;
    } catch (err) {
      console.error('Error switching role:', err);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      localStorage.removeItem('active_portal_role');
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
    switchRole,
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
