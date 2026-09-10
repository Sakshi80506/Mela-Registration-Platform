import React from 'react';

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
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          className={`form-control ${error ? 'error' : ''}`}
          {...rest}
        />
      )}

      {error && <span className="form-error">{error}</span>}
      {!error && helpText && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{helpText}</span>}
    </div>
  );
};

export default FormInput;
