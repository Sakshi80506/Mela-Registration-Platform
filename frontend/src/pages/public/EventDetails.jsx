import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ArrowLeft, 
  Sparkles, 
  Share2, 
  CheckCircle2 
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import { visitorService } from '../../services/visitorService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import KaarigarCard from '../../components/cards/KaarigarCard';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const defaultEventImage = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80';

const EventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // RSVP state
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpCount, setRsvpCount] = useState(1);
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const { currentUser, userProfile, isKaarigar } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEventById(eventId);
      setEvent(data);
      document.title = `${data.name} | Kaarigar Expo`;

      // Check if current user is already registered for this event
      if (currentUser) {
        const regs = await visitorService.getMyRegistrations(currentUser.uid);
        const alreadyReg = regs.some(r => r.eventId === eventId);
        setIsRegistered(alreadyReg);
      }
    } catch (err) {
      console.error('Error loading event:', err);
      setError(err.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRsvp = () => {
    if (currentUser) {
      setRsvpName(userProfile?.name || currentUser.displayName || '');
      setRsvpEmail(currentUser.email || '');
      setRsvpPhone(userProfile?.phone || '');
    }
    setRsvpModalOpen(true);
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!rsvpName || !rsvpEmail || !rsvpPhone) {
      showError('Please fill in all required fields');
      return;
    }

    setSubmittingRsvp(true);
    try {
      await visitorService.registerForEvent({
        eventId: event.id,
        visitorId: currentUser?.uid || null,
        name: rsvpName,
        email: rsvpEmail,
        phone: rsvpPhone,
        numberOfVisitors: rsvpCount
      });
      showSuccess("You're registered! We look forward to seeing you at Kaarigar Expo.");
      setIsRegistered(true);
      setRsvpModalOpen(false);
      loadEventDetails();
    } catch (err) {
      showError(err.message || 'Registration failed.');
    } finally {
      setSubmittingRsvp(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: `Check out ${event.name} on Kaarigar Expo!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showInfo('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading exhibition details..." />;
  }

  if (error || !event) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <EmptyState
          title="Event Not Found"
          message={error || "The requested exhibition could not be found or has been removed."}
          actionText="Back to Upcoming Melas"
          actionLink="/melas"
        />
      </div>
    );
  }

  const formattedDate = event.date ? new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Date TBA';

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/melas" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Melas
        </Link>
      </div>

      {/* Hero Banner Area */}
      <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: '380px', marginBottom: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <img
          src={event.image || defaultEventImage}
          alt={`Banner for ${event.name}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = defaultEventImage; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18, 30, 53, 0.9) 0%, rgba(18, 30, 53, 0.2) 60%)' }} />
        
        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <StatusBadge status={event.status} />
            <span style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', backdropFilter: 'blur(4px)' }}>
              {event.city}, {event.state}
            </span>
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '2.4rem', lineHeight: 1.2 }}>{event.name}</h1>
        </div>
      </div>

      {/* Main Grid: Details & Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem', marginBottom: '4rem' }}>
        {/* Left Column: Description & Key Info */}
        <div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>About This Exhibition</h2>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--color-text)', whiteSpace: 'pre-line', marginBottom: '2rem' }}>
            {event.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Calendar size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Date</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{formattedDate}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Clock size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Timing</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{event.startTime || '10:00 AM'} - {event.endTime || '08:00 PM'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <MapPin size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Venue</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{event.location}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Users size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Artisans & Visitors</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{event.approvedArtisansCount} Kaarigars • {event.registeredVisitorsCount} RSVPs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: RSVP & Artisan Action Card */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '100px', borderTop: '4px solid var(--color-secondary)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Attend This Mela</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Reserve your spot to receive venue passes and schedule alerts.
            </p>

            {isRegistered ? (
              <div style={{ background: 'var(--color-success-bg)', border: '1px solid #C8E6C9', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={28} color="var(--color-success)" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '0.95rem' }}>
                  You are registered!
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                  We look forward to seeing you at Kaarigar Expo.
                </p>
              </div>
            ) : (
              <button 
                onClick={handleOpenRsvp}
                className="btn btn-secondary btn-block btn-lg"
                style={{ marginBottom: '1rem' }}
                disabled={event.status !== 'upcoming'}
              >
                RSVP for Event
              </button>
            )}

            {isKaarigar && (
              <Link 
                to="/kaarigar/apply" 
                state={{ selectedEventId: event.id }}
                className="btn btn-outline btn-block"
                style={{ marginBottom: '1rem' }}
              >
                <Sparkles size={16} /> Apply as Kaarigar
              </Link>
            )}

            <button 
              onClick={handleShare}
              className="btn btn-outline btn-block btn-sm"
            >
              <Share2 size={16} /> Share Mela
            </button>
          </div>
        </div>
      </div>

      {/* PARTICIPATING ARTISANS (ONLY APPROVED ARTISANS) */}
      <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Verified Exhibitors
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Participating Kaarigars ({event.approvedArtisans?.length || 0})</h2>
          </div>
        </div>

        {(!event.approvedArtisans || event.approvedArtisans.length === 0) ? (
          <EmptyState
            title="No artisans are currently participating"
            message="Artisan applications for this exhibition are being reviewed. Approved kaarigars will be showcased here shortly."
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.75rem' }}>
            {event.approvedArtisans.map((artisan) => (
              <KaarigarCard key={artisan.id || artisan.applicationId} kaarigar={artisan} />
            ))}
          </div>
        )}
      </section>

      {/* RSVP Modal */}
      <Modal
        isOpen={rsvpModalOpen}
        onClose={() => setRsvpModalOpen(false)}
        title={`Register for ${event.name}`}
      >
        <form onSubmit={handleRsvpSubmit}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Enter your contact details to reserve your visitor entry pass.
          </p>

          <FormInput
            id="rsvp-detail-name"
            label="Full Name"
            required
            value={rsvpName}
            onChange={(e) => setRsvpName(e.target.value)}
            placeholder="e.g. Anand Sen"
          />

          <FormInput
            id="rsvp-detail-email"
            type="email"
            label="Email Address"
            required
            value={rsvpEmail}
            onChange={(e) => setRsvpEmail(e.target.value)}
            placeholder="e.g. anand@example.com"
          />

          <div className="form-grid-2">
            <FormInput
              id="rsvp-detail-phone"
              type="tel"
              label="Phone Number"
              required
              value={rsvpPhone}
              onChange={(e) => setRsvpPhone(e.target.value)}
              placeholder="e.g. 9876543210"
            />
            <FormInput
              id="rsvp-detail-count"
              type="number"
              min="1"
              max="10"
              label="Attendees Count"
              required
              value={rsvpCount}
              onChange={(e) => setRsvpCount(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={() => setRsvpModalOpen(false)} 
              className="btn btn-outline btn-sm"
              disabled={submittingRsvp}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-secondary btn-sm"
              disabled={submittingRsvp}
            >
              {submittingRsvp ? 'Registering...' : 'Confirm RSVP'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventDetails;
