import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar, Radio, Lock } from 'lucide-react';

const StatusBadge = ({ status, className = '', customLabel = null }) => {
  const normStatus = (status || 'pending').toLowerCase();

  const getIcon = () => {
    switch (normStatus) {
      case 'ongoing':
      case 'live':
        return null; // CSS pulse dot is rendered before text
      case 'upcoming':
        return <Calendar size={13} />;
      case 'closed':
        return <Lock size={13} />;
      case 'approved':
      case 'active':
        return <CheckCircle2 size={13} />;
      case 'rejected':
      case 'cancelled':
        return <XCircle size={13} />;
      case 'pending':
        return <Clock size={13} />;
      case 'completed':
        return <CheckCircle2 size={13} />;
      default:
        return <AlertCircle size={13} />;
    }
  };

  const getDisplayLabel = () => {
    if (customLabel) return customLabel;
    if (normStatus === 'ongoing') return 'Ongoing';
    if (normStatus === 'upcoming') return 'Upcoming';
    if (normStatus === 'closed') return 'Closed';
    return normStatus;
  };

  return (
    <span className={`status-badge ${normStatus} ${className}`}>
      {getIcon()}
      {getDisplayLabel()}
    </span>
  );
};

export default StatusBadge;
