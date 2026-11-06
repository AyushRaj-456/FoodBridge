import { forwardRef } from 'react';
import './common.css';

/**
 * Reusable Design System Textarea Field
 */
const Textarea = forwardRef(function Textarea(
  {
    label,
    id,
    error,
    helperText,
    required = false,
    rows = 4,
    maxLength,
    disabled = false,
    className = '',
    value,
    ...props
  },
  ref
) {
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
  const errorId = textareaId ? `${textareaId}-error` : undefined;
  const helperId = textareaId ? `${textareaId}-helper` : undefined;

  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`form-group ${className}`.trim()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && (
          <label htmlFor={textareaId} className="form-label">
            <span>
              {label} {required && <span className="required-indicator" aria-hidden="true">*</span>}
            </span>
          </label>
        )}
        {maxLength && (
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        value={value}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`textarea-field ${error ? 'input-field-error' : ''}`}
        {...props}
      />

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

export default Textarea;

