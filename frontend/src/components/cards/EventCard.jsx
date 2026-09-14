import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, Radio, Lock, ExternalLink } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { calculateEventStatus, formatEventDates, getEventMapUrl } from '../../utils/eventUtils';

const defaultEventImage = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80';

const EventCard = ({ event, onRsvpClick }) => {
  const {
    id,
    name,
    startTime,
    endTime,
    location,
    city,
    state,
    description,
    image,
    approvedArtisansCount = 0
  } = event;

  const currentStatus = calculateEventStatus(event);
  const formattedDates = formatEventDates(event);

  return (
    <article className="event-card" id={`event-card-${id}`}>
      <div className="event-card-media">
        <img 
          src={image || defaultEventImage} 
          alt={`Visual representation of ${name}`}
          className="event-card-img"
          loading="lazy"
          onError={(e) => { e.target.src = defaultEventImage; }}
        />
        <div className="event-card-badge">
          <StatusBadge status={currentStatus} />
        </div>
      </div>

      <div className="event-card-body">
        <h3 className="event-card-title">{name}</h3>

        <div className="event-card-meta">
          <div className="event-meta-item">
            <Calendar size={15} />
            <span>{formattedDates} {startTime ? `• ${startTime}` : ''}</span>
          </div>
          <div className="event-meta-item">
            <MapPin size={15} />
            <a
              href={getEventMapUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              title="Open venue location in Google Maps"
              style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'inherit'; }}
            >
              <span>{location}, {city}, {state}</span>
              <ExternalLink size={11} style={{ opacity: 0.6 }} />
            </a>
          </div>
          <div className="event-meta-item">
            <Users size={15} />
            <span>
              {approvedArtisansCount > 0 ? (
                <strong>{approvedArtisansCount} Approved {approvedArtisansCount === 1 ? 'Kaarigar' : 'Kaarigars'}</strong>
              ) : (
                'Artisan registration open'
              )}
            </span>
          </div>
        </div>

        <p className="event-card-desc">{description}</p>

        <div className="event-card-footer" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link to={`/melas/${id}`} className="btn btn-outline btn-sm" style={{ flex: '1 1 auto', textAlign: 'center' }}>
            View Details
          </Link>
          <a
            href={getEventMapUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', flex: '1 1 auto' }}
            title="Open location in Google Maps"
          >
            <MapPin size={14} color="var(--color-secondary-dark)" />
            <span>View Location</span>
          </a>
          {currentStatus === 'ongoing' && (
            <button 
              onClick={() => onRsvpClick ? onRsvpClick(event) : null}
              className="btn btn-primary btn-sm"
              style={{ background: '#059669', borderColor: '#059669', width: '100%' }}
            >
              Visit Today <ArrowRight size={14} />
            </button>
          )}
          {currentStatus === 'upcoming' && (
            <button 
              onClick={() => onRsvpClick ? onRsvpClick(event) : null}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
            >
              RSVP Pass <ArrowRight size={14} />
            </button>
          )}
          {currentStatus === 'closed' && (
            <div style={{ width: '100%', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Lock size={12} /> Exhibition Concluded
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default EventCard;

