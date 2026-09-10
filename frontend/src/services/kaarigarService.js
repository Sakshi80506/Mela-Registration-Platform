import { 
  db, 
  storage, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  storageRef, 
  uploadBytes, 
  getDownloadURL 
} from './firebase';

const KAARIGARS_COLLECTION = 'kaarigars';

export const kaarigarService = {
  // Get all registered kaarigars
  async getAllKaarigars(craftTypeFilter = null) {
    try {
      const kRef = collection(db, KAARIGARS_COLLECTION);
      let q = kRef;
      if (craftTypeFilter) {
        q = query(kRef, where('craftType', '==', craftTypeFilter));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error fetching kaarigars:', error);
      throw error;
    }
  },

  // Get kaarigar profile by auth userId
  async getKaarigarByUserId(userId) {
    try {
      const q = query(collection(db, KAARIGARS_COLLECTION), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error fetching profile by userId:', error);
      throw error;
    }
  },

  // Get kaarigar profile by kaarigarId
  async getKaarigarById(kaarigarId) {
    try {
      const docRef = doc(db, KAARIGARS_COLLECTION, kaarigarId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        throw new Error('Artisan profile not found');
      }
      return { id: snapshot.id, ...snapshot.data() };
    } catch (error) {
      console.error('Error fetching kaarigar:', error);
      throw error;
    }
  },

  // Save or update kaarigar profile
  async saveProfile(userId, profileData, profilePhotoFile = null, craftPhotoFile = null) {
    try {
      let profilePhotoUrl = profileData.profilePhoto || '';
      let craftPhotoUrl = profileData.craftPhoto || '';

      // Upload profile image to Firebase Storage if provided
      if (profilePhotoFile) {
        try {
          const pRef = storageRef(storage, `kaarigars/${userId}/profile_${Date.now()}`);
          const snap = await uploadBytes(pRef, profilePhotoFile);
          profilePhotoUrl = await getDownloadURL(snap.ref);
        } catch (e) {
          console.warn('Storage upload fallback:', e);
        }
      }

      // Upload craft image to Firebase Storage if provided
      if (craftPhotoFile) {
        try {
          const cRef = storageRef(storage, `kaarigars/${userId}/craft_${Date.now()}`);
          const snap = await uploadBytes(cRef, craftPhotoFile);
          craftPhotoUrl = await getDownloadURL(snap.ref);
        } catch (e) {
          console.warn('Storage upload fallback:', e);
        }
      }

      const existing = await this.getKaarigarByUserId(userId);
      const payload = {
        ...profileData,
        userId,
        profilePhoto: profilePhotoUrl,
        craftPhoto: craftPhotoUrl,
        updatedAt: new Date().toISOString()
      };

      if (existing) {
        const docRef = doc(db, KAARIGARS_COLLECTION, existing.id);
        await updateDoc(docRef, payload);
        return { id: existing.id, ...payload };
      } else {
        payload.createdAt = new Date().toISOString();
        const docRef = doc(collection(db, KAARIGARS_COLLECTION));
        await setDoc(docRef, payload);
        return { id: docRef.id, ...payload };
      }
    } catch (error) {
      console.error('Error saving kaarigar profile:', error);
      throw error;
    }
  }
};
