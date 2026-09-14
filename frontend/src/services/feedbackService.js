import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where 
} from './firebase';

const REVIEWS_COLLECTION = 'eventReviews';

export const feedbackService = {
  // Get all reviews for a specific event
  async getEventFeedbacks(eventId) {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('eventId', '==', eventId)
      );
      const snapshot = await getDocs(q);
      const reviews = [];
      let totalRating = 0;
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      snapshot.docs.forEach(docSnap => {
        const data = { id: docSnap.id, ...docSnap.data() };
        reviews.push(data);
        const r = Number(data.rating) || 5;
        totalRating += r;
        if (breakdown[r] !== undefined) {
          breakdown[r]++;
        }
      });

      // Sort newest first
      reviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      const averageRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;

      return {
        reviews,
        totalCount: reviews.length,
        averageRating,
        breakdown
      };
    } catch (error) {
      console.error('Error fetching event feedbacks:', error);
      return { reviews: [], totalCount: 0, averageRating: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
  },

  // Get current user's feedback for an event
  async getUserFeedback(eventId, userId) {
    if (!eventId || !userId) return null;
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.warn('Error fetching user feedback:', error);
      return null;
    }
  },

  // Submit or update a feedback review
  async submitFeedback({ eventId, userId, userName, userRole, rating, comment }) {
    try {
      const existing = await this.getUserFeedback(eventId, userId);
      const payload = {
        eventId,
        userId,
        userName: userName || 'Anonymous',
        userRole: userRole || 'visitor',
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        comment: comment.trim(),
        updatedAt: new Date().toISOString()
      };

      if (existing) {
        const docRef = doc(db, REVIEWS_COLLECTION, existing.id);
        await setDoc(docRef, payload, { merge: true });
        return { id: existing.id, ...payload };
      } else {
        payload.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), payload);
        return { id: docRef.id, ...payload };
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Delete feedback
  async deleteFeedback(feedbackId) {
    try {
      const docRef = doc(db, REVIEWS_COLLECTION, feedbackId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }
};
