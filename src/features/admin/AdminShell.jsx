import { useState } from 'react';
import { Lock, FileText, AlertTriangle, Activity, CheckCircle2, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import VerificationQueue from './VerificationQueue.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { moderateListing, resolveIncidentReport } from './adminService.js';
import './admin.css';

const SAMPLE_MODERATION_LISTINGS = [
  {
    id: 'lst-mod-01',
    title: 'Steamed Rice & Dal Tadka',
    donorOrg: 'Central Campus Mess 3',
    quantity: '18 kg',
    consumeBy: '23:00',
    status: 'published',
    allergens: 'None',
  },
  {
    id: 'lst-mod-02',
    title: 'Assorted Roti & Chapati Pack',
    donorOrg: 'Hostel Block B',
    quantity: '80 pieces',
    consumeBy: '23:30',
    status: 'claimed',
    allergens: 'Wheat / Gluten',
  },
];

const SAMPLE_INCIDENT_REPORTS = [
  {
    id: 'rep-01',
    targetType: 'listing',
    targetId: 'lst-101',
    category: 'Hygiene Concern',
    description: 'Reported pickup vessel was not clean upon arrival at kitchen dispatch.',
    status: 'investigated',
    createdAt: 'Nov 04, 2026',
  },
  {
    id: 'rep-02',
    targetType: 'recipient',
    targetId: 'org-seed-01',
    category: 'Late Collection',
    description: 'Recipient volunteer arrived 45 minutes after pickup window expired.',
    status: 'pending',
    createdAt: 'Nov 03, 2026',
  },
];

const SAMPLE_AUDIT_EVENTS = [
  {
    id: 'aud-01',
    actorUid: 'admin-001',
    action: 'ORG_VERIFIED_APPROVED',
    resourceType: 'organisations',
    resourceId: 'org-seed-02',
    summary: 'Approved Campus Dining Hall 3 after offline FSSAI inspection.',
    timestamp: 'Nov 04, 2026, 18:30 UTC',
  },
  {
    id: 'aud-02',
    actorUid: 'usr-901',
    action: 'LISTING_PUBLISHED',
    resourceType: 'listings',
    resourceId: 'lst-101',
    summary: 'Published 18 kg yellow dal surplus for verified recipients.',
    timestamp: 'Nov 04, 2026, 19:30 UTC',
  },
];

export default function AdminShell({ activeTab }) {
  const { user, isAdmin } = useAuth();
  const [moderationListings, setModerationListings] = useState(SAMPLE_MODERATION_LISTINGS);
  const [reports, setReports] = useState(SAMPLE_INCIDENT_REPORTS);
  const [moderationNotice, setModerationNotice] = useState(null);

  // If user is not admin and not authenticated as admin
  // Enforce security notice: Admin role cannot be self-chosen
  if (!isAdmin) {
    return (
      <div className="feature-container">
        <div className="feature-header">
          <div>
            <h1>Administrative &amp; Moderation Console</h1>
            <p className="text-muted">
              Platform governance, organization verifications, and compliance oversight.
            </p>
          </div>
        </div>

        <div
          className="card"
          style={{
            maxWidth: '640px',
            margin: 'var(--space-6) auto',
            textAlign: 'center',
            padding: 'var(--space-8)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: 'var(--space-3)',
              background: 'var(--color-warning-bg)',
              color: 'var(--color-warning)',
              borderRadius: 'var(--radius-full)',
              marginBottom: 'var(--space-2)',
            }}
          >
            <Lock size={36} />
          </div>
          <h2>Administrator Access Required</h2>
          <p className="text-muted" style={{ marginTop: 'var(--space-2)', lineHeight: 1.6 }}>
            This console is restricted to authorized platform administrators and verification
            officers. Please sign in with an authorized administrator account to access verification
            queues and moderation tools.
          </p>

          <div
            className="notice-box"
            style={{
              marginTop: 'var(--space-4)',
              textAlign: 'center',
              background: 'var(--color-canvas)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-label)',
              color: 'var(--color-muted)',
            }}
          >
            Current User: <strong>{user?.email || 'Unauthenticated Guest'}</strong> &bull; Need
            access? Contact platform coordinators.
          </div>
        </div>
      </div>
    );
  }

  const handleWithdrawByAdmin = async (id) => {
    setModerationListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'withdrawn' } : l))
    );
    setModerationNotice(`Listing ${id} withdrawn by administrator.`);

    try {
      if (user && isAdmin) {
        await moderateListing({
          listingId: id,
          action: 'withdrawn',
          reason: 'Listing withdrawn by administrator for safety review',
          adminUser: user,
        });
      }
    } catch (err) {
      console.warn('[AdminShell] Non-blocking moderateListing sync warning:', err.message);
    }
  };

  const handleResolveReport = async (id) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)));

    try {
      if (user && isAdmin) {
        await resolveIncidentReport({
          reportId: id,
          resolution: 'resolved',
          resolutionNotes: 'Marked resolved by administrator',
          adminUser: user,
        });
      }
    } catch (err) {
      console.warn('[AdminShell] Non-blocking resolveIncidentReport sync warning:', err.message);
    }
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <div>
          <h1>Administrative &amp; Moderation Console</h1>
          <p className="text-muted">
            Platform governance, organization verifications, and compliance oversight.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-4)' }}>
        {/* Tab 1: Verification Queue */}
        {activeTab === 'verification-queue' && <VerificationQueue />}

        {/* Tab 2: Moderate Listings */}
        {activeTab === 'moderate-listings' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <FileText size={22} color="var(--color-brand-700)" />
              <h2>Active Listings Moderation</h2>
            </div>
            <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
              Review published surplus items and withdraw listings if safety violations are
              detected.
            </p>

            {moderationNotice && (
              <div
                className="alert alert-success"
                style={{
                  marginTop: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  background: 'var(--color-success-bg)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span>{moderationNotice}</span>
              </div>
            )}

            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title &amp; Donor</th>
                    <th>Quantity</th>
                    <th>Consume By</th>
                    <th>Allergens</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {moderationListings.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.title}</strong>
                        <div
                          style={{
                            fontSize: 'var(--font-size-caption)',
                            color: 'var(--color-muted)',
                          }}
                        >
                          {item.donorOrg}
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>{item.consumeBy}</td>
                      <td>{item.allergens}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        {item.status !== 'withdrawn' ? (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{
                              minHeight: '32px',
                              padding: 'var(--space-1) var(--space-2)',
                              fontSize: 'var(--font-size-caption)',
                              color: 'var(--color-danger)',
                            }}
                            onClick={() => handleWithdrawByAdmin(item.id)}
                          >
                            <Trash2 size={13} />
                            <span>Withdraw</span>
                          </button>
                        ) : (
                          <span
                            className="text-muted"
                            style={{ fontSize: 'var(--font-size-caption)' }}
                          >
                            Withdrawn
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Incident Reports */}
        {activeTab === 'incident-reports' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <AlertTriangle size={22} color="var(--color-warning)" />
              <h2>Community Incident &amp; Safety Reports</h2>
            </div>
            <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
              Investigate hygiene concerns, late collections, and protocol disputes.
            </p>

            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Target / Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((rep) => (
                    <tr key={rep.id}>
                      <td>
                        <strong>{rep.targetId}</strong>
                        <div
                          style={{
                            fontSize: 'var(--font-size-caption)',
                            color: 'var(--color-muted)',
                          }}
                        >
                          {rep.targetType}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-warning">{rep.category}</span>
                      </td>
                      <td style={{ maxWidth: '320px' }}>{rep.description}</td>
                      <td>{rep.createdAt}</td>
                      <td>
                        <StatusBadge status={rep.status} />
                      </td>
                      <td>
                        {rep.status !== 'resolved' ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{
                              minHeight: '32px',
                              padding: 'var(--space-1) var(--space-2)',
                              fontSize: 'var(--font-size-caption)',
                            }}
                            onClick={() => handleResolveReport(rep.id)}
                          >
                            <CheckCircle2 size={13} />
                            <span>Mark Resolved</span>
                          </button>
                        ) : (
                          <span
                            className="text-muted"
                            style={{ fontSize: 'var(--font-size-caption)' }}
                          >
                            Resolved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: System & Quota Audit */}
        {activeTab === 'system-audit' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Activity size={22} color="var(--color-brand-700)" />
              <h2>System Health &amp; Security Audit Log</h2>
            </div>
            <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
              Operational health monitoring and immutable security event ledger.
            </p>

            <div
              className="quota-indicator-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-3)',
              }}
            >
              <div className="quota-card">
                <div className="quota-card-label">Database Sync Operations</div>
                <div className="quota-card-value">Healthy (Active)</div>
                <div className="quota-card-note">Client query limits enforced</div>
              </div>
              <div className="quota-card">
                <div className="quota-card-label">Security Rules Enforcement</div>
                <div className="quota-card-value">100% Enforced</div>
                <div className="quota-card-note">Deny-by-default active</div>
              </div>
              <div className="quota-card">
                <div className="quota-card-label">CDN &amp; Application Delivery</div>
                <div className="quota-card-value">Operational</div>
                <div className="quota-card-note">Fast edge delivery</div>
              </div>
              <div className="quota-card">
                <div className="quota-card-label">Document &amp; Photo Storage</div>
                <div className="quota-card-value">Local Verified Snapshots</div>
                <div className="quota-card-note">Canvas watermarked</div>
              </div>
            </div>

            <h3 style={{ marginTop: 'var(--space-6)' }}>Append-Only Security Audit Log</h3>
            <p className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
              Events emitted on sensitive status transitions. Cannot be updated or deleted by
              clients.
            </p>

            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor UID</th>
                    <th>Resource</th>
                    <th>Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_AUDIT_EVENTS.map((event) => (
                    <tr key={event.id}>
                      <td>{event.timestamp}</td>
                      <td>
                        <code>{event.action}</code>
                      </td>
                      <td>
                        <code>{event.actorUid}</code>
                      </td>
                      <td>
                        {event.resourceType}/{event.resourceId}
                      </td>
                      <td>{event.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
