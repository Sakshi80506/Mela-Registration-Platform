import { 
  db, 
  storage, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  storageRef, 
  uploadBytes, 
  getDownloadURL 
} from './firebase';

const APPLICATIONS_COLLECTION = 'kaarigarApplications';
const EVENTS_COLLECTION = 'events';
const KAARIGARS_COLLECTION = 'kaarigars';

// Convert File to compressed Data URL fallback if Firebase Storage is unavailable or hangs
const fileToOptimizedDataUrl = (file, maxWidth = 800, maxHeight = 800, quality = 0.75) => {
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

export const applicationService = {
  // Kaarigar submits application for a mela
  async applyForMela(kaarigarId, eventId, applicationData, craftImageFile = null) {
    try {
      // Check if already applied to this mela
      const existingQ = query(
        collection(db, APPLICATIONS_COLLECTION),
        where('kaarigarId', '==', kaarigarId),
        where('eventId', '==', eventId)
      );
      const existingSnap = await getDocs(existingQ);
      if (!existingSnap.empty) {
        throw new Error('You have already applied for this Mela.');
      }

      let craftImageUrl = applicationData.craftImage || '';
      if (craftImageFile) {
        const uploadedUrl = await uploadWithFallback(
          `applications/${kaarigarId}/${eventId}_${Date.now()}`,
          craftImageFile
        );
        if (uploadedUrl) {
          craftImageUrl = uploadedUrl;
        }
      }

      const payload = {
        kaarigarId,
        eventId,
        craftType: applicationData.craftType,
        description: applicationData.description,
        craftImage: craftImageUrl,
        message: applicationData.message || '',
        status: 'pending', // Default status must be pending
        appliedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null
      };

      const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error('Error applying for mela:', error);
      throw error;
    }
  },

  // Get applications for a specific Kaarigar
  async getMyApplications(kaarigarId) {
    try {
      const q = query(
        collection(db, APPLICATIONS_COLLECTION),
        where('kaarigarId', '==', kaarigarId)
      );
      const snapshot = await getDocs(q);
      const applications = [];

      for (const document of snapshot.docs) {
        const appData = { id: document.id, ...document.data() };
        
        // Enrich with event information
        try {
          const evRef = doc(db, EVENTS_COLLECTION, appData.eventId);
          const evSnap = await getDoc(evRef);
          if (evSnap.exists()) {
            appData.event = { id: evSnap.id, ...evSnap.data() };
          }
        } catch (e) {
          console.warn('Could not fetch event for application', e);
        }

        applications.push(appData);
      }

      return applications;
    } catch (error) {
      console.error('Error fetching kaarigar applications:', error);
      throw error;
    }
  },

  // Get all applications (Admin) with filters
  async getAllApplications(statusFilter = null, eventIdFilter = null) {
    try {
      const appRef = collection(db, APPLICATIONS_COLLECTION);
      let q = appRef;
      
      if (statusFilter && statusFilter !== 'all') {
        q = query(appRef, where('status', '==', statusFilter));
      }
      
      const snapshot = await getDocs(q);
      let applications = [];

      for (const document of snapshot.docs) {
        const appData = { id: document.id, ...document.data() };

        if (eventIdFilter && eventIdFilter !== 'all' && appData.eventId !== eventIdFilter) {
          continue;
        }

        // Enrich with event data
        try {
          const evRef = doc(db, EVENTS_COLLECTION, appData.eventId);
          const evSnap = await getDoc(evRef);
          if (evSnap.exists()) {
            appData.event = { id: evSnap.id, ...evSnap.data() };
          }
        } catch (e) {}

        // Enrich with artisan data
        try {
          const kRef = doc(db, KAARIGARS_COLLECTION, appData.kaarigarId);
          const kSnap = await getDoc(kRef);
          if (kSnap.exists()) {
            appData.kaarigar = { id: kSnap.id, ...kSnap.data() };
          }
        } catch (e) {}

        applications.push(appData);
      }

      return applications;
    } catch (error) {
      console.error('Error fetching applications for admin:', error);
      throw error;
    }
  },

  // Admin approves or rejects application
  async updateApplicationStatus(applicationId, newStatus, adminUid, reviewNotes = '') {
    try {
      if (!['approved', 'rejected', 'pending'].includes(newStatus)) {
        throw new Error('Invalid application status');
      }

      const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
      const updateData = {
        status: newStatus,
        reviewedAt: new Date().toISOString(),
        reviewedBy: adminUid || 'admin',
        reviewNotes: reviewNotes || null
      };

      await updateDoc(docRef, updateData);
      return { id: applicationId, ...updateData };
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }
};
