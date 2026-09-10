import React, { useState, useEffect, useMemo } from 'react';
import { Users, Calendar, Mail, Phone, Ticket, Search } from 'lucide-react';
import { visitorService } from '../../services/visitorService';
import { eventService } from '../../services/eventService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import FormInput from '../../components/common/FormInput';
import SearchBar from '../../components/common/SearchBar';

const ManageVisitors = () => {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEventId, setSelectedEventId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = "Manage Visitors | Admin | Kaarigar Expo";
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regsData, eventsData] = await Promise.all([
        visitorService.getAllRegistrations(),
        eventService.getAllEvents()
      ]);
      setRegistrations(regsData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching visitor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const matchEvent = selectedEventId === 'all' || reg.eventId === selectedEventId;
      const matchSearch = searchQuery === '' ||
        reg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.phone?.includes(searchQuery) ||
        reg.event?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchEvent && matchSearch;
    });
  }, [registrations, selectedEventId, searchQuery]);

  const totalAttendeesCount = useMemo(() => {
    return filteredRegistrations.reduce((acc, r) => acc + (Number(r.numberOfVisitors) || 1), 0);
  }, [filteredRegistrations]);

  if (loading) {
    return <LoadingSpinner message="Loading visitor attendee roster..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Attendee Directory
        </span>
        <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>Registered Visitors & RSVPs</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Monitor event RSVPs, attendee contact rosters, and expected footfalls per exhibition.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search attendee by name, email, or phone..."
          />

          <FormInput
            id="filter-event-roster"
            type="select"
            label="Filter by Exhibition / Mela"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            options={[
              { label: 'All Melas & Exhibitions', value: 'all' },
              ...events.map(ev => ({ label: `${ev.name} (${ev.city})`, value: ev.id }))
            ]}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-light)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          <div><strong>Total Passes Issued:</strong> {filteredRegistrations.length}</div>
          <div><strong>Total Expected Visitors:</strong> {totalAttendeesCount} Persons</div>
        </div>
      </div>

      {/* Roster Table */}
      {filteredRegistrations.length === 0 ? (
        <EmptyState
          title="No Visitor Registrations Found"
          message={searchQuery || selectedEventId !== 'all' ? "No attendee bookings match your filters." : "No visitors have registered for any melas yet."}
          actionText={searchQuery || selectedEventId !== 'all' ? "Reset Filters" : null}
          onActionClick={() => { setSearchQuery(''); setSelectedEventId('all'); }}
        />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Visitor Name</th>
                <th>Contact Details</th>
                <th>Registered Mela</th>
                <th>Pass Date</th>
                <th>Attendees</th>
                <th>Pass Code</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id}>
                  <td>
                    <strong>{reg.name}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={13} color="var(--color-text-muted)" /> {reg.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={13} color="var(--color-text-muted)" /> {reg.phone}
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong>{reg.event?.name || 'Mela Event'}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {reg.event?.location || ''}, {reg.event?.city || ''}
                    </div>
                  </td>
                  <td>
                    {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                  </td>
                  <td>
                    <span style={{ background: 'var(--color-bg-alt)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                      {reg.numberOfVisitors || 1} Pax
                    </span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.78rem', background: '#F0EFE9', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                      {reg.id.slice(0, 8).toUpperCase()}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageVisitors;
