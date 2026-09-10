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
        try {
          const cRef = storageRef(storage, `applications/${kaarigarId}/${eventId}_${Date.now()}`);
          const snap = await uploadBytes(cRef, craftImageFile);
          craftImageUrl = await getDownloadURL(snap.ref);
        } catch (e) {
          console.warn('Storage upload fallback:', e);
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
