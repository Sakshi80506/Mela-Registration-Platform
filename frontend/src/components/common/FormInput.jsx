import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormInput = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  rows = 3,
  options = [],
  className = '',
  disabled = false,
  min,
  max,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          disabled={disabled}
          className={`form-control ${error ? 'error' : ''}`}
          {...rest}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`form-control ${error ? 'error' : ''}`}
          {...rest}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            id={id}
            type={inputType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            className={`form-control ${error ? 'error' : ''}`}
            style={isPassword ? { paddingRight: '2.5rem' } : undefined}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={showPassword ? 'Hide password' : 'View password'}
              aria-label={showPassword ? 'Hide password' : 'View password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      )}

      {error && <span className="form-error">{error}</span>}
      {!error && helpText && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{helpText}</span>}
    </div>
  );
};

export default FormInput;
