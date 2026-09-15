import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, Compass, Calendar, MapPin, CheckCircle2, ArrowRight, Trash2, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { visitorService } from '../../services/visitorService';
import { eventService } from '../../services/eventService';
import DashboardCard from '../../components/cards/DashboardCard';
import EventCard from '../../components/cards/EventCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const VisitorDashboard = () => {
  const { currentUser, userProfile, deleteAccount, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [upcomingMelas, setUpcomingMelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      showError(err.message || 'Failed to logout');
    }
  };

  useEffect(() => {
    document.title = "Visitor Dashboard | Kaarigar Expo";
    if (currentUser) {
      loadVisitorData();
    }
  }, [currentUser]);

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await deleteAccount();
      showSuccess('Your Visitor account and passes have been permanently deleted.');
      navigate('/');
    } catch (err) {
      console.error('Delete account error:', err);
      showError(err.message || 'Failed to delete account. You may need to log in again first.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const loadVisitorData = async () => {
    try {
      setLoading(true);
      const [regsData, eventsData] = await Promise.all([
        visitorService.getMyRegistrations(currentUser.uid),
        eventService.getUpcomingEvents()
      ]);
      setRegistrations(regsData);
      setUpcomingMelas(eventsData.slice(0, 3));
    } catch (err) {
      console.error('Failed to load visitor data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your visitor dashboard..." />;
  }

  return (
    <div>
      {/* Welcome Area */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--color-border)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Visitor Pass Center
          </span>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginTop: '0.2rem' }}>
            Welcome, {userProfile?.name || currentUser.displayName || 'Visitor'}!
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Explore scheduled exhibitions, manage your entry passes, and connect with Indian artisans.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/melas" className="btn btn-secondary">
            <Compass size={16} /> Explore Melas
          </Link>
          <Link to="/visitor/registrations" className="btn btn-outline">
            <Ticket size={16} /> My Entry Passes
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="metric-grid">
        <DashboardCard
          title="My Registered Passes"
          value={registrations.length}
          icon={Ticket}
          color="var(--color-primary)"
          bgColor="var(--color-bg-alt)"
          subtitle="Confirmed Mela entries"
        />
        <DashboardCard
          title="Upcoming Melas"
          value={upcomingMelas.length}
          icon={Calendar}
          color="var(--color-secondary-dark)"
          bgColor="var(--color-bg-alt)"
          subtitle="Exhibitions open for visit"
        />
      </div>

      {/* My Upcoming Registrations */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>My Registered Melas</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Your confirmed event passes and entry access
            </p>
          </div>
          <Link to="/visitor/registrations" className="btn btn-outline btn-sm">
            View All Passes <ArrowRight size={14} />
          </Link>
        </div>

        {registrations.length === 0 ? (
          <EmptyState
            title="No Passes Registered"
            message="You have not RSVP'd for any upcoming exhibitions yet. Explore our calendar and register your free pass."
            actionText="Explore Upcoming Melas"
            actionLink="/melas"
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {registrations.slice(0, 3).map((reg) => (
              <div 
                key={reg.id} 
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-success)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <CheckCircle2 size={15} /> Confirmed Entry Pass
                </div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  {reg.event?.name || 'Mela Event'}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                  <span><Calendar size={13} style={{ display: 'inline' }} /> Date: {reg.event?.date || 'TBA'}</span>
                  <span><MapPin size={13} style={{ display: 'inline' }} /> {reg.event?.location || ''}, {reg.event?.city || ''}</span>
                  <span><strong>{reg.numberOfVisitors} {reg.numberOfVisitors === 1 ? 'Attendee' : 'Attendees'}</strong></span>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/melas/${reg.eventId}`} className="btn btn-outline btn-sm btn-block">
                    View Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Melas to Explore */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Explore More Exhibitions</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Handicraft showcases happening soon
            </p>
          </div>
          <Link to="/melas" className="btn btn-outline btn-sm">
            Full Calendar <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {upcomingMelas.map(ev => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      </div>

      {/* Account Session / Logout */}
      <div className="card" style={{ marginTop: '3rem', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--color-border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
            <LogOut size={18} /> Sign Out / Logout
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', marginBottom: 0 }}>
            Safely log out of your visitor dashboard session on this device.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="card" style={{ marginTop: '1.5rem', padding: '1.75rem 2rem', border: '1px solid rgba(198, 40, 40, 0.3)', background: '#FFF8F8' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.95rem' }}>
              <Trash2 size={18} /> Danger Zone: Delete Account
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', marginBottom: 0 }}>
              Permanently delete your Visitor account and all registered Mela entry passes. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-outline"
            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
          >
            <Trash2 size={16} /> Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#FFEBEE', color: 'var(--color-danger)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-danger)', marginBottom: '0.5rem' }}>
              Delete Visitor Account?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete your visitor account? All your booked entry passes and profile information will be removed immediately.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, background: 'var(--color-danger)' }}
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorDashboard;
