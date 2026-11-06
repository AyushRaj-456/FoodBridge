import { forwardRef } from 'react';
import './common.css';

/**
 * Reusable Design System Input Field
 * Features label above input, inline validation, and accessible ARIA attributes.
 */
const Input = forwardRef(function Input(
  {
    label,
    id,
    type = 'text',
    error,
    helperText,
    required = false,
    icon,
    disabled = false,
    className = '',
    ...props
  },
  ref
) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
  const errorId = inputId ? `${inputId}-error` : undefined;
  const helperId = inputId ? `${inputId}-helper` : undefined;

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          <span>
            {label} {required && <span className="required-indicator" aria-hidden="true">*</span>}
          </span>
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-muted)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`input-field ${error ? 'input-field-error' : ''}`}
          style={{
            paddingLeft: icon ? '38px' : undefined,
          }}
          {...props}
        />
      </div>

      {error ? (
        <div id={errorId} className="form-error-msg" role="alert">
          {error}
        </div>
      ) : helperText ? (
        <div id={helperId} className="form-helper-text">
          {helperText}
        </div>
      ) : null}
    </div>
  );
});

export default Input;

