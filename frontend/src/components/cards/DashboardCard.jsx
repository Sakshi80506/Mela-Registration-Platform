import React from 'react';

const DashboardCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'var(--color-primary)', 
  bgColor = 'var(--color-bg-alt)',
  subtitle
}) => {
  return (
    <div className="metric-card">
      {Icon && (
        <div 
          className="metric-icon-box"
          style={{ backgroundColor: bgColor, color: color }}
        >
          <Icon size={26} />
        </div>
      )}
      <div className="metric-info">
        <span className="metric-label">{title}</span>
        <span className="metric-value">{value}</span>
        {subtitle && <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{subtitle}</span>}
      </div>
    </div>
  );
};

export default DashboardCard;
