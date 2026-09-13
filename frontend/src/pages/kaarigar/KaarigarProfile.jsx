import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Sparkles, Upload, Save, CheckCircle2, Image as ImageIcon, Trash2, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { kaarigarService } from '../../services/kaarigarService';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const craftOptions = [
  { label: '-- Select Craft Category --', value: '' },
  { label: 'Terracotta & Pottery', value: 'Terracotta & Pottery' },
  { label: 'Handloom & Weaving (Silk / Cotton / Pashmina)', value: 'Handloom & Weaving' },
  { label: 'Wood Carving & Marquetry', value: 'Wood Carving' },
  { label: 'Brassware & Metal Engraving (Dhokra / Bidri)', value: 'Metal Craft & Brassware' },
  { label: 'Folk Paintings (Madhubani / Warli / Pattachitra / Phad)', value: 'Folk Paintings' },
  { label: 'Blue Pottery & Ceramic Art', value: 'Blue Pottery' },
  { label: 'Leather Craft (Mojaris / Embossed leather)', value: 'Leather Craft' },
  { label: 'Block Printing & Tie-Dye (Bandhani / Ajrakh / Bagru)', value: 'Block Printing & Dyeing' },
  { label: 'Zardozi & Chikankari Embroidery', value: 'Embroidery & Zardozi' },
  { label: 'Bamboo & Cane Crafts', value: 'Bamboo & Cane' },
  { label: 'Stone & Marble Inlay Work', value: 'Stone Craft' },
  { label: 'Jewelry & Beadwork (Kundan / Meenakari / Terracotta)', value: 'Traditional Jewelry' },
  { label: 'Other Traditional Craft', value: 'Other' }
];

const KaarigarProfile = () => {
  const { currentUser, userProfile, kaarigarProfile, refreshKaarigarProfile, deleteAccount } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [craftType, setCraftType] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [craftPhotoUrl, setCraftPhotoUrl] = useState('');

  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [craftPhotoFile, setCraftPhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [craftPhotoPreview, setCraftPhotoPreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = "My Artisan Profile | Kaarigar Expo";
    loadProfile();
  }, [currentUser, kaarigarProfile]);

  const loadProfile = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      // Always fetch the freshest artisan profile directly from Firestore
      const kProfile = await kaarigarService.getKaarigarByUserId(currentUser.uid);
      
      const currentName = kProfile?.name || userProfile?.name || currentUser.displayName || '';
      const currentEmail = kProfile?.email || userProfile?.email || currentUser.email || '';
      const currentPhone = kProfile?.phone || userProfile?.phone || '';
      const currentCraft = kProfile?.craftType || '';
      const currentDesc = kProfile?.description || '';
      const currentCity = kProfile?.city || userProfile?.city || '';
      const currentState = kProfile?.state || userProfile?.state || '';
      const currentProfilePhoto = kProfile?.profilePhoto || '';
      const currentCraftPhoto = kProfile?.craftPhoto || '';

      setName(currentName);
      setEmail(currentEmail);
      setPhone(currentPhone);
      setCraftType(currentCraft);
      setDescription(currentDesc);
      setCity(currentCity);
      setState(currentState);
      setProfilePhotoUrl(currentProfilePhoto);
      setCraftPhotoUrl(currentCraftPhoto);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoFile(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCraftPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCraftPhotoFile(file);
      setCraftPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !craftType || !description || !city || !state || !phone) {
      showError('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        email,
        phone,
        craftType,
        description,
        city,
        state,
        profilePhoto: profilePhotoUrl,
        craftPhoto: craftPhotoUrl
      };

      await kaarigarService.saveProfile(
        currentUser.uid,
        payload,
        profilePhotoFile,
        craftPhotoFile
      );

      await refreshKaarigarProfile();
      showSuccess('Artisan profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      showError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      showSuccess('Your Kaarigar account and profile have been permanently deleted.');
      navigate('/');
    } catch (err) {
      console.error('Delete account error:', err);
      showError(err.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Artisan Identity
        </span>
        <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>My Kaarigar Profile</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Your public profile will be visible to event organizers and visitors when your stall applications are approved.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem' }}>
        {/* Photo Upload Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', paddingBottom: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border-light)' }}>
          {/* Profile Photo */}
          <div style={{ textAlign: 'center' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
              Profile Photo / Artisan Portrait
            </label>
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', margin: '0 auto 1rem', overflow: 'hidden', border: '3px solid var(--color-secondary)', background: 'var(--color-bg-alt)' }}>
              <img
                src={profilePhotoPreview || profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt="Artisan portrait"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={14} /> Upload Portrait
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleProfilePhotoChange} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>

          {/* Sample Craft Photo */}
          <div style={{ textAlign: 'center' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
              Representative Craft Photo (Optional)
            </label>
            <div style={{ width: '160px', height: '110px', borderRadius: 'var(--radius-md)', margin: '0 auto 1rem', overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
              {craftPhotoPreview || craftPhotoUrl ? (
                <img
                  src={craftPhotoPreview || craftPhotoUrl}
                  alt="Craft sample"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                  <ImageIcon size={24} />
                  <span style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>No photo</span>
                </div>
              )}
            </div>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={14} /> Upload Craft Sample
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleCraftPhotoChange} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        </div>

        {/* Primary Info */}
        <div className="form-grid-2">
          <FormInput
            id="profile-name"
            label="Full Name / Artisan Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Master Ustad Rahim Khan"
          />

          <FormInput
            id="profile-email"
            type="email"
            label="Email Address"
            disabled
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helpText="Registered account email (non-editable)"
          />
        </div>

        <div className="form-grid-2">
          <FormInput
            id="profile-phone"
            type="tel"
            label="Phone / WhatsApp Contact"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
          />

          <FormInput
            id="profile-craft"
            type="select"
            label="Primary Craft Specialization"
            required
            value={craftType}
            onChange={(e) => setCraftType(e.target.value)}
            options={craftOptions}
          />
        </div>

        <div className="form-grid-2">
          <FormInput
            id="profile-city"
            label="City / Town"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Jaipur"
          />

          <FormInput
            id="profile-state"
            label="State"
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. Rajasthan"
          />
        </div>

        <FormInput
          id="profile-desc"
          type="textarea"
          rows={4}
          label="Artisan Bio & Craft Heritage Description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your craft lineage, traditional techniques used, awards received, and special materials used in your work..."
          helpText="A rich description helps exhibition organizers evaluate your stall application quickly."
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-light)' }}>
          <button 
            type="submit" 
            className="btn btn-primary btn-lg"
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : (
              <>
                <Save size={18} /> Save Artisan Profile
              </>
            )}
          </button>
        </div>
      </form>

      {/* Danger Zone: Delete Account */}
      <div className="card" style={{ marginTop: '2rem', padding: '1.75rem 2rem', border: '1px solid rgba(198, 40, 40, 0.3)', background: '#FFF8F8' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.95rem' }}>
              <Trash2 size={18} /> Danger Zone: Delete Account
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', marginBottom: 0 }}>
              Permanently delete your Kaarigar account, stall applications, and artisan profile. This action cannot be undone.
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
              Delete Kaarigar Account?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete your account? All your artisan profile details and mela applications will be completely removed.
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

export default KaarigarProfile;
