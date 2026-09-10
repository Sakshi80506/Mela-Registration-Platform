import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from './firebase';

const EVENTS_COLLECTION = 'events';
const APPLICATIONS_COLLECTION = 'kaarigarApplications';
const VISITORS_COLLECTION = 'visitorRegistrations';

export const eventService = {
  // Get all events with optional status filter
  async getAllEvents(statusFilter = null) {
    try {
      const eventsRef = collection(db, EVENTS_COLLECTION);
      let q = eventsRef;
      if (statusFilter) {
        q = query(eventsRef, where('status', '==', statusFilter));
      }
      const snapshot = await getDocs(q);
      const events = [];

      for (const document of snapshot.docs) {
        const eventData = { id: document.id, ...document.data() };
        
        // Fetch approved artisans count dynamically
        try {
          const appQ = query(
            collection(db, APPLICATIONS_COLLECTION),
            where('eventId', '==', document.id),
            where('status', '==', 'approved')
          );
          const appSnap = await getDocs(appQ);
          eventData.approvedArtisansCount = appSnap.size;
        } catch {
          eventData.approvedArtisansCount = 0;
        }

        // Fetch registered visitors count dynamically
        try {
          const visQ = query(
            collection(db, VISITORS_COLLECTION),
            where('eventId', '==', document.id)
          );
          const visSnap = await getDocs(visQ);
          eventData.registeredVisitorsCount = visSnap.size;
        } catch {
          eventData.registeredVisitorsCount = 0;
        }

        events.push(eventData);
      }
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get upcoming events
  async getUpcomingEvents() {
    return this.getAllEvents('upcoming');
  },

  // Get single event by ID with approved artisans
  async getEventById(eventId) {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, eventId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Event not found');
      }

      const eventData = { id: docSnap.id, ...docSnap.data() };

      // Fetch approved artisans for this event
      const appQ = query(
        collection(db, APPLICATIONS_COLLECTION),
        where('eventId', '==', eventId),
        where('status', '==', 'approved')
      );
      const appSnap = await getDocs(appQ);
      
      const approvedArtisans = [];
      for (const appDoc of appSnap.docs) {
        const appData = appDoc.data();
        if (appData.kaarigarId) {
          try {
            const kRef = doc(db, 'kaarigars', appData.kaarigarId);
            const kSnap = await getDoc(kRef);
            if (kSnap.exists()) {
              approvedArtisans.push({
                applicationId: appDoc.id,
                ...kSnap.data(),
                id: kSnap.id,
                craftDescription: appData.description || kSnap.data().description,
                craftImage: appData.craftImage || kSnap.data().craftPhoto
              });
            }
          } catch (e) {
            console.warn('Could not fetch artisan profile', e);
          }
        }
      }

      eventData.approvedArtisans = approvedArtisans;
      eventData.approvedArtisansCount = approvedArtisans.length;

      // Fetch visitors count
      const visQ = query(
        collection(db, VISITORS_COLLECTION),
        where('eventId', '==', eventId)
      );
      const visSnap = await getDocs(visQ);
      eventData.registeredVisitorsCount = visSnap.size;

      return eventData;
    } catch (error) {
      console.error('Error fetching event details:', error);
      throw error;
    }
  },

  // Create new event (Admin only)
  async createEvent(eventData, adminUid) {
    try {
      const docData = {
        ...eventData,
        status: eventData.status || 'upcoming',
        createdBy: adminUid || 'admin',
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), docData);
      return { id: docRef.id, ...docData };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update event
  async updateEvent(eventId, updateData) {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, eventId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      return { id: eventId, ...updateData };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete event
  async deleteEvent(eventId) {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, eventId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
};
