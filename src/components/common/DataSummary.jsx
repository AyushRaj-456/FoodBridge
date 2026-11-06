import './common.css';

/**
 * Standardized Data Summary Component
 * Displays key operational metrics with label, value, unit, and optional note.
 */
export default function DataSummary({
  items = [], // Array of { label, value, unit, note, icon, variant }
  columns = 'repeat(auto-fit, minmax(200px, 1fr))',
  className = '',
}) {
  return (
    <div
      className={`data-summary-grid ${className}`.trim()}
      style={{
        display: 'grid',
        gridTemplateColumns: columns,
        gap: 'var(--space-4)',
      }}
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={item.label || idx} className="data-summary-card">
            <div className="data-summary-header">
              <span className="data-summary-label">{item.label}</span>
              {Icon && <span className="data-summary-icon">{Icon}</span>}
            </div>

            <div className="data-summary-value-row">
              <span className="data-summary-value">{item.value}</span>
              {item.unit && <span className="data-summary-unit">{item.unit}</span>}
            </div>

            {item.note && <div className="data-summary-note">{item.note}</div>}
          </div>
        );
      })}
    </div>
  );
}
