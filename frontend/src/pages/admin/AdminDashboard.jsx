import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  FileText, 
  Ticket, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { statsService } from '../../services/statsService';
import { applicationService } from '../../services/applicationService';
import { eventService } from '../../services/eventService';
import DashboardCard from '../../components/cards/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatEventDates } from '../../utils/eventUtils';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMelas: 0,
    upcomingMelas: 0,
    totalKaarigars: 0,
    pendingApplications: 0,
    approvedKaarigars: 0,
    totalVisitors: 0,
    totalRsvps: 0
  });
  const [pendingApplications, setPendingApplications] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin Dashboard | Kaarigar Expo";
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsData, appsData, eventsData] = await Promise.all([
        statsService.getAdminStats(),
        applicationService.getAllApplications('pending'),
        eventService.getAllEvents()
      ]);

      setStats(statsData);
      setPendingApplications(appsData.slice(0, 5));
      setRecentEvents(eventsData.slice(0, 4));
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading organizer metrics..." />;
  }

  return (
    <div>
      {/* Top Banner */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--color-border)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Event Operations Center
          </span>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginTop: '0.2rem' }}>
            Admin Control Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Real-time analytics across Melas, artisan stall applications, and attendee RSVPs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/create-mela" className="btn btn-secondary">
            <PlusCircle size={16} /> Create New Mela
          </Link>
          <Link to="/admin/applications" className="btn btn-outline">
            <FileText size={16} /> Review Applications ({stats.pendingApplications})
          </Link>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="metric-grid">
        <DashboardCard
          title="Total Melas"
          value={stats.totalMelas}
          icon={Calendar}
          color="var(--color-primary)"
          bgColor="var(--color-bg-alt)"
          subtitle={
            stats.ongoingMelas > 0 
              ? `${stats.ongoingMelas} Live • ${stats.upcomingMelas} Upcoming` 
              : `${stats.upcomingMelas} Upcoming`
          }
        />
        <DashboardCard
          title="Total Kaarigars"
          value={stats.totalKaarigars}
          icon={Users}
          color="var(--color-secondary-dark)"
          bgColor="var(--color-bg-alt)"
          subtitle="Registered artisans"
        />
        <DashboardCard
          title="Pending Reviews"
          value={stats.pendingApplications}
          icon={Clock}
          color="var(--color-warning)"
          bgColor="var(--color-warning-bg)"
          subtitle="Awaiting committee approval"
        />
        <DashboardCard
          title="Approved Stalls"
          value={stats.approvedKaarigars}
          icon={CheckCircle2}
          color="var(--color-success)"
          bgColor="var(--color-success-bg)"
          subtitle="Confirmed exhibitors"
        />
        <DashboardCard
          title="Registered Visitors"
          value={stats.totalVisitors}
          icon={Users}
          color="var(--color-info)"
          bgColor="var(--color-info-bg)"
          subtitle="User accounts"
        />
        <DashboardCard
          title="Total Event RSVPs"
          value={stats.totalRsvps}
          icon={Ticket}
          color="var(--color-primary-light)"
          bgColor="var(--color-bg-alt)"
          subtitle="Passes issued"
        />
      </div>

      {/* Pending Applications Alert & Quick Table */}
      {stats.pendingApplications > 0 && (
        <div className="card" style={{ marginBottom: '2.5rem', borderLeft: '4px solid var(--color-warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary)' }}>
                Pending Artisan Applications ({stats.pendingApplications})
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                New stall applications waiting for organizer review and approval
              </p>
            </div>
            <Link to="/admin/applications" className="btn btn-secondary btn-sm">
              Review All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Artisan Name</th>
                  <th>Craft Specialization</th>
                  <th>Target Mela</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.kaarigar?.name || app.kaarigarName || 'Artisan'}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {app.kaarigar?.city || ''}
                      </div>
                    </td>
                    <td>
                      <span className="kaarigar-craft-tag" style={{ margin: 0 }}>
                        {app.craftType}
                      </span>
                    </td>
                    <td>{app.event?.name || 'Mela Event'}</td>
                    <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN') : 'Recent'}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <Link to="/admin/applications" className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.7rem' }}>
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Melas Overview */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>Scheduled Exhibitions</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Recently created melas and participation metrics
            </p>
          </div>
          <Link to="/admin/melas" className="btn btn-outline btn-sm">
            Manage All Melas <ArrowRight size={14} />
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>No exhibitions created yet.</p>
            <Link to="/admin/create-mela" className="btn btn-primary btn-sm">
              Create First Mela
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date & Timing</th>
                  <th>Location</th>
                  <th>Artisans Approved</th>
                  <th>Visitors RSVP</th>
                  <th>Status</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((ev) => (
                  <tr key={ev.id}>
                    <td><strong>{ev.name}</strong></td>
                    <td>{formatEventDates(ev)} ({ev.startTime || '10:00'} - {ev.endTime || '20:00'})</td>
                    <td>{ev.city}, {ev.state}</td>
                    <td><strong>{ev.approvedArtisansCount || 0}</strong> / {ev.maxArtisans || '∞'}</td>
                    <td><strong>{ev.registeredVisitorsCount || 0}</strong></td>
                    <td><StatusBadge status={ev.status} /></td>
                    <td>
                      <Link to={`/admin/melas`} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.6rem' }}>
                        Edit / View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
