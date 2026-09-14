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

// Convert File to compressed Data URL fallback if Firebase Storage is unavailable or hangs
const fileToOptimizedDataUrl = (file, maxWidth = 600, maxHeight = 600, quality = 0.75) => {
  return new Promise((resolve) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (err) {
          resolve(e.target.result);
        }
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

const uploadWithFallback = async (path, file, timeoutMs = 3000) => {
  if (!file) return '';
  try {
    const pRef = storageRef(storage, path);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timed out')), timeoutMs)
    );
    const snap = await Promise.race([uploadBytes(pRef, file), timeoutPromise]);
    const downloadUrl = await Promise.race([getDownloadURL(snap.ref), timeoutPromise]);
    return downloadUrl;
  } catch (err) {
    console.warn(`Storage upload for ${path} bypassed or timed out (${err.message}). Using optimized fallback image.`);
    return await fileToOptimizedDataUrl(file);
  }
};

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
    if (!userId) return null;
    try {
      // 1. Direct document check by ID == userId
      const directRef = doc(db, KAARIGARS_COLLECTION, userId);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        return { id: directSnap.id, ...directSnap.data() };
      }

      // 2. Query fallback where userId field matches
      const q = query(collection(db, KAARIGARS_COLLECTION), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        return { id: d.id, ...d.data() };
      }
      return null;
    } catch (error) {
      console.warn('Query for artisan profile fell back or warning:', error.message);
      return null;
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

      // Upload profile image to Firebase Storage (with safe timeout & fallback)
      if (profilePhotoFile) {
        const uploadedProfileUrl = await uploadWithFallback(
          `kaarigars/${userId}/profile_${Date.now()}`,
          profilePhotoFile
        );
        if (uploadedProfileUrl) {
          profilePhotoUrl = uploadedProfileUrl;
        }
      }

      // Upload craft image to Firebase Storage (with safe timeout & fallback)
      if (craftPhotoFile) {
        const uploadedCraftUrl = await uploadWithFallback(
          `kaarigars/${userId}/craft_${Date.now()}`,
          craftPhotoFile
        );
        if (uploadedCraftUrl) {
          craftPhotoUrl = uploadedCraftUrl;
        }
      }

      const existing = await this.getKaarigarByUserId(userId);
      const docId = existing ? existing.id : userId;

      const payload = {
        ...profileData,
        userId,
        profilePhoto: profilePhotoUrl,
        craftPhoto: craftPhotoUrl,
        updatedAt: new Date().toISOString()
      };

      if (!existing) {
        payload.createdAt = new Date().toISOString();
      }

      const docRef = doc(db, KAARIGARS_COLLECTION, docId);
      await setDoc(docRef, payload, { merge: true });
      return { id: docId, ...payload };
    } catch (error) {
      console.error('Error saving kaarigar profile:', error);
      throw error;
    }
  },

  // Delete kaarigar profile (Admin or account owner)
  async deleteKaarigar(kaarigarId) {
    try {
      const docRef = doc(db, KAARIGARS_COLLECTION, kaarigarId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting kaarigar profile:', error);
      throw error;
    }
  }
};

