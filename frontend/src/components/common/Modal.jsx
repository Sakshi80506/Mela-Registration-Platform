import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal component.
 * Props:
 *   isOpen   {boolean}  — controls visibility
 *   onClose  {Function} — called when backdrop or X is clicked
 *   title    {string}   — modal header title
 *   maxWidth {string}   — max width (default '520px')
 *   children {node}     — modal body content
 */
const Modal = ({ isOpen, onClose, title, maxWidth = '520px', children }) => {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.15s ease'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: '100%',
          maxWidth,
          padding: '0',
          overflow: 'hidden',
          animation: 'slideUp 0.2s ease',
        }}
      >
        {/* Modal Header */}
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border-light)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', padding: '0.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = '#FFEBEE'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'none'; }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Modal;
