import { CheckCircle2, Clock, AlertTriangle, XCircle, Ban } from 'lucide-react';

const STATUS_CONFIGS = {
  submitted: {
    label: 'Application Submitted',
    badgeClass: 'badge-neutral',
    icon: Clock,
    color: 'var(--color-muted)',
    description:
      'Your application has been received and queued for administrative compliance review.',
  },
  under_review: {
    label: 'Under Review',
    badgeClass: 'badge-info',
    icon: Clock,
    color: 'var(--color-info)',
    description:
      'A platform compliance officer is currently verifying your institutional credentials and offline registry.',
  },
  additional_info_required: {
    label: 'Additional Information Required',
    badgeClass: 'badge-warning',
    icon: AlertTriangle,
    color: 'var(--color-warning)',
    description:
      'Please provide updated registration numbers or contact details requested by the reviewing officer.',
  },
  approved: {
    label: 'Verified & Approved',
    badgeClass: 'badge-verified',
    icon: CheckCircle2,
    color: 'var(--color-verified)',
    description:
      'Congratulations! Your organization is fully accredited. You may now discover and claim surplus listings.',
  },
  rejected: {
    label: 'Application Rejected',
    badgeClass: 'badge-danger',
    icon: XCircle,
    color: 'var(--color-danger)',
    description:
      'The application did not satisfy statutory FSSAI compliance or registration eligibility criteria.',
  },
  suspended: {
    label: 'Account Suspended',
    badgeClass: 'badge-danger',
    icon: Ban,
    color: 'var(--color-danger)',
    description:
      'This organization account is temporarily suspended due to a food safety incident or verification audit.',
  },
};

export default function ApplicationStatusCard({
  status = 'submitted',
  orgName = 'City Care Welfare Trust',
  regNumber = 'MH/2021/0284912',
  submittedAt = 'Nov 04, 2026',
  reviewerNotes = null,
  onRefresh,
}) {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.submitted;
  const Icon = config.icon;

  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-6)',
        borderLeft: `4px solid ${config.color}`,
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-1)',
            }}
          >
            <span className={`badge ${config.badgeClass}`} style={{ fontSize: '12px' }}>
              <Icon size={14} />
              {config.label}
            </span>
            <span className="text-muted" style={{ fontSize: '11px' }}>
              Submitted on {submittedAt}
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', margin: 'var(--space-1) 0' }}>{orgName}</h3>
          <div className="text-muted" style={{ fontSize: 'var(--font-size-label)' }}>
            Registration ID: <strong>{regNumber}</strong>
          </div>
        </div>

        {onRefresh && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onRefresh}>
            Refresh Status
          </button>
        )}
      </div>

      <p
        className="text-muted"
        style={{ fontSize: 'var(--font-size-body)', margin: 'var(--space-3) 0 0', lineHeight: 1.5 }}
      >
        {config.description}
      </p>

      {reviewerNotes && (
        <div
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-canvas)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: 'var(--font-size-label)',
          }}
        >
          <strong>Reviewer Note:</strong> {reviewerNotes}
        </div>
      )}
    </div>
  );
}
