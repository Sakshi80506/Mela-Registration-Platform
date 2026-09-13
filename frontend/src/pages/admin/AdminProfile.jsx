import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Sparkles, Key, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/common/FormInput';

const AdminProfile = () => {
  const { currentUser, userProfile, deleteAccount } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = "Admin Profile | Kaarigar Expo";
  }, []);

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await deleteAccount();
      showSuccess('Your Admin account has been deleted.');
      navigate('/');
    } catch (err) {
      console.error('Delete account error:', err);
      showError(err.message || 'Failed to delete account. You may need to re-login first.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Organizer Profile
        </span>
        <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>Admin Account & Platform Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Manage your administrator credentials and platform oversight permissions.
        </p>
      </div>

      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border-light)' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--color-primary)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={34} />
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'var(--color-secondary)', color: 'var(--color-primary-dark)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              <Sparkles size={12} /> Super Administrator
            </div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}>{userProfile?.name || 'Administrator'}</h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>{currentUser?.email}</div>
          </div>
        </div>

        <div className="form-grid-2">
          <FormInput
            id="admin-name"
            label="Organizer Name"
            disabled
            value={userProfile?.name || 'Administrator'}
          />

          <FormInput
            id="admin-email"
            type="email"
            label="Admin Email"
            disabled
            value={currentUser?.email || ''}
          />
        </div>

        <div className="form-grid-2">
          <FormInput
            id="admin-role"
            label="Assigned Role"
            disabled
            value="System Admin / Exhibition Committee"
          />

          <FormInput
            id="admin-uid"
            label="Account UID"
            disabled
            value={currentUser?.uid || ''}
          />
        </div>
      </div>

      {/* System Security and Configuration Overview */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={18} color="var(--color-secondary-dark)" /> Platform Infrastructure Status
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Firebase Auth</div>
            <div style={{ fontWeight: 700, color: 'var(--color-success)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={14} /> Active & Secured
            </div>
          </div>

          <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Cloud Firestore</div>
            <div style={{ fontWeight: 700, color: 'var(--color-success)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={14} /> Real-time Sync
            </div>
          </div>

          <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Cloud Storage</div>
            <div style={{ fontWeight: 700, color: 'var(--color-success)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={14} /> Artisan Photos
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="card" style={{ marginTop: '2rem', padding: '1.75rem 2rem', border: '1px solid rgba(198, 40, 40, 0.3)', background: '#FFF8F8' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.95rem' }}>
              <Trash2 size={18} /> Danger Zone: Delete Account
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', marginBottom: 0 }}>
              Permanently delete your Admin account credentials and platform access. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-outline"
            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
          >
            <Trash2 size={16} /> Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#FFEBEE', color: 'var(--color-danger)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-danger)', marginBottom: '0.5rem' }}>
              Delete Admin Account?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete your administrator account? You will immediately lose access to the admin management dashboard.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, background: 'var(--color-danger)' }}
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
