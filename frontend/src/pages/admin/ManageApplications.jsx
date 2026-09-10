import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Calendar, 
  MapPin, 
  Sparkles, 
  User, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import FilterBar from '../../components/common/FilterBar';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';

const ManageApplications = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');
  const [selectedCraftFilter, setSelectedCraftFilter] = useState('all');

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    document.title = "Manage Kaarigar Applications | Admin | Kaarigar Expo";
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsData, eventsData] = await Promise.all([
        applicationService.getAllApplications(),
        eventService.getAllEvents()
      ]);
      setApplications(appsData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute craft types in applications
  const craftOptions = useMemo(() => {
    const crafts = new Set();
    applications.forEach(a => {
      if (a.craftType) crafts.add(a.craftType);
    });
    const opts = [{ label: 'All Crafts', value: 'all' }];
    Array.from(crafts).sort().forEach(c => {
      opts.push({ label: c, value: c });
    });
    return opts;
  }, [applications]);

  // Compute status counts for filter
  const statusOptions = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(a => a.status === 'pending').length;
    const approved = applications.filter(a => a.status === 'approved').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;

    return [
      { label: 'All Applications', value: 'all', count: total },
      { label: 'Pending', value: 'pending', count: pending },
      { label: 'Approved', value: 'approved', count: approved },
      { label: 'Rejected', value: 'rejected', count: rejected }
    ];
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchEvent = selectedEventFilter === 'all' || app.eventId === selectedEventFilter;
      const matchCraft = selectedCraftFilter === 'all' || app.craftType === selectedCraftFilter;
      return matchStatus && matchEvent && matchCraft;
    });
  }, [applications, statusFilter, selectedEventFilter, selectedCraftFilter]);

  const handleOpenReview = (app) => {
    setSelectedApp(app);
    setReviewNotes(app.reviewNotes || '');
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedApp) return;

    setUpdatingStatus(true);
    try {
      await applicationService.updateApplicationStatus(
        selectedApp.id,
        newStatus,
        currentUser?.uid,
        reviewNotes
      );

      showSuccess(`Application ${newStatus === 'approved' ? 'Approved' : 'Rejected'} successfully!`);
      
      // Update local state
      setApplications(prev => prev.map(a => {
        if (a.id === selectedApp.id) {
          return {
            ...a,
            status: newStatus,
            reviewNotes,
            reviewedAt: new Date().toISOString(),
            reviewedBy: currentUser?.uid
          };
        }
        return a;
      }));

      setSelectedApp(null);
    } catch (err) {
      console.error('Error updating status:', err);
      showError(err.message || 'Failed to update application status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading artisan applications..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Stall Moderation
        </span>
        <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>Kaarigar Stall Applications</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Review submitted artisan portfolios, verify craft authenticity, and allocate exhibition stalls.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem' }}>
        <FilterBar
          options={statusOptions}
          activeValue={statusFilter}
          onSelect={setStatusFilter}
          label="Status:"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-light)' }}>
          <FormInput
            id="filter-event"
            type="select"
            label="Filter by Mela"
            value={selectedEventFilter}
            onChange={(e) => setSelectedEventFilter(e.target.value)}
            options={[
              { label: 'All Melas', value: 'all' },
              ...events.map(ev => ({ label: ev.name, value: ev.id }))
            ]}
          />

          {craftOptions.length > 1 && (
            <FormInput
              id="filter-craft"
              type="select"
              label="Filter by Craft Category"
              value={selectedCraftFilter}
              onChange={(e) => setSelectedCraftFilter(e.target.value)}
              options={craftOptions}
            />
          )}
        </div>
      </div>

      {/* Applications Table */}
      {filteredApplications.length === 0 ? (
        <EmptyState
          title="No Applications Match"
          message="There are no artisan applications matching your selected filters."
          actionText="Reset All Filters"
          onActionClick={() => {
            setStatusFilter('all');
            setSelectedEventFilter('all');
            setSelectedCraftFilter('all');
          }}
        />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Artisan Profile</th>
                <th>Craft Specialization</th>
                <th>Mela Applied</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Review</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={app.kaarigar?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-secondary)' }}
                      />
                      <div>
                        <strong>{app.kaarigar?.name || app.kaarigarName || 'Artisan'}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {app.kaarigar?.city || ''}{app.kaarigar?.city && app.kaarigar?.state ? ', ' : ''}{app.kaarigar?.state || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="kaarigar-craft-tag" style={{ margin: 0 }}>
                      {app.craftType}
                    </span>
                  </td>
                  <td>
                    <strong>{app.event?.name || 'Mela Event'}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {app.event?.date || ''} • {app.event?.city || ''}
                    </div>
                  </td>
                  <td>
                    {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN') : 'Recent'}
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenReview(app)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.35rem 0.85rem' }}
                    >
                      <Eye size={14} /> Review Stall
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Review Artisan Application"
        maxWidth="700px"
      >
        {selectedApp && (
          <div>
            {/* Header: Artisan & Event */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={selectedApp.kaarigar?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt=""
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-secondary)' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                    {selectedApp.kaarigar?.name || selectedApp.kaarigarName || 'Artisan Profile'}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {selectedApp.kaarigar?.email} • {selectedApp.kaarigar?.phone}
                  </div>
                </div>
              </div>

              <StatusBadge status={selectedApp.status} />
            </div>

            {/* Target Mela */}
            <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-secondary-dark)' }}>
                Target Exhibition
              </div>
              <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.05rem', marginTop: '0.2rem' }}>
                {selectedApp.event?.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                {selectedApp.event?.location}, {selectedApp.event?.city} • Date: {selectedApp.event?.date}
              </div>
            </div>

            {/* Craft Details */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
                Craft Category: {selectedApp.craftType}
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
                {selectedApp.description}
              </p>
            </div>

            {/* Artisan Bio */}
            {selectedApp.kaarigar?.description && (
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Artisan Background & Heritage
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text)', marginTop: '0.25rem' }}>
                  {selectedApp.kaarigar.description}
                </p>
              </div>
            )}

            {/* Uploaded Craft Sample Photo */}
            {(selectedApp.craftImage || selectedApp.kaarigar?.craftPhoto) && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Craft Sample Specimen:</div>
                <div style={{ maxHeight: '220px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <img
                    src={selectedApp.craftImage || selectedApp.kaarigar?.craftPhoto}
                    alt="Craft sample"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            )}

            {/* Additional message / requirements */}
            {selectedApp.message && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>Artisan Notes / Stall Requests:</div>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  "{selectedApp.message}"
                </p>
              </div>
            )}

            {/* Committee Review Notes Input */}
            <FormInput
              id="review-notes"
              type="textarea"
              rows={2}
              label="Reviewer Notes / Feedback (Visible to Artisan)"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="e.g. Approved for Stall #B-14. Power socket provisioned..."
            />

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="btn btn-outline btn-sm"
                disabled={updatingStatus}
              >
                Close
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('rejected')}
                  className="btn btn-danger btn-sm"
                  disabled={updatingStatus}
                >
                  <XCircle size={15} /> Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('approved')}
                  className="btn btn-success btn-sm"
                  disabled={updatingStatus}
                >
                  <CheckCircle2 size={15} /> Approve Stall
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageApplications;
