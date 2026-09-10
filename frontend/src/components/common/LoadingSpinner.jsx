import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-box" role="status" aria-live="polite">
      <div className="spinner"></div>
      <p style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
