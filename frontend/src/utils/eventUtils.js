/**
 * Event utility functions for calculating real-time status and date formatting.
 */

/**
 * Automatically computes event status ('upcoming' | 'ongoing' | 'closed')
 * based on the start date/time and end date/time compared to current date/time.
 * 
 * @param {Object} event - Event object with date, startDate, endDate, startTime, endTime
 * @param {Date} [referenceDate=new Date()] - Optional reference date (defaults to now)
 * @returns {'upcoming' | 'ongoing' | 'closed'}
 */
export const calculateEventStatus = (event, referenceDate = new Date()) => {
  if (!event) return 'upcoming';

  const startDateStr = event.startDate || event.date;
  const endDateStr = event.endDate || event.date || event.startDate;

  if (!startDateStr) return event.status || 'upcoming';

  const startTimeStr = event.startTime || '00:00';
  const endTimeStr = event.endTime || '23:59';

  try {
    // Construct Start DateTime (support ISO strings or YYYY-MM-DD)
    const normalizedStartDate = startDateStr.split('T')[0];
    const normalizedEndDate = endDateStr.split('T')[0];

    const startDateTime = new Date(`${normalizedStartDate}T${startTimeStr.length === 5 ? startTimeStr + ':00' : startTimeStr}`);
    const endDateTime = new Date(`${normalizedEndDate}T${endTimeStr.length === 5 ? endTimeStr + ':59' : endTimeStr}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      // Fallback: compare plain date strings
      const todayStr = referenceDate.toISOString().split('T')[0];
      if (todayStr < normalizedStartDate) return 'upcoming';
      if (todayStr > normalizedEndDate) return 'closed';
      return 'ongoing';
    }

    const now = referenceDate.getTime();

    if (now < startDateTime.getTime()) {
      return 'upcoming';
    } else if (now >= startDateTime.getTime() && now <= endDateTime.getTime()) {
      return 'ongoing';
    } else {
      return 'closed';
    }
  } catch (err) {
    console.warn('Error calculating event status:', err);
    return event.status || 'upcoming';
  }
};

/**
 * Returns human-readable label and description for an event status.
 */
export const getEventStatusInfo = (status) => {
  switch (status?.toLowerCase()) {
    case 'ongoing':
      return {
        label: 'Ongoing / Live Now',
        color: 'var(--color-success)',
        description: 'Exhibition is happening today. Visitors can walk in and explore stalls.'
      };
    case 'upcoming':
      return {
        label: 'Upcoming',
        color: 'var(--color-secondary-dark)',
        description: 'Scheduled for future dates. Registrations and applications are active.'
      };
    case 'closed':
    case 'completed':
      return {
        label: 'Closed / Concluded',
        color: '#78909C',
        description: 'Exhibition has finished.'
      };
    default:
      return {
        label: status || 'Upcoming',
        color: 'var(--color-secondary)',
        description: ''
      };
  }
};

/**
 * Format event date range (e.g. "15 Sep 2026" or "15 Sep - 18 Sep 2026")
 */
export const formatEventDates = (event) => {
  if (!event) return 'Date TBA';
  const startDate = event.startDate || event.date;
  const endDate = event.endDate;

  if (!startDate) return 'Date TBA';

  try {
    const startObj = new Date(startDate.includes('T') ? startDate : `${startDate}T00:00:00`);
    const startFormatted = startObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    if (!endDate || endDate === startDate) {
      return startFormatted;
    }

    const endObj = new Date(endDate.includes('T') ? endDate : `${endDate}T00:00:00`);
    const endFormatted = endObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return `${startFormatted} – ${endFormatted}`;
  } catch {
    return startDate;
  }
};

/**
 * Generates direct Google Maps URL for navigation & directions.
 * Uses event.mapUrl if explicitly provided, or auto-generates from location, city, state.
 */
export const getEventMapUrl = (event) => {
  if (!event) return 'https://www.google.com/maps';
  if (event.mapUrl && typeof event.mapUrl === 'string' && event.mapUrl.trim().startsWith('http')) {
    return event.mapUrl.trim();
  }

  const queryParts = [event.location, event.city, event.state, 'India'].filter(Boolean);
  const queryStr = queryParts.join(', ') || event.city || event.name || 'India';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`;
};

/**
 * Generates an iframe-embeddable OpenStreetMap / Google Maps URL for interactive map preview.
 */
export const getEventMapEmbedUrl = (event) => {
  if (!event) return '';
  const queryParts = [event.location, event.city, event.state].filter(Boolean);
  const queryStr = queryParts.join(', ') || event.city || event.name || '';
  if (!queryStr) return '';
  return `https://maps.google.com/maps?q=${encodeURIComponent(queryStr)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
};

