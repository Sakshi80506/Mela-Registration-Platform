import { 
  db, 
  collection, 
  getDocs, 
  query, 
  where 
} from './firebase';
import { calculateEventStatus } from '../utils/eventUtils';

export const statsService = {
  // Compute Admin Dashboard aggregates dynamically
  async getAdminStats() {
    try {
      const [eventsSnap, kaarigarsSnap, applicationsSnap, visitorsSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'events')),
        getDocs(collection(db, 'kaarigars')),
        getDocs(collection(db, 'kaarigarApplications')),
        getDocs(collection(db, 'visitorRegistrations')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'visitor')))
      ]);

      const events = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const applications = applicationsSnap.docs.map(d => d.data());

      const totalMelas = eventsSnap.size;
      const upcomingMelas = events.filter(e => calculateEventStatus(e) === 'upcoming').length;
      const ongoingMelas = events.filter(e => calculateEventStatus(e) === 'ongoing').length;
      const closedMelas = events.filter(e => calculateEventStatus(e) === 'closed').length;
      const totalKaarigars = kaarigarsSnap.size;
      const pendingApplications = applications.filter(a => a.status === 'pending').length;
      const approvedKaarigars = applications.filter(a => a.status === 'approved').length;
      const totalVisitors = usersSnap.size;
      const totalRsvps = visitorsSnap.size;

      return {
        totalMelas,
        upcomingMelas,
        ongoingMelas,
        closedMelas,
        activeMelas: upcomingMelas + ongoingMelas,
        totalKaarigars,
        pendingApplications,
        approvedKaarigars,
        totalVisitors,
        totalRsvps
      };
    } catch (error) {
      console.error('Error computing admin statistics:', error);
      return {
        totalMelas: 0,
        upcomingMelas: 0,
        totalKaarigars: 0,
        pendingApplications: 0,
        approvedKaarigars: 0,
        totalVisitors: 0,
        totalRsvps: 0
      };
    }
  },

  // Compute Kaarigar Dashboard aggregates
  async getKaarigarStats(kaarigarId) {
    try {
      if (!kaarigarId) {
        return {
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
          profileCompletion: 0
        };
      }

      const q = query(
        collection(db, 'kaarigarApplications'),
        where('kaarigarId', '==', kaarigarId)
      );
      const snap = await getDocs(q);
      const apps = snap.docs.map(d => d.data());

      const total = apps.length;
      const pending = apps.filter(a => a.status === 'pending').length;
      const approved = apps.filter(a => a.status === 'approved').length;
      const rejected = apps.filter(a => a.status === 'rejected').length;

      return {
        totalApplications: total,
        pendingApplications: pending,
        approvedApplications: approved,
        rejectedApplications: rejected
      };
    } catch (error) {
      console.error('Error computing kaarigar stats:', error);
      return {
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0
      };
    }
  }
};
