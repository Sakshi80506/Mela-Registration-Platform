import React from 'react';
import { MapPin, Sparkles, Mail, Phone } from 'lucide-react';

const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

const KaarigarCard = ({ kaarigar }) => {
  const {
    id,
    name,
    craftType,
    description,
    city,
    state,
    profilePhoto,
    craftPhoto,
    email,
    phone
  } = kaarigar;

  return (
    <article className="kaarigar-card" id={`kaarigar-${id}`}>
      <img 
        src={profilePhoto || defaultAvatar} 
        alt={`Profile of ${name}`}
        className="kaarigar-avatar"
        loading="lazy"
        onError={(e) => { e.target.src = defaultAvatar; }}
      />
      <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>
        {name}
      </h4>
      
      {craftType && (
        <span className="kaarigar-craft-tag">
          <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
          {craftType}
        </span>
      )}

      {(city || state) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
          <MapPin size={14} />
          <span>{city}{city && state ? ', ' : ''}{state}</span>
        </div>
      )}

      <p style={{ fontSize: '0.88rem', color: 'var(--color-text)', marginBottom: '1rem', lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {description || 'Master craftsperson dedicated to preserving traditional Indian art forms.'}
      </p>

      {craftPhoto && (
        <div style={{ width: '100%', height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginTop: 'auto', border: '1px solid var(--color-border-light)' }}>
          <img 
            src={craftPhoto} 
            alt={`Craft specimen by ${name}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
    </article>
  );
};

export default KaarigarCard;
