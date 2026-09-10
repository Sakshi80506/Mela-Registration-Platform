import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Send, Calendar, MapPin, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { eventService } from '../../services/eventService';
import { applicationService } from '../../services/applicationService';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const craftCategories = [
  { label: '-- Select Craft Category --', value: '' },
  { label: 'Terracotta & Pottery', value: 'Terracotta & Pottery' },
  { label: 'Handloom & Weaving', value: 'Handloom & Weaving' },
  { label: 'Wood Carving & Inlay', value: 'Wood Carving' },
  { label: 'Metal Craft & Brassware', value: 'Metal Craft & Brassware' },
  { label: 'Folk Paintings', value: 'Folk Paintings' },
  { label: 'Blue Pottery', value: 'Blue Pottery' },
  { label: 'Leather Craft', value: 'Leather Craft' },
  { label: 'Block Printing & Dyeing', value: 'Block Printing & Dyeing' },
  { label: 'Embroidery & Zardozi', value: 'Embroidery & Zardozi' },
  { label: 'Bamboo & Cane', value: 'Bamboo & Cane' },
  { label: 'Stone Craft', value: 'Stone Craft' },
  { label: 'Traditional Jewelry', value: 'Traditional Jewelry' },
  { label: 'Other Handicrafts', value: 'Other' }
];

const ApplyMela = () => {
  const { currentUser, kaarigarProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(location.state?.selectedEventId || '');
  const [craftType, setCraftType] = useState(kaarigarProfile?.craftType || '');
  const [description, setDescription] = useState(kaarigarProfile?.description || '');
  const [message, setMessage] = useState('');
  const [craftImageFile, setCraftImageFile] = useState(null);
  const [craftImagePreview, setCraftImagePreview] = useState(kaarigarProfile?.craftPhoto || '');

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Apply for Mela | Kaarigar Expo";
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await eventService.getUpcomingEvents();
      setEvents(data);
      if (!selectedEventId && data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching upcoming melas:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCraftImageFile(file);
      setCraftImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEventId) {
      showError('Please select a Mela event to apply for.');
      return;
    }

    if (!craftType || !description) {
      showError('Please provide your craft category and stall description.');
      return;
    }

    const kId = kaarigarProfile?.id || currentUser?.uid;

    setSubmitting(true);
    try {
      await applicationService.applyForMela(
        kId,
        selectedEventId,
        {
          craftType,
          description,
          craftImage: craftImagePreview,
          message
        },
        craftImageFile
      );

      showSuccess('Application submitted successfully! It is now pending admin review.');
      navigate('/kaarigar/applications');
    } catch (err) {
      console.error('Application submission error:', err);
      showError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const eventOptions = [
    { label: '-- Select an Upcoming Mela --', value: '' },
    ...events.map(ev => ({
      label: `${ev.name} (${ev.city}, ${ev.state} • ${ev.date})`,
      value: ev.id
    }))
  ];

  const selectedEventDetails = events.find(e => e.id === selectedEventId);

  if (loadingEvents) {
    return <LoadingSpinner message="Loading upcoming melas..." />;
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Stall Allotment
        </span>
        <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>Apply for Mela Exhibition</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Submit your application to participate as an artisan exhibitor at upcoming handicraft melas.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertCircle size={48} color="var(--color-warning)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Upcoming Melas Available</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            There are currently no upcoming melas open for artisan registration. Please check back soon.
          </p>
          <Link to="/kaarigar/dashboard" className="btn btn-primary btn-sm">
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem' }}>
          {/* Mela Selection */}
          <FormInput
            id="apply-mela"
            type="select"
            label="Select Exhibition / Mela"
            required
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            options={eventOptions}
          />

          {/* Selected Event Preview Card */}
          {selectedEventDetails && (
            <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                  {selectedEventDetails.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                  <span><Calendar size={13} style={{ display: 'inline' }} /> {selectedEventDetails.date}</span>
                  <span><MapPin size={13} style={{ display: 'inline' }} /> {selectedEventDetails.location}, {selectedEventDetails.city}</span>
                </div>
              </div>
              <Link to={`/melas/${selectedEventDetails.id}`} target="_blank" className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>
                View Event Info
              </Link>
            </div>
          )}

          <FormInput
            id="apply-craft-type"
            type="select"
            label="Craft Type for this Stall"
            required
            value={craftType}
            onChange={(e) => setCraftType(e.target.value)}
            options={craftCategories}
          />

          <FormInput
            id="apply-description"
            type="textarea"
            rows={4}
            label="Exhibition Craft & Products Description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="List the handicraft items you plan to display/sell, dimensions, live demonstration plans (if any)..."
          />

          {/* Craft Photo for this application */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Sample Craft / Work Image for Review (Optional)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {craftImagePreview && (
                <div style={{ width: '120px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <img src={craftImagePreview} alt="Sample preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={15} /> Choose Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          <FormInput
            id="apply-message"
            type="textarea"
            rows={3}
            label="Additional Notes / Stall Requirements (Optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Need power connection for pottery wheel, corner stall preferred..."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-light)' }}>
            <Link to="/kaarigar/dashboard" className="btn btn-outline">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn btn-secondary btn-lg"
              disabled={submitting}
            >
              {submitting ? 'Submitting Application...' : (
                <>
                  <Send size={18} /> Submit Stall Application
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ApplyMela;
