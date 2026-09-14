import React, { useState, useEffect, useMemo } from 'react';
import { eventService } from '../../services/eventService';
import { visitorService } from '../../services/visitorService';
import EventCard from '../../components/cards/EventCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import FilterBar from '../../components/common/FilterBar';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const UpcomingMelas = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState('active'); // 'active', 'ongoing', 'upcoming', 'closed', 'all'

  // RSVP modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpCount, setRsvpCount] = useState(1);
  const [submittingRsvp, setSubmittingRsvp] = useState(false);

  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    document.title = "Melas & Exhibitions | Kaarigar Expo";
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load melas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    return {
      active: events.filter(e => e.status === 'ongoing' || e.status === 'upcoming').length,
      ongoing: events.filter(e => e.status === 'ongoing').length,
      upcoming: events.filter(e => e.status === 'upcoming').length,
      closed: events.filter(e => e.status === 'closed').length,
      all: events.length
    };
  }, [events]);

  // Compute unique cities for filtering
  const cityOptions = useMemo(() => {
    const cities = new Set();
    events.forEach(e => {
      if (e.city) cities.add(e.city);
    });
    const opts = [{ label: 'All Cities', value: 'all' }];
    Array.from(cities).sort().forEach(c => {
      const count = events.filter(e => e.city === c).length;
      opts.push({ label: c, value: c, count });
    });
    return opts;
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // Status filter
      if (selectedStatusTab === 'active' && e.status !== 'upcoming' && e.status !== 'ongoing') {
        return false;
      }
      if (selectedStatusTab === 'ongoing' && e.status !== 'ongoing') return false;
      if (selectedStatusTab === 'upcoming' && e.status !== 'upcoming') return false;
      if (selectedStatusTab === 'closed' && e.status !== 'closed') return false;

      const matchesSearch = searchQuery === '' || 
        e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = selectedCity === 'all' || e.city?.toLowerCase() === selectedCity.toLowerCase();

      return matchesSearch && matchesCity;
    });
  }, [events, searchQuery, selectedCity, selectedStatusTab]);

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
      loadEvents();
    } catch (err) {
      showError(err.message || 'Registration failed.');
    } finally {
      setSubmittingRsvp(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Exhibition Schedule
        </span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.25rem' }}>Upcoming Melas & Exhibitions</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '0.4rem', maxWidth: '650px' }}>
          Explore vibrant handicraft melas, master weaver showcases, and traditional art expos happening across India.
        </p>
      </div>

      {/* Controls: Search, Status & City Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem', background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search melas by title, city, or craft..."
        />

        {/* Status Selection Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)', marginRight: '0.25rem' }}>
            Event Timeline:
          </span>
          {[
            { id: 'active', label: 'Active (Live & Upcoming)', count: statusCounts.active },
            { id: 'ongoing', label: 'Live Now', count: statusCounts.ongoing },
            { id: 'upcoming', label: 'Upcoming', count: statusCounts.upcoming },
            { id: 'closed', label: 'Past / Concluded', count: statusCounts.closed },
            { id: 'all', label: 'All Melas', count: statusCounts.all }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`btn btn-sm ${selectedStatusTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {cityOptions.length > 1 && (
          <FilterBar
            options={cityOptions}
            activeValue={selectedCity}
            onSelect={setSelectedCity}
            label="Filter City:"
          />
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner message="Loading upcoming melas..." />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No melas found"
          message={searchQuery || selectedCity !== 'all' ? "Try adjusting your search query or city filter." : "No upcoming melas are currently scheduled."}
          actionText={searchQuery || selectedCity !== 'all' ? "Reset Filters" : null}
          onActionClick={() => { setSearchQuery(''); setSelectedCity('all'); }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {filteredEvents.map(event => (
            <EventCard 
              key={event.id}
              event={event}
              onRsvpClick={openRsvpModal}
            />
          ))}
        </div>
      )}

      {/* RSVP Modal */}
      <Modal
        isOpen={rsvpModalOpen}
        onClose={() => setRsvpModalOpen(false)}
        title={`Register for ${selectedEvent?.name || 'Mela'}`}
      >
        <form onSubmit={handleRsvpSubmit}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Reserve your entry pass for this exhibition.
          </p>

          <FormInput
            id="rsvp-mela-name"
            label="Full Name"
            required
            value={rsvpName}
            onChange={(e) => setRsvpName(e.target.value)}
            placeholder="e.g. Meera Sharma"
          />

          <FormInput
            id="rsvp-mela-email"
            type="email"
            label="Email Address"
            required
            value={rsvpEmail}
            onChange={(e) => setRsvpEmail(e.target.value)}
            placeholder="e.g. meera@example.com"
          />

          <div className="form-grid-2">
            <FormInput
              id="rsvp-mela-phone"
              type="tel"
              label="Phone Number"
              required
              value={rsvpPhone}
              onChange={(e) => setRsvpPhone(e.target.value)}
              placeholder="e.g. 9876543210"
            />
            <FormInput
              id="rsvp-mela-count"
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

export default UpcomingMelas;
