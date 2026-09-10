import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const defaultEventImage = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80';

const EventCard = ({ event, onRsvpClick }) => {
  const {
    id,
    name,
    date,
    startTime,
    endTime,
    location,
    city,
    state,
    description,
    image,
    status = 'upcoming',
    approvedArtisansCount = 0
  } = event;

  const formattedDate = date ? new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Date TBA';

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
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="event-card-body">
        <h3 className="event-card-title">{name}</h3>

        <div className="event-card-meta">
          <div className="event-meta-item">
            <Calendar size={15} />
            <span>{formattedDate} {startTime ? `• ${startTime}` : ''}</span>
          </div>
          <div className="event-meta-item">
            <MapPin size={15} />
            <span>{location}, {city}, {state}</span>
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

        <div className="event-card-footer">
          <Link to={`/melas/${id}`} className="btn btn-outline btn-sm">
            View Details
          </Link>
          {status === 'upcoming' && (
            <button 
              onClick={() => onRsvpClick ? onRsvpClick(event) : null}
              className="btn btn-secondary btn-sm"
            >
              RSVP Now <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default EventCard;
