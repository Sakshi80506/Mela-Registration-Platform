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
      className="modal-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card modal-dialog-card"
        style={{
          width: '100%',
          maxWidth,
          maxHeight: 'min(90vh, calc(100dvh - 2rem))',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          animation: 'slideUp 0.2s ease',
          background: 'var(--color-surface)',
        }}
      >
        {/* Modal Header */}
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border-light)',
            flexShrink: 0,
            background: 'var(--color-surface)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', cursor: 'pointer',
                color: 'var(--color-text-muted)', padding: '0.35rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.borderColor = 'var(--color-danger)'; e.currentTarget.style.background = '#FFEBEE'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-alt)'; }}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Modal Body with internal scroll */}
        <div style={{
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          flex: 1,
          WebkitOverflowScrolling: 'touch',
        }}>
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

