import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where 
} from './firebase';

const VISITORS_COLLECTION = 'visitorRegistrations';
const EVENTS_COLLECTION = 'events';

export const visitorService = {
  // Register (RSVP) for an event
  async registerForEvent(registrationData) {
    try {
      const { eventId, visitorId, email, name, phone, numberOfVisitors = 1 } = registrationData;

      // Prevent duplicate registration
      let dupQuery;
      if (visitorId) {
        dupQuery = query(
          collection(db, VISITORS_COLLECTION),
          where('eventId', '==', eventId),
          where('visitorId', '==', visitorId)
        );
      } else {
        dupQuery = query(
          collection(db, VISITORS_COLLECTION),
          where('eventId', '==', eventId),
          where('email', '==', email)
        );
      }

      const dupSnapshot = await getDocs(dupQuery);
      if (!dupSnapshot.empty) {
        throw new Error("You are already registered for this event.");
      }

      const payload = {
        eventId,
        visitorId: visitorId || null,
        name,
        email,
        phone,
        numberOfVisitors: Number(numberOfVisitors) || 1,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, VISITORS_COLLECTION), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error('Error registering visitor for event:', error);
      throw error;
    }
  },

  // Get registrations for a specific visitor
  async getMyRegistrations(visitorId, visitorEmail = null) {
    try {
      let registrations = [];
      const q = query(
        collection(db, VISITORS_COLLECTION),
        where('visitorId', '==', visitorId)
      );
      const snapshot = await getDocs(q);

      for (const document of snapshot.docs) {
        const regData = { id: document.id, ...document.data() };
        try {
          const evRef = doc(db, EVENTS_COLLECTION, regData.eventId);
          const evSnap = await getDoc(evRef);
          if (evSnap.exists()) {
            regData.event = { id: evSnap.id, ...evSnap.data() };
          }
        } catch (e) {}
        registrations.push(regData);
      }

      return registrations;
    } catch (error) {
      console.error('Error fetching visitor registrations:', error);
      throw error;
    }
  },

  // Get all visitor registrations (Admin)
  async getAllRegistrations(eventIdFilter = null) {
    try {
      let q = collection(db, VISITORS_COLLECTION);
      if (eventIdFilter && eventIdFilter !== 'all') {
        q = query(collection(db, VISITORS_COLLECTION), where('eventId', '==', eventIdFilter));
      }
      const snapshot = await getDocs(q);
      const list = [];

      for (const document of snapshot.docs) {
        const data = { id: document.id, ...document.data() };
        try {
          const evRef = doc(db, EVENTS_COLLECTION, data.eventId);
          const evSnap = await getDoc(evRef);
          if (evSnap.exists()) {
            data.event = { id: evSnap.id, ...evSnap.data() };
          }
        } catch (e) {}
        list.push(data);
      }

      return list;
    } catch (error) {
      console.error('Error fetching all registrations:', error);
      throw error;
    }
  },

  // Cancel RSVP
  async cancelRegistration(registrationId) {
    try {
      const docRef = doc(db, VISITORS_COLLECTION, registrationId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error cancelling registration:', error);
      throw error;
    }
  }
};
