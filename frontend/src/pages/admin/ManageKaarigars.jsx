import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  Phone, 
  Mail, 
  Search, 
  AlertTriangle,
  Sparkles,
  Palette
} from 'lucide-react';
import { kaarigarService } from '../../services/kaarigarService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const ManageKaarigars = () => {
  const [kaarigars, setKaarigars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCraft, setSelectedCraft] = useState('all');
  const [deletingKaarigar, setDeletingKaarigar] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    document.title = "Manage Kaarigars | Admin | Kaarigar Expo";
    loadKaarigars();
  }, []);

  const loadKaarigars = async () => {
    try {
      setLoading(true);
      const data = await kaarigarService.getAllKaarigars();
      setKaarigars(data);
    } catch (err) {
      console.error('Failed to load kaarigars:', err);
      showError('Failed to load artisan profiles.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingKaarigar) return;
    setDeleting(true);
    try {
      await kaarigarService.deleteKaarigar(deletingKaarigar.id);
      showSuccess(`Kaarigar profile "${deletingKaarigar.name}" deleted successfully.`);
      setKaarigars(prev => prev.filter(k => k.id !== deletingKaarigar.id));
      setDeletingKaarigar(null);
    } catch (err) {
      console.error('Error deleting kaarigar:', err);
      showError(err.message || 'Failed to delete kaarigar profile.');
    } finally {
      setDeleting(false);
    }
  };

  // Extract unique crafts for filter
  const craftTypes = Array.from(new Set(kaarigars.map(k => k.craftType).filter(Boolean)));

  const filteredKaarigars = kaarigars.filter(k => {
    const matchesCraft = selectedCraft === 'all' || k.craftType === selectedCraft;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (k.name && k.name.toLowerCase().includes(query)) ||
      (k.craftType && k.craftType.toLowerCase().includes(query)) ||
      (k.city && k.city.toLowerCase().includes(query)) ||
      (k.state && k.state.toLowerCase().includes(query)) ||
      (k.email && k.email.toLowerCase().includes(query));
    return matchesCraft && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner message="Loading registered artisans..." />;
  }

  return (
    <div>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Artisan Registry
          </span>
          <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>Manage Kaarigar Profiles</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            View, search, verify, or delete artisan registrations across the platform.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-surface)', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <Users size={20} color="var(--color-primary)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Artisans</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>{kaarigars.length}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search by artisan name, craft, city, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.75rem', width: '100%', height: '42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
          />
        </div>

        <select
          value={selectedCraft}
          onChange={(e) => setSelectedCraft(e.target.value)}
          className="form-control"
          style={{ width: 'auto', minWidth: '180px', height: '42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
        >
          <option value="all">All Craft Categories ({kaarigars.length})</option>
          {craftTypes.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {filteredKaarigars.length === 0 ? (
        <EmptyState
          title="No Artisans Found"
          message={searchQuery || selectedCraft !== 'all' ? "No artisan profiles matched your search filter criteria." : "No kaarigars have registered their profiles yet."}
        />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Artisan Details</th>
                <th>Craft Specialization</th>
                <th>Location</th>
                <th>Contact Info</th>
                <th>Experience</th>
                <th style={{ textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKaarigars.map((k) => (
                <tr key={k.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={k.profilePhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'}
                        alt={k.name}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-secondary)' }}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'; }}
                      />
                      <div>
                        <strong>{k.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ID: {k.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="kaarigar-craft-tag" style={{ margin: 0 }}>
                      <Palette size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {k.craftType || 'Handicraft'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}>
                      <MapPin size={13} color="var(--color-secondary-dark)" />
                      <span>{k.city || 'City TBA'}, {k.state || ''}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {k.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={12} color="var(--color-text-muted)" /> {k.phone}
                        </span>
                      )}
                      {k.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)' }}>
                          <Mail size={12} /> {k.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {k.experienceYears ? `${k.experienceYears} Years` : '—'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <Link
                        to={`/kaarigars`}
                        target="_blank"
                        className="btn btn-outline btn-sm"
                        title="View Public Profile"
                        style={{ padding: '0.35rem 0.65rem' }}
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <button
                        onClick={() => setDeletingKaarigar(k)}
                        className="btn btn-outline btn-sm"
                        title="Delete Kaarigar Profile"
                        style={{ padding: '0.35rem 0.65rem', color: 'var(--color-danger)', borderColor: '#FFCDD2' }}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingKaarigar}
        onClose={() => setDeletingKaarigar(null)}
        title="Confirm Delete Kaarigar Profile"
        maxWidth="460px"
      >
        {deletingKaarigar && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>
                Are you sure you want to permanently delete the profile of artisan <strong>"{deletingKaarigar.name}"</strong>?
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setDeletingKaarigar(null)} 
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
                {deleting ? 'Deleting...' : 'Yes, Delete Profile'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageKaarigars;
