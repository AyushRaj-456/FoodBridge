import './common.css';

export default function Tabs({ tabs, activeTab, onChange, ariaLabel = 'Navigation Tabs' }) {
  return (
    <div className="tab-nav" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {Icon && <Icon size={16} aria-hidden="true" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={`badge ${isActive ? 'badge-verified' : 'badge-neutral'}`}
                style={{ fontSize: '11px', padding: '1px 6px' }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
