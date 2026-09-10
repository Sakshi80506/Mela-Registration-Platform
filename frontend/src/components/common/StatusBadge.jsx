import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status, className = '' }) => {
  const normStatus = (status || 'pending').toLowerCase();

  const getIcon = () => {
    switch (normStatus) {
      case 'approved':
      case 'upcoming':
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

  return (
    <span className={`status-badge ${normStatus} ${className}`}>
      {getIcon()}
      {normStatus}
    </span>
  );
};

export default StatusBadge;
