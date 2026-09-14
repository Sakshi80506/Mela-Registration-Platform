import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Calendar, MapPin, Upload, Sparkles, ArrowLeft, Info, CheckCircle2, Clock } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { calculateEventStatus, getEventStatusInfo } from '../../utils/eventUtils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/common/FormInput';
import StatusBadge from '../../components/common/StatusBadge';

const defaultImages = [
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1599818817290-7f2bf8f23f6d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80'
];

const CreateMela = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('20:00');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(defaultImages[0]);
  const [maxArtisans, setMaxArtisans] = useState(50);
  const [maxVisitors, setMaxVisitors] = useState(2000);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Create Mela | Kaarigar Expo";
  }, []);

  // Compute live auto-detected status as dates/times change
  const autoDetectedStatus = useMemo(() => {
    if (!startDate) return 'upcoming';
    return calculateEventStatus({
      startDate,
      date: startDate,
      endDate: endDate || startDate,
      startTime,
      endTime
    });
  }, [startDate, endDate, startTime, endTime]);

  const statusInfo = useMemo(() => {
    return getEventStatusInfo(autoDetectedStatus);
  }, [autoDetectedStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !startDate || !startTime || !endTime || !location || !city || !state || !description) {
      showError('Please fill in all mandatory event fields.');
      return;
    }

    if (endDate && endDate < startDate) {
      showError('End date cannot be earlier than start date.');
      return;
    }

    setSubmitting(true);
    try {
      await eventService.createEvent({
        name,
        date: startDate,
        startDate,
        endDate: endDate || startDate,
        startTime,
        endTime,
        location,
        city,
        state,
        description,
        image,
        maxArtisans: Number(maxArtisans) || 50,
        maxVisitors: Number(maxVisitors) || 2000,
        status: autoDetectedStatus
      }, currentUser?.uid);

      showSuccess(`Mela "${name}" scheduled as ${autoDetectedStatus.toUpperCase()}!`);
      navigate('/admin/melas');
    } catch (err) {
      console.error('Error creating mela:', err);
      showError(err.message || 'Failed to create mela.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/melas" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Manage Melas
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Event Creation
        </span>
        <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem' }}>Schedule a New Mela</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Publish a new exhibition for artisan stall applications and visitor reservations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem' }}>
        <FormInput
          id="event-name"
          label="Mela / Exhibition Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. National Terracotta & Handloom Heritage Expo 2026"
        />

        <div className="form-grid-2">
          <FormInput
            id="event-start-date"
            type="date"
            label="Start Date"
            required
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (!endDate || endDate < e.target.value) {
                setEndDate(e.target.value);
              }
            }}
          />
          <FormInput
            id="event-end-date"
            type="date"
            label="End Date (Optional / Multi-day)"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            helpText="Defaults to start date for single-day exhibitions"
          />
        </div>

        <div className="form-grid-2">
          <FormInput
            id="event-start-time"
            type="time"
            label="Opening / Start Time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <FormInput
            id="event-end-time"
            type="time"
            label="Closing / End Time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        {/* Live Auto-Detection Card */}
        <div style={{
          background: 'var(--color-bg-alt)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Sparkles size={14} color="var(--color-secondary-dark)" /> Auto-Calculated Exhibition Status
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', marginBottom: 0 }}>
              {startDate ? statusInfo.description : 'Select a start date to see automatically calculated timeline status.'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <StatusBadge status={autoDetectedStatus} />
          </div>
        </div>

        <FormInput
          id="event-location"
          label="Venue Address & Complex"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Pragati Maidan Hall 5, Mathura Road"
        />

        <div className="form-grid-2">
          <FormInput
            id="event-city"
            label="City"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. New Delhi"
          />
          <FormInput
            id="event-state"
            label="State"
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. Delhi"
          />
        </div>

        <FormInput
          id="event-desc"
          type="textarea"
          rows={4}
          label="Exhibition Description & Highlights"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the themes, craft demonstrations, master workshops, cultural performances..."
        />

        <div className="form-grid-2">
          <FormInput
            id="event-max-artisans"
            type="number"
            min="1"
            max="500"
            label="Max Artisan Stalls Capacity"
            required
            value={maxArtisans}
            onChange={(e) => setMaxArtisans(e.target.value)}
          />
          <FormInput
            id="event-max-visitors"
            type="number"
            min="10"
            max="100000"
            label="Max Visitor Capacity"
            value={maxVisitors}
            onChange={(e) => setMaxVisitors(e.target.value)}
          />
        </div>

        <FormInput
          id="event-image-url"
          label="Event Banner Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          helpText="Enter a direct image URL or choose one of the curated handicraft images."
        />

        {/* Quick image preset selection */}
        <div style={{ marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
            Quick Image Presets:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {defaultImages.map((imgUrl, i) => (
              <div 
                key={i} 
                onClick={() => setImage(imgUrl)}
                style={{
                  height: '80px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: image === imgUrl ? '3px solid var(--color-secondary)' : '1px solid var(--color-border)',
                  opacity: image === imgUrl ? 1 : 0.6
                }}
              >
                <img src={imgUrl} alt="preset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-light)' }}>
          <Link to="/admin/melas" className="btn btn-outline">
            Cancel
          </Link>
          <button 
            type="submit" 
            className="btn btn-secondary btn-lg"
            disabled={submitting}
          >
            {submitting ? 'Creating Mela...' : (
              <>
                <PlusCircle size={18} /> Publish Mela Event
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMela;
