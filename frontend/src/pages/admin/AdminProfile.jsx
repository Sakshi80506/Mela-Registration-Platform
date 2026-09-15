import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, User, Mail, Sparkles, Key, CheckCircle2,
  Trash2, AlertTriangle, Edit3, Save, Phone, MapPin, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/common/FormInput';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
];

const AdminProfile = () => {
  const { currentUser, userProfile, updateUserProfile, deleteAccount, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      showError(err.message || 'Failed to logout');
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    document.title = 'Admin Profile | Kaarigar Expo';
    if (userProfile) {
      setName(userProfile.name || '');
      setPhone(userProfile.phone || '');
      setOrganization(userProfile.organization || '');
      setCity(userProfile.city || '');
      setState(userProfile.state || '');
      setBio(userProfile.bio || '');
    }
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Name is required.');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile({ name: name.trim(), phone, organization, city, state, bio });
      showSuccess('Admin profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      showSuccess('Admin account has been deleted.');
      navigate('/');
    } catch (err) {
      console.error(err);
      showError(err.message || 'Failed to delete account. Please re-login and retry.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const initials = (userProfile?.name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Organizer Profile
        </span>
        <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>Admin Account & Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Manage your administrator credentials and platform-level profile information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        {/* Identity Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.75rem', borderBottom: '1px solid var(--color-border-light)', flexWrap: 'wrap' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--color-primary)', color: 'var(--color-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 800, flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--color-secondary)', color: 'var(--color-primary-dark)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <Sparkles size={12} /> Super Administrator
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '0.15rem 0' }}>
              {userProfile?.name || 'Administrator'}
            </h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} /> {currentUser?.email}
            </div>
            {userProfile?.organization && (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                {userProfile.organization}
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={15} /> Edit Profile
              </button>
            ) : (
              <button onClick={() => setIsEditing(false)} className="btn btn-outline btn-sm" style={{ color: 'var(--color-text-muted)' }}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* View Mode */}
        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
            {[
              { label: 'Organizer Name', value: userProfile?.name || '—', icon: User },
              { label: 'Email Address', value: currentUser?.email || '—', icon: Mail },
              { label: 'Phone', value: userProfile?.phone || '—', icon: Phone },
              { label: 'Organization', value: userProfile?.organization || '—', icon: Shield },
              { label: 'City', value: userProfile?.city || '—', icon: MapPin },
              { label: 'State', value: userProfile?.state || '—', icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '1rem 1.1rem', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                  <Icon size={12} /> {label}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.93rem', color: value === '—' ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
                  {value}
                </div>
              </div>
            ))}

            {userProfile?.bio && (
              <div style={{ gridColumn: '1 / -1', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '1rem 1.1rem', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>About / Notes</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.7 }}>{userProfile.bio}</div>
              </div>
            )}
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSave}>
            <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              <Edit3 size={15} color="var(--color-secondary-dark)" />
              Editing admin profile — changes are reflected platform-wide.
            </div>

            <div className="form-grid-2">
              <FormInput
                id="admin-name"
                label="Organizer / Admin Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Rekha Nair"
              />
              <FormInput
                id="admin-email"
                type="email"
                label="Email Address"
                disabled
                value={currentUser?.email || ''}
                helpText="Account email cannot be changed"
              />
            </div>

            <div className="form-grid-2">
              <FormInput
                id="admin-phone"
                type="tel"
                label="Phone / Contact Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
              />
              <FormInput
                id="admin-org"
                label="Organization / Committee Name"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. National Handicraft Board"
              />
            </div>

            <div className="form-grid-2">
              <FormInput
                id="admin-city"
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New Delhi"
              />
              <div className="form-group">
                <label className="form-label" htmlFor="admin-state">State</label>
                <select id="admin-state" value={state} onChange={(e) => setState(e.target.value)} className="form-control">
                  <option value="">-- Select State --</option>
                  {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <FormInput
              id="admin-bio"
              type="textarea"
              rows={3}
              label="Notes / Bio (optional)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief notes about your role as organizer or platform administrator..."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-light)' }}>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Infrastructure Status Card */}
      <div className="card" style={{ padding: '1.75rem 2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
          <Key size={18} color="var(--color-secondary-dark)" /> Platform Infrastructure Status
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Firebase Auth', status: 'Active & Secured' },
            { label: 'Cloud Firestore', status: 'Real-time Sync' },
            { label: 'Cloud Storage', status: 'Artisan Photos' },
            { label: 'Security Rules', status: 'Enforced' },
          ].map(({ label, status }) => (
            <div key={label} style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>{label}</div>
              <div style={{ fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}>
                <CheckCircle2 size={14} /> {status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Session / Logout */}
      <div className="card" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--color-border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
            <LogOut size={18} /> Sign Out / Logout
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', marginBottom: 0 }}>
            Safely log out of your administrator account on this device.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ padding: '1.75rem 2rem', border: '1px solid rgba(198, 40, 40, 0.3)', background: '#FFF8F8' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)', fontWeight: 700 }}>
              <Trash2 size={18} /> Danger Zone: Delete Admin Account
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', marginBottom: 0 }}>
              Permanently removes your admin account and all management access. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-outline"
            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)', flexShrink: 0 }}
          >
            <Trash2 size={16} /> Delete Account
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FFEBEE', color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-danger)', marginBottom: '0.5rem' }}>Delete Admin Account?</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              You will immediately lose access to the admin dashboard and all platform management tools.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</button>
              <button type="button" className="btn btn-primary" style={{ flex: 1, background: 'var(--color-danger)' }} onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
