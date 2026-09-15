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
  CheckCircle2,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import { visitorService } from '../../services/visitorService';
import { calculateEventStatus, formatEventDates, getEventMapUrl, getEventMapEmbedUrl } from '../../utils/eventUtils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import KaarigarCard from '../../components/cards/KaarigarCard';
import EventReviews from '../../components/events/EventReviews';
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

  const formattedDates = formatEventDates(event);
  const currentStatus = calculateEventStatus(event);

  return (
    <div className="container event-details-page">
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/melas" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Melas
        </Link>
      </div>

      {/* Hero Banner Area */}
      <div className="event-details-hero">
        <img
          src={event.image || defaultEventImage}
          alt={`Banner for ${event.name}`}
          className="event-details-hero-img"
          onError={(e) => { e.target.src = defaultEventImage; }}
        />
        <div className="event-details-hero-overlay" />
        
        <div className="event-details-hero-content">
          <div className="event-details-hero-badges">
            <StatusBadge status={currentStatus} />
            <span className="event-details-location-badge">
              {event.city}, {event.state}
            </span>
          </div>
          <h1 className="event-details-title">{event.name}</h1>
        </div>
      </div>

      {/* Main Grid: Details & Actions */}
      <div className="event-details-grid">
        {/* Left Column: Description & Key Info */}
        <div className="event-details-main-content">
          {/* Live Status Notification Box */}
          {currentStatus === 'ongoing' && (
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#065F46' }}>Exhibition is currently LIVE & Ongoing!</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857' }}>
                  Gates are open today between {event.startTime || '10:00 AM'} and {event.endTime || '08:00 PM'}. Visitors can walk in and meet master artisans.
                </p>
              </div>
            </div>
          )}

          {currentStatus === 'closed' && (
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <strong style={{ color: '#475569' }}>This exhibition has concluded.</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                Event dates have passed ({formattedDates}). Browse upcoming melas for future exhibitions.
              </p>
            </div>
          )}

          <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>About This Exhibition</h2>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--color-text)', whiteSpace: 'pre-line', marginBottom: '2rem' }}>
            {event.description}
          </p>

          <div className="event-info-cards-grid">
            <div className="event-info-box-item">
              <div className="event-info-box-icon">
                <Calendar size={20} />
              </div>
              <div className="event-info-box-text">
                <span className="event-info-box-label">Date Range</span>
                <div className="event-info-box-value">{formattedDates}</div>
              </div>
            </div>

            <div className="event-info-box-item">
              <div className="event-info-box-icon">
                <Clock size={20} />
              </div>
              <div className="event-info-box-text">
                <span className="event-info-box-label">Timing</span>
                <div className="event-info-box-value">{event.startTime || '10:00 AM'} - {event.endTime || '08:00 PM'}</div>
              </div>
            </div>

            <div className="event-info-box-item">
              <div className="event-info-box-icon">
                <MapPin size={20} />
              </div>
              <div className="event-info-box-text">
                <span className="event-info-box-label">Venue Location</span>
                <div className="event-info-box-value">{event.location}, {event.city}, {event.state}</div>
              </div>
            </div>

            <div className="event-info-box-item">
              <div className="event-info-box-icon">
                <Users size={20} />
              </div>
              <div className="event-info-box-text">
                <span className="event-info-box-label">Artisans & Visitors</span>
                <div className="event-info-box-value">{event.approvedArtisansCount} Kaarigars • {event.registeredVisitorsCount} RSVPs</div>
              </div>
            </div>
          </div>

          {/* Map Location & Directions Section */}
          <div className="event-map-card">
            <div className="event-map-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <Navigation size={18} color="var(--color-secondary-dark)" /> Venue Location & Directions
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  {event.location}, {event.city}, {event.state}
                </p>
              </div>
              <a
                href={getEventMapUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <MapPin size={14} /> Open in Google Maps <ExternalLink size={13} />
              </a>
            </div>

            {/* Embedded Google Maps View */}
            <div className="event-map-frame-wrap">
              <iframe
                title={`Map of ${event.name} venue`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={getEventMapEmbedUrl(event)}
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Right Column: RSVP & Artisan Action Card */}
        <div className="event-details-sidebar">
          <div className="card event-action-card">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
              {currentStatus === 'ongoing' ? 'Visit Today' : currentStatus === 'closed' ? 'Exhibition Closed' : 'Attend This Mela'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              {currentStatus === 'ongoing'
                ? 'Event is happening today! Get your live entry pass.'
                : currentStatus === 'closed'
                ? 'This event has concluded. Stay tuned for upcoming dates.'
                : 'Reserve your spot to receive venue passes and schedule alerts.'}
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
            ) : currentStatus === 'closed' ? (
              <button 
                className="btn btn-outline btn-block btn-lg"
                style={{ marginBottom: '1rem', opacity: 0.6 }}
                disabled
              >
                Registration Closed
              </button>
            ) : (
              <button 
                onClick={handleOpenRsvp}
                className="btn btn-secondary btn-block btn-lg"
                style={{ marginBottom: '1rem' }}
              >
                {currentStatus === 'ongoing' ? 'Get Today’s Entry Pass' : 'RSVP for Event'}
              </button>
            )}

            {isKaarigar && currentStatus !== 'closed' && (
              <Link 
                to="/kaarigar/apply" 
                state={{ selectedEventId: event.id }}
                className="btn btn-outline btn-block"
                style={{ marginBottom: '0.75rem' }}
              >
                <Sparkles size={16} /> Apply as Kaarigar
              </Link>
            )}

            <a 
              href={getEventMapUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-block btn-sm"
              style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Navigation size={14} /> Get Map Directions <ExternalLink size={12} />
            </a>

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

      {/* FEEDBACK & RATINGS SECTION */}
      <EventReviews eventId={event.id} eventName={event.name} />

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
