import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Palette, 
  Award, 
  HeartHandshake, 
  CheckCircle2, 
  Calendar, 
  Users,
  ChevronRight
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import { kaarigarService } from '../../services/kaarigarService';
import EventCard from '../../components/cards/EventCard';
import KaarigarCard from '../../components/cards/KaarigarCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import { visitorService } from '../../services/visitorService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredKaarigars, setFeaturedKaarigars] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingKaarigars, setLoadingKaarigars] = useState(true);

  // RSVP Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpCount, setRsvpCount] = useState(1);
  const [submittingRsvp, setSubmittingRsvp] = useState(false);

  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set SEO Meta
    document.title = "Kaarigar Expo | Celebrating India's Artisans, Crafts & Culture";

    const fetchEvents = async () => {
      try {
        const events = await eventService.getUpcomingEvents();
        setUpcomingEvents(events.slice(0, 3)); // show top 3 on homepage
      } catch (err) {
        console.error('Failed to load upcoming events', err);
      } finally {
        setLoadingEvents(false);
      }
    };

    const fetchKaarigars = async () => {
      try {
        const kaarigars = await kaarigarService.getAllKaarigars();
        setFeaturedKaarigars(kaarigars.slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured kaarigars', err);
      } finally {
        setLoadingKaarigars(false);
      }
    };

    fetchEvents();
    fetchKaarigars();
  }, []);

  const openRsvpModal = (event) => {
    setSelectedEvent(event);
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
        eventId: selectedEvent.id,
        visitorId: currentUser?.uid || null,
        name: rsvpName,
        email: rsvpEmail,
        phone: rsvpPhone,
        numberOfVisitors: rsvpCount
      });
      showSuccess("You're registered! We look forward to seeing you at Kaarigar Expo.");
      setRsvpModalOpen(false);
      // Refresh events
      const events = await eventService.getUpcomingEvents();
      setUpcomingEvents(events.slice(0, 3));
    } catch (err) {
      showError(err.message || 'Failed to complete registration.');
    } finally {
      setSubmittingRsvp(false);
    }
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-pattern" />
        <div className="container">
          <div className="hero-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(215, 168, 89, 0.2)', border: '1px solid var(--color-secondary)', padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)', marginBottom: '1.25rem' }}>
                <Sparkles size={16} color="var(--color-secondary)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-secondary)' }}>
                  National Mela Registration & Artisan Platform
                </span>
              </div>
              <h1 className="hero-title">
                Celebrating India’s <span>Artisans</span>, Crafts & Culture
              </h1>
              <p className="hero-subtitle">
                Discover authentic local craftsmanship, meet talented master kaarigars, and experience vibrant handicraft exhibitions across India.
              </p>
              <div className="hero-buttons">
                <Link to="/melas" className="btn btn-secondary btn-lg">
                  <Compass size={18} /> Explore Melas
                </Link>
                <Link to="/register" className="btn btn-outline btn-lg" style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}>
                  Register as Kaarigar <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '3px solid rgba(215, 168, 89, 0.4)' }}>
                <img 
                  src="/src/assets/hero.jpg"
                  alt="Indian handicraft exhibition showcase" 
                  style={{ width: '100%', height: '360px', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1599818817290-7f2bf8f23f6d?auto=format&fit=crop&w=800&q=80"; }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. UPCOMING MELAS */}
      <section style={{ padding: '5rem 0 3rem' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Live & Upcoming Events
              </span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>Upcoming Melas & Exhibitions</h2>
            </div>
            <Link to="/melas" className="btn btn-outline btn-sm">
              View All Melas <ChevronRight size={16} />
            </Link>
          </div>

          {loadingEvents ? (
            <LoadingSpinner message="Loading upcoming melas..." />
          ) : upcomingEvents.length === 0 ? (
            <EmptyState 
              title="No upcoming melas available" 
              message="Check back soon for new artisan exhibitions and cultural fairs."
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {upcomingEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onRsvpClick={openRsvpModal}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. WHY KAARIGAR EXPO? */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform Benefits
            </span>
            <h2 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>Why Kaarigar Expo?</h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              Connecting traditional craft traditions with contemporary cultural appreciation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Palette size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Showcase Your Craft</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Directly apply for stall spaces in premier craft melas, gain visibility, and sell directly to collectors.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-secondary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Award size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Discover Unique Artisans</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Connect with verified master craftsmen across textiles, pottery, woodwork, brassware, and paintings.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Calendar size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Join Vibrant Melas</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Convenient online visitor RSVP, instant pass confirmation, and comprehensive schedules in one place.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <HeartHandshake size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Support Local Craftsmanship</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Preserve indigenous heritage through transparent digital organization and community empowerment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Simple Process
            </span>
            <h2 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>How It Works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {/* Kaarigar Steps */}
            <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--color-primary)', color: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem' }}>
                  FOR KAARIGARS
                </div>
                <h3 style={{ fontSize: '1.25rem' }}>Artisan Participation</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Register & Build Profile</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>Create your artisan profile, add craft specialization and portfolio photos.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Apply for Open Melas</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>Browse scheduled exhibitions and submit your stall application with one click.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Get Approved</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>Receive live notification and status updates once the exhibition committee reviews your application.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>4</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Participate & Sell</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>Your profile is featured publicly under the event and you receive your confirmed stall allotment.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visitor Steps */}
            <div className="card" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--color-secondary)', color: 'var(--color-primary-dark)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem' }}>
                  FOR VISITORS
                </div>
                <h3 style={{ fontSize: '1.25rem' }}>Visitor Journey</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-secondary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Explore Upcoming Melas</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>Search events by city, state, dates, or craft themes.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-secondary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>RSVP & Register</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>Register your attendance in seconds to reserve entry for you and your family.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-secondary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Visit the Exhibition</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>Access your confirmed passes anytime via your personal Visitor Dashboard.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-bg-alt)', color: 'var(--color-secondary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>4</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Discover & Support Artisans</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>Meet participating kaarigars, witness live demonstrations, and buy authentic handmade crafts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED KAARIGARS */}
      {featuredKaarigars.length > 0 && (
        <section style={{ padding: '4rem 0 5rem', backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Master Craftspeople
                </span>
                <h2 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>Featured Kaarigars</h2>
              </div>
              <Link to="/kaarigars" className="btn btn-outline btn-sm">
                View All Kaarigars <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.75rem' }}>
              {featuredKaarigars.map((k) => (
                <KaarigarCard key={k.id} kaarigar={k} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. CALL TO ACTION */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', color: '#FFFFFF', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <Sparkles size={36} color="var(--color-secondary)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: '#FFFFFF', fontSize: '2.4rem', marginBottom: '1rem' }}>
            Are you a craftsperson?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Showcase your talent at the next Kaarigar Expo. Register today to apply for national and state handicraft melas.
          </p>
          <Link to="/register" className="btn btn-secondary btn-lg">
            Register as Kaarigar <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* RSVP MODAL */}
      <Modal
        isOpen={rsvpModalOpen}
        onClose={() => setRsvpModalOpen(false)}
        title={`Register for ${selectedEvent?.name || 'Mela'}`}
      >
        <form onSubmit={handleRsvpSubmit}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Reserve your entry pass for this exhibition. You will receive event updates and schedule details.
          </p>

          <FormInput
            id="rsvp-name"
            label="Full Name"
            required
            value={rsvpName}
            onChange={(e) => setRsvpName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
          />

          <FormInput
            id="rsvp-email"
            type="email"
            label="Email Address"
            required
            value={rsvpEmail}
            onChange={(e) => setRsvpEmail(e.target.value)}
            placeholder="e.g. ramesh@example.com"
          />

          <div className="form-grid-2">
            <FormInput
              id="rsvp-phone"
              type="tel"
              label="Phone Number"
              required
              value={rsvpPhone}
              onChange={(e) => setRsvpPhone(e.target.value)}
              placeholder="e.g. 9876543210"
            />
            <FormInput
              id="rsvp-count"
              type="number"
              min="1"
              max="10"
              label="Number of Attendees"
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

export default Home;
