import { forwardRef } from 'react';
import './common.css';

/**
 * Reusable Design System Select Field
 */
const Select = forwardRef(function Select(
  {
    label,
    id,
    options = [],
    error,
    helperText,
    required = false,
    disabled = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
  const errorId = selectId ? `${selectId}-error` : undefined;
  const helperId = selectId ? `${selectId}-helper` : undefined;

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          <span>
            {label} {required && <span className="required-indicator" aria-hidden="true">*</span>}
          </span>
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`select-field ${error ? 'input-field-error' : ''}`}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
      </select>

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

export default Select;
