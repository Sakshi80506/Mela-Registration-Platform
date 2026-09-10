import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Eye, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import FilterBar from '../../components/common/FilterBar';
import Modal from '../../components/common/Modal';

const MyApplications = () => {
  const { currentUser, kaarigarProfile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    document.title = "My Applications | Kaarigar Expo";
    loadApplications();
  }, [currentUser, kaarigarProfile]);

  const loadApplications = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const kId = kaarigarProfile?.id || currentUser.uid;
      const data = await applicationService.getMyApplications(kId);
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(a => a.status === 'pending').length;
    const approved = applications.filter(a => a.status === 'approved').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;

    return [
      { label: 'All', value: 'all', count: total },
      { label: 'Pending', value: 'pending', count: pending },
      { label: 'Approved', value: 'approved', count: approved },
      { label: 'Rejected', value: 'rejected', count: rejected }
    ];
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'all') return applications;
    return applications.filter(a => a.status === statusFilter);
  }, [applications, statusFilter]);

  if (loading) {
    return <LoadingSpinner message="Loading your applications..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Application History
          </span>
          <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>My Mela Applications</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Track the status of all your submitted stall participation requests.
          </p>
        </div>

        <Link to="/kaarigar/apply" className="btn btn-secondary">
          <Send size={16} /> Apply for Another Mela
        </Link>
      </div>

      <div style={{ marginBottom: '1.75rem' }}>
        <FilterBar
          options={filterOptions}
          activeValue={statusFilter}
          onSelect={setStatusFilter}
          label="Filter by Status:"
        />
      </div>

      {filteredApplications.length === 0 ? (
        <EmptyState
          title="No Applications Found"
          message={statusFilter === 'all' ? "You haven't submitted any mela applications yet." : `You have no applications with status "${statusFilter}".`}
          actionText={statusFilter === 'all' ? "Apply for Mela" : "Show All"}
          actionLink={statusFilter === 'all' ? "/kaarigar/apply" : null}
          onActionClick={statusFilter !== 'all' ? () => setStatusFilter('all') : null}
        />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Event Date & City</th>
                <th>Craft Applied</th>
                <th>Submitted On</th>
                <th>Review Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong>{app.event?.name || 'Mela Event'}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span><Calendar size={13} style={{ display: 'inline' }} /> {app.event?.date || 'Date TBA'}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                        <MapPin size={12} style={{ display: 'inline' }} /> {app.event?.city || ''}, {app.event?.state || ''}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="kaarigar-craft-tag" style={{ margin: 0 }}>
                      {app.craftType}
                    </span>
                  </td>
                  <td>
                    {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.35rem 0.75rem' }}
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Application Details Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Application Details"
        maxWidth="650px"
      >
        {selectedApp && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border-light)' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Status</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Applied On</span>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {selectedApp.appliedAt ? new Date(selectedApp.appliedAt).toLocaleString('en-IN') : 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                {selectedApp.event?.name || 'Mela Event'}
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                {selectedApp.event?.location}, {selectedApp.event?.city}, {selectedApp.event?.state} • Date: {selectedApp.event?.date}
              </p>
            </div>

            <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                Craft Category: {selectedApp.craftType}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                {selectedApp.description}
              </div>
            </div>

            {selectedApp.craftImage && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Uploaded Craft Sample</div>
                <div style={{ width: '100%', maxHeight: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <img src={selectedApp.craftImage} alt="Craft sample" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            )}

            {selectedApp.message && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>Stall Requirements / Message</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  "{selectedApp.message}"
                </p>
              </div>
            )}

            {selectedApp.reviewNotes && (
              <div style={{ background: 'var(--color-info-bg)', border: '1px solid #B3E5FC', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Info size={15} /> Committee Review Notes:
                </div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {selectedApp.reviewNotes}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedApp(null)} className="btn btn-outline btn-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyApplications;
