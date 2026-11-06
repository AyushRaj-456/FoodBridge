import './common.css';

/**
 * Standardized Section Header Component
 * Heading: 20–24px, subtle subtitle, optional secondary action.
 */
export default function SectionHeader({
  title,
  subtitle,
  action,
  kicker,
  className = '',
}) {
  return (
    <div className={`section-header-wrapper ${className}`.trim()}>
      <div className="section-header-text">
        {kicker && <div className="section-header-kicker">{kicker}</div>}
        <h2 className="section-header-title">{title}</h2>
        {subtitle && <p className="section-header-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="section-header-action">{action}</div>}
    </div>
  );
}

