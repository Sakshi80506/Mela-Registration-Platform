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
import { calculateEventStatus } from '../utils/eventUtils';

const EVENTS_COLLECTION = 'events';
const APPLICATIONS_COLLECTION = 'kaarigarApplications';
const VISITORS_COLLECTION = 'visitorRegistrations';

export const eventService = {
  // Get all events with dynamic auto-detected status
  async getAllEvents(statusFilter = null) {
    try {
      const eventsRef = collection(db, EVENTS_COLLECTION);
      const snapshot = await getDocs(eventsRef);
      const events = [];

      for (const document of snapshot.docs) {
        const rawData = document.data();
        const computedStatus = calculateEventStatus(rawData);

        const eventData = { 
          id: document.id, 
          ...rawData,
          status: computedStatus
        };
        
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

        if (!statusFilter || computedStatus === statusFilter.toLowerCase()) {
          events.push(eventData);
        }
      }

      // Sort: ongoing events first, then upcoming (earliest date first), then closed (most recent past first)
      events.sort((a, b) => {
        const order = { ongoing: 0, upcoming: 1, closed: 2 };
        const orderA = order[a.status] ?? 3;
        const orderB = order[b.status] ?? 3;
        if (orderA !== orderB) return orderA - orderB;

        const dateA = a.startDate || a.date || '';
        const dateB = b.startDate || b.date || '';
        if (a.status === 'closed') {
          return dateB.localeCompare(dateA); // Past events: recent first
        }
        return dateA.localeCompare(dateB); // Upcoming: earliest first
      });

      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get upcoming and ongoing active exhibitions
  async getUpcomingEvents() {
    try {
      const allEvents = await this.getAllEvents();
      // Return events that are either upcoming or currently ongoing
      return allEvents.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
    } catch (error) {
      console.error('Error fetching upcoming/ongoing events:', error);
      throw error;
    }
  },

  // Get single event by ID with approved artisans and computed status
  async getEventById(eventId) {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, eventId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Event not found');
      }

      const rawData = docSnap.data();
      const computedStatus = calculateEventStatus(rawData);
      const eventData = { 
        id: docSnap.id, 
        ...rawData,
        status: computedStatus
      };

      // Fetch approved artisans for this event (safely)
      const approvedArtisans = [];
      try {
        const appQ = query(
          collection(db, APPLICATIONS_COLLECTION),
          where('eventId', '==', eventId),
          where('status', '==', 'approved')
        );
        const appSnap = await getDocs(appQ);
        
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
      } catch (err) {
        console.warn('Could not fetch approved artisans for event:', err);
      }

      eventData.approvedArtisans = approvedArtisans;
      eventData.approvedArtisansCount = approvedArtisans.length || eventData.approvedArtisansCount || 0;

      // Fetch visitors count (safely)
      try {
        const visQ = query(
          collection(db, VISITORS_COLLECTION),
          where('eventId', '==', eventId)
        );
        const visSnap = await getDocs(visQ);
        eventData.registeredVisitorsCount = visSnap.size;
      } catch (err) {
        console.warn('Could not fetch visitors count for event:', err);
        eventData.registeredVisitorsCount = eventData.registeredVisitorsCount || 0;
      }

      return eventData;
    } catch (error) {
      console.error('Error fetching event details:', error);
      throw error;
    }
  },

  // Create new event (Admin only) with auto-computed initial status
  async createEvent(eventData, adminUid) {
    try {
      const computedStatus = calculateEventStatus(eventData);
      const docData = {
        ...eventData,
        status: computedStatus,
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

  // Update event with auto-recalculated status
  async updateEvent(eventId, updateData) {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, eventId);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};

      const mergedData = { ...currentData, ...updateData };
      const computedStatus = calculateEventStatus(mergedData);

      const finalUpdate = {
        ...updateData,
        status: computedStatus,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(docRef, finalUpdate);
      return { id: eventId, ...finalUpdate };
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
