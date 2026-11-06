import './common.css';

/**
 * Standardized Page Header Component
 * Conforms to Section 4 & 7 of FoodBridge Specification.
 * Ensures consistent 28–32px page title, subtitle, and primary action slot.
 */
export default function PageHeader({
  title,
  subtitle,
  action,
  badge,
  breadcrumbs,
  className = '',
}) {
  return (
    <div className={`page-header-wrapper ${className}`.trim()}>
      {breadcrumbs && <nav className="page-header-breadcrumbs" aria-label="Breadcrumb">{breadcrumbs}</nav>}

      <div className="page-header-main">
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h1 className="page-header-title">{title}</h1>
            {badge && <span className="page-header-badge">{badge}</span>}
          </div>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>

        {action && <div className="page-header-action">{action}</div>}
      </div>
    </div>
  );
}
