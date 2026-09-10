import React from 'react';
import { Filter } from 'lucide-react';

const FilterBar = ({
  options = [],
  activeValue,
  onSelect,
  label = 'Filter by:'
}) => {
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
        margin: '1rem 0'
      }}
    >
      {label && (
        <span style={{ 
          fontSize: '0.85rem', 
          fontWeight: 600, 
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <Filter size={14} />
          {label}
        </span>
      )}
      {options.map((opt) => {
        const isSelected = activeValue === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.9rem',
              fontSize: '0.82rem',
              transition: 'all 0.15s ease'
            }}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span 
                style={{
                  marginLeft: '0.4rem',
                  fontSize: '0.75rem',
                  opacity: isSelected ? 0.9 : 0.6
                }}
              >
                ({opt.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FilterBar;
