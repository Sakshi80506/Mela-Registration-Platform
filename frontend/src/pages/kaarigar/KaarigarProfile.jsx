import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Sparkles, Upload, Save, CheckCircle2, Image as ImageIcon, Trash2, AlertTriangle, X, Edit3, Phone, MapPin, Mail } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
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
      const kProfile = await kaarigarService.getKaarigarByUserId(currentUser.uid);

      setName(kProfile?.name || userProfile?.name || currentUser.displayName || '');
      setEmail(kProfile?.email || userProfile?.email || currentUser.email || '');
      setPhone(kProfile?.phone || userProfile?.phone || '');
      setCraftType(kProfile?.craftType || '');
      setDescription(kProfile?.description || '');
      setCity(kProfile?.city || userProfile?.city || '');
      setState(kProfile?.state || userProfile?.state || '');
      setProfilePhotoUrl(kProfile?.profilePhoto || '');
      setCraftPhotoUrl(kProfile?.craftPhoto || '');
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setProfilePhotoFile(file); setProfilePhotoPreview(URL.createObjectURL(file)); }
  };

  const handleCraftPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setCraftPhotoFile(file); setCraftPhotoPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !craftType || !description || !city || !state || !phone) {
      showError('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }
    setSaving(true);
    try {
      const payload = { name, email, phone, craftType, description, city, state, profilePhoto: profilePhotoUrl, craftPhoto: craftPhotoUrl };
      await kaarigarService.saveProfile(currentUser.uid, payload, profilePhotoFile, craftPhotoFile);
      await refreshKaarigarProfile();
      showSuccess('Artisan profile updated successfully!');
      setIsEditing(false);
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

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  const infoItems = [
    { label: 'Full Name', value: name || '—', icon: User },
    { label: 'Email', value: email || '—', icon: Mail },
    { label: 'Phone / WhatsApp', value: phone || '—', icon: Phone },
    { label: 'Craft Specialization', value: craftType || '—', icon: Sparkles },
    { label: 'City', value: city || '—', icon: MapPin },
    { label: 'State', value: state || '—', icon: MapPin },
  ];

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Artisan Identity
        </span>
        <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>My Kaarigar Profile</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Your public profile is visible to event organizers and visitors when your stall applications are approved.
        </p>
      </div>

      {/* Profile Identity Header */}
      <div className="card" style={{ padding: '1.75rem 2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--color-secondary)', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            <img
              src={profilePhotoPreview || profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'K')}&background=B45309&color=FFF&size=80`}
              alt="Artisan"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--color-secondary)', color: 'var(--color-primary-dark)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <Sparkles size={12} /> Artisan / Kaarigar
            </div>
            <h2 style={{ fontSize: '1.45rem', color: 'var(--color-primary)', margin: '0.1rem 0' }}>{name || 'Your Name'}</h2>
            {craftType && <div style={{ fontSize: '0.9rem', color: 'var(--color-secondary-dark)', fontWeight: 600, marginBottom: '0.25rem' }}>{craftType}</div>}
            <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {(city || state) && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {[city, state].filter(Boolean).join(', ')}</span>}
              {phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={13} /> {phone}</span>}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={15} /> Edit Profile
              </button>
            ) : (
              <button onClick={() => setIsEditing(false)} className="btn btn-outline btn-sm" style={{ color: 'var(--color-text-muted)' }}>
                <X size={15} /> Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View / Edit Toggle Content */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem' }}>
          <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1.1rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--color-primary)', fontWeight: 600 }}>
            <Edit3 size={15} color="var(--color-secondary-dark)" /> Editing artisan profile — changes are saved to your public artisan card.
          </div>

          {/* Photo Uploads */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', paddingBottom: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border-light)' }}>
            <div style={{ textAlign: 'center' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Profile Photo / Artisan Portrait</label>
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', margin: '0 auto 1rem', overflow: 'hidden', border: '3px solid var(--color-secondary)', background: 'var(--color-bg-alt)' }}>
                <img src={profilePhotoPreview || profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} alt="Portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} /> Upload Portrait
                <input type="file" accept="image/*" onChange={handleProfilePhotoChange} style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ textAlign: 'center' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Representative Craft Photo (Optional)</label>
              <div style={{ width: '160px', height: '110px', borderRadius: 'var(--radius-md)', margin: '0 auto 1rem', overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
                {craftPhotoPreview || craftPhotoUrl ? (
                  <img src={craftPhotoPreview || craftPhotoUrl} alt="Craft" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                    <ImageIcon size={24} /><span style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>No photo</span>
                  </div>
                )}
              </div>
              <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} /> Upload Craft Sample
                <input type="file" accept="image/*" onChange={handleCraftPhotoChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div className="form-grid-2">
            <FormInput id="profile-name" label="Full Name / Artisan Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Master Ustad Rahim Khan" />
            <FormInput id="profile-email" type="email" label="Email Address" disabled value={email} helpText="Registered account email (non-editable)" />
          </div>
          <div className="form-grid-2">
            <FormInput id="profile-phone" type="tel" label="Phone / WhatsApp Contact" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" />
            <FormInput id="profile-craft" type="select" label="Primary Craft Specialization" required value={craftType} onChange={(e) => setCraftType(e.target.value)} options={craftOptions} />
          </div>
          <div className="form-grid-2">
            <FormInput id="profile-city" label="City / Town" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Jaipur" />
            <FormInput id="profile-state" label="State" required value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Rajasthan" />
          </div>
          <FormInput id="profile-desc" type="textarea" rows={4} label="Artisan Bio & Craft Heritage Description" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your craft lineage, traditional techniques, awards received..." helpText="A rich description helps exhibition organizers evaluate your stall application quickly." />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-light)' }}>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Saving Changes...' : <><Save size={18} /> Save Artisan Profile</>}
            </button>
          </div>
        </form>
      ) : (
        /* View Mode */
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem', marginBottom: description ? '1.1rem' : 0 }}>
            {infoItems.map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '0.9rem 1rem', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                  <Icon size={12} /> {label}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.93rem', color: value === '—' ? 'var(--color-text-muted)' : 'var(--color-text)', wordBreak: 'break-word' }}>{value}</div>
              </div>
            ))}
          </div>
          {description && (
            <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '1rem 1.1rem', border: '1px solid var(--color-border)', marginTop: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>Artisan Bio & Craft Heritage</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.75 }}>{description}</div>
            </div>
          )}
          {craftPhotoUrl && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Craft Sample Photo</div>
              <img src={craftPhotoUrl} alt="Craft sample" style={{ maxWidth: '280px', width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
            </div>
          )}
          {!description && !phone && !city && (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Your artisan profile is incomplete. Complete it to get noticed by event organizers.</p>
              <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm"><Edit3 size={14} /> Complete Profile</button>
            </div>
          )}
        </div>
      )}

      {/* Danger Zone */}
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
          <button type="button" onClick={() => setShowDeleteModal(true)} className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)', flexShrink: 0 }}>
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
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-danger)', marginBottom: '0.5rem' }}>Delete Kaarigar Account?</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure? All your artisan profile details and mela applications will be completely removed.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</button>
              <button type="button" className="btn btn-primary" style={{ flex: 1, background: 'var(--color-danger)' }} onClick={handleDeleteAccount} disabled={deleting}>
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
