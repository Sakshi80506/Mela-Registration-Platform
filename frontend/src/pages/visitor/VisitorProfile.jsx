import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Save, CheckCircle2, Edit3, Camera,
  Phone, Mail, MapPin, Trash2, AlertTriangle, Eye, EyeOff, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
];

const VisitorProfile = () => {
  const { currentUser, userProfile, updateUserProfile, deleteAccount, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');

  useEffect(() => {
    document.title = 'My Profile | Kaarigar Expo';
    if (userProfile) {
      setName(userProfile.name || '');
      setPhone(userProfile.phone || '');
      setCity(userProfile.city || '');
      setState(userProfile.state || '');
      setBio(userProfile.bio || '');
      setInterests(userProfile.interests || '');
      setLoading(false);
    }
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Name is required.');
      return;
    }
    if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      showError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({ name: name.trim(), phone, city, state, bio, interests });
      showSuccess('Profile updated successfully!');
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
      showSuccess('Your account has been permanently deleted.');
      navigate('/');
    } catch (err) {
      console.error(err);
      showError(err.message || 'Failed to delete account. Please log in again and retry.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your profile..." />;

  const initials = (name || userProfile?.name || 'V').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Visitor Account
        </span>
        <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>My Profile</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Manage your visitor account details, contact information, and preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        {/* Avatar & Identity Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.75rem', borderBottom: '1px solid var(--color-border-light)', flexWrap: 'wrap' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 800, flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#E8F5E9', color: 'var(--color-success)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={12} /> Verified Visitor
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '0.15rem 0' }}>
              {userProfile?.name || 'Visitor'}
            </h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} /> {currentUser?.email}
            </div>
            {(userProfile?.city || userProfile?.state) && (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <MapPin size={13} /> {[userProfile?.city, userProfile?.state].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Edit3 size={15} /> Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* View Mode */}
        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {[
              { label: 'Full Name', value: userProfile?.name || '—', icon: User },
              { label: 'Phone / WhatsApp', value: userProfile?.phone || '—', icon: Phone },
              { label: 'Email Address', value: currentUser?.email || '—', icon: Mail },
              { label: 'City', value: userProfile?.city || '—', icon: MapPin },
              { label: 'State', value: userProfile?.state || '—', icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '1rem 1.1rem', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <Icon size={12} /> {label}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: value === '—' ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
                  {value}
                </div>
              </div>
            ))}

            {(userProfile?.interests) && (
              <div style={{ gridColumn: '1 / -1', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '1rem 1.1rem', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>
                  Craft Interests
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
                  {userProfile.interests}
                </div>
              </div>
            )}

            {(userProfile?.bio) && (
              <div style={{ gridColumn: '1 / -1', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '1rem 1.1rem', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>
                  About Me
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.7 }}>
                  {userProfile.bio}
                </div>
              </div>
            )}

            {!userProfile?.phone && !userProfile?.city && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '1.5rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  Your profile is incomplete. Add your details to enhance your experience.
                </p>
                <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm">
                  <Edit3 size={14} /> Complete Profile
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSave}>
            <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              <Edit3 size={15} color="var(--color-secondary-dark)" />
              You are now editing your profile. Changes will be saved to your account.
            </div>

            <div className="form-grid-2">
              <FormInput
                id="visitor-name"
                label="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
              />
              <FormInput
                id="visitor-email"
                type="email"
                label="Email Address"
                disabled
                value={currentUser?.email || ''}
                helpText="Registered email cannot be changed"
              />
            </div>

            <div className="form-grid-2">
              <FormInput
                id="visitor-phone"
                type="tel"
                label="Phone / WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                helpText="10-digit Indian mobile number"
              />
              <div className="form-group">
                <label className="form-label" htmlFor="visitor-state">State</label>
                <select
                  id="visitor-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Select State --</option>
                  {indianStates.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <FormInput
              id="visitor-city"
              label="City / Town"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
            />

            <FormInput
              id="visitor-interests"
              label="Craft Interests (optional)"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Pottery, Block Printing, Handloom Textiles, Tribal Jewelry..."
              helpText="Help us recommend the best exhibitions for you"
            />

            <FormInput
              id="visitor-bio"
              type="textarea"
              rows={3}
              label="About Me (optional)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself and what draws you to handicraft exhibitions..."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-light)' }}>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Info */}
      <div className="card" style={{ padding: '1.75rem 2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <User size={18} color="var(--color-secondary-dark)" /> Account Details
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--color-bg)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
            <div style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Account Type</div>
            <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>Visitor / Guest</div>
          </div>
          <div style={{ background: 'var(--color-bg)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
            <div style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Member Since</div>
            <div style={{ fontWeight: 600 }}>
              {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recent'}
            </div>
          </div>
          <div style={{ background: 'var(--color-bg)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
            <div style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>User ID</div>
            <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.78rem', wordBreak: 'break-all' }}>
              {currentUser?.uid?.slice(0, 16)}…
            </div>
          </div>
        </div>
      </div>

      {/* Account Session / Logout */}
      <div className="card" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--color-border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
            <LogOut size={18} /> Sign Out / Logout
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', marginBottom: 0 }}>
            Safely log out of your visitor profile on this device.
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.95rem' }}>
              <Trash2 size={18} /> Danger Zone: Delete Account
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', marginBottom: 0 }}>
              Permanently delete your Visitor account and all registered Mela entry passes. This action cannot be undone.
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FFEBEE', color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-danger)', marginBottom: '0.5rem' }}>Delete Visitor Account?</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              All your entry passes and profile data will be permanently removed. This cannot be undone.
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

export default VisitorProfile;
