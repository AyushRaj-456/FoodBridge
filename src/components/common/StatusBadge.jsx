const STATUS_STYLES = {
  // Listings
  draft: { label: 'Draft', className: 'badge-neutral' },
  published: { label: 'Published', className: 'badge-success' },
  claimed: { label: 'Claimed', className: 'badge-warning' },
  handover_pending: { label: 'Handover Pending', className: 'badge-warning' },
  completed: { label: 'Completed', className: 'badge-success' },
  withdrawn: { label: 'Withdrawn', className: 'badge-neutral' },
  expired: { label: 'Expired', className: 'badge-danger' },
  cancelled: { label: 'Cancelled', className: 'badge-danger' },
  disputed: { label: 'Disputed', className: 'badge-danger' },

  // Organisations & Accounts
  pending: { label: 'Pending Review', className: 'badge-warning' },
  approved: { label: 'Approved', className: 'badge-success' },
  active: { label: 'Active', className: 'badge-success' },
  suspended: { label: 'Suspended', className: 'badge-danger' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_STYLES[status] || {
    label: status ? String(status).replace('_', ' ') : 'Unknown',
    className: 'badge-neutral',
  };

  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
