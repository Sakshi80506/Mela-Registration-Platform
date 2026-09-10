import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Users, 
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';

const ManageMelas = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  // Edit Modal State
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation State
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = "Manage Melas | Admin | Kaarigar Expo";
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

  const handleOpenEdit = (event) => {
    setEditingEvent(event);
    setEditFormData({
      name: event.name,
      date: event.date,
      startTime: event.startTime || '10:00',
      endTime: event.endTime || '20:00',
      location: event.location,
      city: event.city,
      state: event.state,
      description: event.description,
      maxArtisans: event.maxArtisans || 50,
      maxVisitors: event.maxVisitors || 2000,
      status: event.status || 'upcoming',
      image: event.image || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await eventService.updateEvent(editingEvent.id, editFormData);
      showSuccess(`Event "${editFormData.name}" updated successfully.`);
      setEditingEvent(null);
      loadEvents();
    } catch (err) {
      console.error('Error saving event edit:', err);
      showError(err.message || 'Failed to update event.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    setDeleting(true);
    try {
      await eventService.deleteEvent(deletingEvent.id);
      showSuccess(`Mela "${deletingEvent.name}" deleted.`);
      setDeletingEvent(null);
      setEvents(prev => prev.filter(e => e.id !== deletingEvent.id));
    } catch (err) {
      console.error('Error deleting event:', err);
      showError(err.message || 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading exhibitions..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Event Directory
          </span>
          <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>Manage Melas & Exhibitions</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Edit details, manage capacity, adjust exhibition statuses, or publish new events.
          </p>
        </div>

        <Link to="/admin/create-mela" className="btn btn-secondary">
          <PlusCircle size={16} /> Create New Mela
        </Link>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No Melas Scheduled"
          message="There are no exhibitions in the system. Create your first mela to start accepting applications."
          actionText="Create Mela"
          actionLink="/admin/create-mela"
        />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Approved Kaarigars</th>
                <th>Visitor RSVPs</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {ev.image && (
                        <img 
                          src={ev.image} 
                          alt="" 
                          style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                        />
                      )}
                      <div>
                        <strong>{ev.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ID: {ev.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{ev.date}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {ev.startTime || '10:00'} - {ev.endTime || '20:00'}
                    </div>
                  </td>
                  <td>
                    <div>{ev.city}, {ev.state}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{ev.location}</div>
                  </td>
                  <td>
                    <strong>{ev.approvedArtisansCount || 0}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}> / {ev.maxArtisans || 50} max</span>
                  </td>
                  <td>
                    <strong>{ev.registeredVisitorsCount || 0}</strong>
                  </td>
                  <td>
                    <StatusBadge status={ev.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <Link 
                        to={`/melas/${ev.id}`} 
                        target="_blank" 
                        className="btn btn-outline btn-sm" 
                        title="View Public Page"
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(ev)}
                        className="btn btn-primary btn-sm"
                        title="Edit Mela"
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingEvent(ev)}
                        className="btn btn-outline btn-sm"
                        title="Delete Mela"
                        style={{ padding: '0.35rem 0.6rem', color: 'var(--color-danger)', borderColor: '#FFCDD2' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Mela Modal */}
      <Modal
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        title={`Edit Mela: ${editingEvent?.name}`}
        maxWidth="750px"
      >
        {editingEvent && (
          <form onSubmit={handleSaveEdit}>
            <FormInput
              id="edit-name"
              label="Event Name"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            />

            <div className="form-grid-3">
              <FormInput
                id="edit-date"
                type="date"
                label="Date"
                required
                value={editFormData.date}
                onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
              />
              <FormInput
                id="edit-start-time"
                type="time"
                label="Start Time"
                value={editFormData.startTime}
                onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
              />
              <FormInput
                id="edit-end-time"
                type="time"
                label="End Time"
                value={editFormData.endTime}
                onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
              />
            </div>

            <div className="form-grid-2">
              <FormInput
                id="edit-city"
                label="City"
                required
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
              />
              <FormInput
                id="edit-state"
                label="State"
                required
                value={editFormData.state}
                onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
              />
            </div>

            <FormInput
              id="edit-location"
              label="Venue Address"
              required
              value={editFormData.location}
              onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
            />

            <FormInput
              id="edit-desc"
              type="textarea"
              rows={3}
              label="Description"
              required
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />

            <div className="form-grid-3">
              <FormInput
                id="edit-max-artisans"
                type="number"
                label="Max Artisans"
                value={editFormData.maxArtisans}
                onChange={(e) => setEditFormData({ ...editFormData, maxArtisans: e.target.value })}
              />
              <FormInput
                id="edit-max-visitors"
                type="number"
                label="Max Visitors"
                value={editFormData.maxVisitors}
                onChange={(e) => setEditFormData({ ...editFormData, maxVisitors: e.target.value })}
              />
              <FormInput
                id="edit-status"
                type="select"
                label="Event Status"
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                options={[
                  { label: 'Upcoming', value: 'upcoming' },
                  { label: 'Ongoing', value: 'ongoing' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'Cancelled', value: 'cancelled' }
                ]}
              />
            </div>

            <FormInput
              id="edit-image"
              label="Banner Image URL"
              value={editFormData.image}
              onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <button 
                type="button" 
                onClick={() => setEditingEvent(null)} 
                className="btn btn-outline btn-sm"
                disabled={savingEdit}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary btn-sm"
                disabled={savingEdit}
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        title="Confirm Delete Mela"
        maxWidth="460px"
      >
        {deletingEvent && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>
                Are you sure you want to permanently delete <strong>"{deletingEvent.name}"</strong>? This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setDeletingEvent(null)} 
                className="btn btn-outline btn-sm"
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDelete}
                className="btn btn-danger btn-sm"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Mela'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageMelas;
