import { forwardRef } from 'react';
import './common.css';

/**
 * Reusable Design System Button
 * Conforms to Section 4 & 14 of FoodBridge Specification.
 */
const Button = forwardRef(function Button(
  {
    children,
    type = 'button',
    variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'quiet' | 'danger'
    size = 'md', // 'sm' | 'md' | 'lg'
    icon,
    iconPosition = 'left',
    isLoading = false,
    disabled = false,
    className = '',
    onClick,
    ...props
  },
  ref
) {
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
        ? 'btn-secondary'
        : variant === 'outline'
          ? 'btn-outline-primary'
          : variant === 'quiet'
            ? 'btn-quiet'
            : variant === 'danger'
              ? 'btn-danger'
              : 'btn-primary';

  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? 'true' : undefined}
      onClick={onClick}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <span
          className="loading-spinner-inline"
          style={{
            width: '15px',
            height: '15px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.6s linear infinite',
            marginRight: children ? '6px' : 0,
          }}
          aria-hidden="true"
        />
      ) : (
        icon && iconPosition === 'left' && <span className="btn-icon-slot">{icon}</span>
      )}

      {children && <span>{children}</span>}

      {!isLoading && icon && iconPosition === 'right' && (
        <span className="btn-icon-slot">{icon}</span>
      )}
    </button>
  );
});

export default Button;
