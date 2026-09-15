import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, MapPin, Trash2, Compass, CheckCircle2, QrCode, Sparkles, Navigation, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { visitorService } from '../../services/visitorService';
import { getEventMapUrl, formatEventDates } from '../../utils/eventUtils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const MyRegistrations = () => {
  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    document.title = "My Event Registrations | Kaarigar Expo";
    loadRegistrations();
  }, [currentUser]);

  const loadRegistrations = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await visitorService.getMyRegistrations(currentUser.uid);
      setRegistrations(data);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (regId) => {
    if (!window.confirm('Are you sure you want to cancel this exhibition pass?')) {
      return;
    }

    try {
      setCancellingId(regId);
      await visitorService.cancelRegistration(regId);
      showSuccess('Registration pass cancelled.');
      setRegistrations(prev => prev.filter(r => r.id !== regId));
      if (selectedPass?.id === regId) {
        setSelectedPass(null);
      }
    } catch (err) {
      console.error('Error cancelling pass:', err);
      showError(err.message || 'Failed to cancel registration.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your exhibition passes..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Confirmed Bookings
          </span>
          <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>My Registered Melas</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            View and present your entry passes for upcoming handicraft exhibitions.
          </p>
        </div>

        <Link to="/melas" className="btn btn-secondary">
          <Compass size={16} /> Discover More Melas
        </Link>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          title="No Active Registrations"
          message="You haven't reserved passes for any exhibitions yet. Check our event calendar to join upcoming melas."
          actionText="Explore Upcoming Melas"
          actionLink="/melas"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          {registrations.map((reg) => (
            <div 
              key={reg.id} 
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderTop: '4px solid var(--color-secondary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="status-badge approved">
                  <CheckCircle2 size={13} /> Confirmed Pass
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Pass #{reg.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                {reg.event?.name || 'Mela Exhibition'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={15} color="var(--color-secondary-dark)" />
                  <span>{formatEventDates(reg.event)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={15} color="var(--color-secondary-dark)" />
                  <a
                    href={getEventMapUrl(reg.event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open venue in Google Maps"
                    style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'inherit'; }}
                  >
                    <span>{reg.event?.location || 'Venue TBA'}, {reg.event?.city || ''}</span>
                    <ExternalLink size={11} style={{ opacity: 0.6 }} />
                  </a>
                </div>
              </div>

              <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div><strong>Primary Visitor:</strong> {reg.name}</div>
                <div><strong>Attendees:</strong> {reg.numberOfVisitors} {reg.numberOfVisitors === 1 ? 'Person' : 'Persons'}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                  Registered on: {new Date(reg.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {reg.eventId && (
                    <Link
                      to={`/melas/${reg.eventId}`}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, textAlign: 'center' }}
                    >
                      View Details
                    </Link>
                  )}
                  <a
                    href={getEventMapUrl(reg.event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                    title="Open location on Google Maps"
                  >
                    <MapPin size={13} color="var(--color-secondary-dark)" />
                    <span>View Location</span>
                  </a>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedPass(reg)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Ticket size={15} /> Show Pass
                  </button>
                  <button
                    onClick={() => handleCancelRegistration(reg.id)}
                    disabled={cancellingId === reg.id}
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--color-danger)', borderColor: '#FFCDD2', padding: '0.35rem 0.6rem' }}
                    title="Cancel Pass"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Digital Pass / Ticket Modal */}
      <Modal
        isOpen={!!selectedPass}
        onClose={() => setSelectedPass(null)}
        title="Official Visitor Entry Pass"
        maxWidth="440px"
      >
        {selectedPass && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)', color: '#FFFFFF', padding: '1.25rem 1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-secondary)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                <Sparkles size={14} /> Kaarigar Expo Pass
              </div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                {selectedPass.event?.name}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                {selectedPass.event?.location}, {selectedPass.event?.city}
              </p>
              
              <a
                href={getEventMapUrl(selectedPass.event)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-secondary)', fontSize: '0.78rem', fontWeight: 600, background: 'rgba(255,255,255,0.12)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', textDecoration: 'none' }}
              >
                <Navigation size={12} /> Get Venue Directions <ExternalLink size={10} />
              </a>

              <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px dashed rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-around', fontSize: '0.82rem' }}>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.72rem' }}>DATE</div>
                  <div style={{ fontWeight: 700 }}>{formatEventDates(selectedPass.event)}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.72rem' }}>ATTENDEES</div>
                  <div style={{ fontWeight: 700 }}>{selectedPass.numberOfVisitors} Pax</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '100px', height: '100px', margin: '0 auto 0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '0.5rem', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={85} color="var(--color-primary)" />
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                PASS CODE: {selectedPass.id.slice(0, 10).toUpperCase()}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', marginBottom: 0 }}>
                Show this QR pass or code at the registration desk for seamless entry.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="btn btn-primary btn-block"
                style={{ padding: '0.65rem 1rem' }}
              >
                Close Pass
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyRegistrations;
