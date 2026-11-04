import { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Building, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import { submitVerificationReview } from '../organisations/orgService.js';
import './admin.css';

export default function VerificationModal({ org, isOpen, onClose, onSuccess }) {
  const { user, isAdmin } = useAuth();

  const [checklist, setChecklist] = useState({
    legalRegistrationVerified: true,
    contactDetailsConfirmed: true,
    foodSafetyHandlingConfirmed: true,
    routeTierComplianceConfirmed: true,
    offlineInspectionVerified: true,
  });

  const [decision, setDecision] = useState('approved');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !org) return null;

  const handleChecklistToggle = (key) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isAdmin) {
      setError(
        'Action Denied: You must have an administrator account provisioned via the Firebase Console.'
      );
      return;
    }

    if (!user) {
      setError('You must be authenticated as an admin to record verification reviews.');
      return;
    }

    if (!reason || reason.trim().length < 10) {
      setError('Mandatory review reason must be at least 10 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await submitVerificationReview({
        orgId: org.id || org.orgId,
        reviewerUid: user.uid,
        checklist,
        decision,
        reason,
      });

      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit verification review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--color-surface)',
          padding: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ShieldCheck size={24} color="var(--color-brand-600)" />
              <h2 id="review-modal-title">Offline Verification Review Checklist</h2>
            </div>
            <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
              Record administrative verification decision under ₹0 Spark compliance.
            </p>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close modal"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            className="alert alert-error"
            style={{
              marginTop: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--font-size-label)',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Organisation Summary Header */}
        <div
          className="card"
          style={{
            marginTop: 'var(--space-3)',
            background: 'var(--color-canvas)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Building size={18} />
                <strong>{org.displayName}</strong>
                <span className={`badge badge-${org.status || 'pending'}`}>
                  {org.status || 'pending'}
                </span>
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-caption)',
                  color: 'var(--color-muted)',
                  marginTop: 'var(--space-1)',
                }}
              >
                Legal Name: {org.legalName} &bull; Type: <strong>{org.type}</strong>
              </div>
            </div>
            <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}>
              Ref: {org.id || org.orgId}
            </div>
          </div>

          <div
            style={{
              marginTop: 'var(--space-2)',
              fontSize: 'var(--font-size-label)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-2)',
            }}
          >
            <div>
              <span className="text-muted">Registration / License:</span>{' '}
              <strong>{org.regNumber || 'Not provided'}</strong>
            </div>
            <div>
              <span className="text-muted">Coordinator:</span>{' '}
              <strong>{org.contactPerson || 'N/A'}</strong>
            </div>
            <div>
              <span className="text-muted">Phone:</span> <code>{org.contactPhone || 'N/A'}</code>
            </div>
            <div>
              <span className="text-muted">Email:</span> {org.contactEmail || 'N/A'}
            </div>
            <div>
              <span className="text-muted">Capacity:</span> {org.capacity || 'N/A'}
            </div>
            <div>
              <span className="text-muted">Address:</span> {org.addressText}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-4)' }}>
          {/* Step-by-Step Offline Inspection Checklist */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
              Physical & Offline Inspection Checklist
            </h3>
            <p className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
              Verify every item against external registries or phone interviews. FoodBridge stores
              zero uploaded scans.
            </p>

            <div className="checklist-card">
              <label className="checklist-item" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={checklist.legalRegistrationVerified}
                  onChange={() => handleChecklistToggle('legalRegistrationVerified')}
                />
                <div>
                  <div className="checklist-label">
                    1. Official Entity Registration Verified Offline
                  </div>
                  <div className="checklist-desc">
                    Verified registration against government portal (FSSAI / NGO Darpan / MCA /
                    Trust Registry / Panchayat).
                  </div>
                </div>
              </label>

              <label className="checklist-item" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={checklist.contactDetailsConfirmed}
                  onChange={() => handleChecklistToggle('contactDetailsConfirmed')}
                />
                <div>
                  <div className="checklist-label">2. Primary Coordinator Authenticated</div>
                  <div className="checklist-desc">
                    Contact coordinator confirmed via official phone call or institutional email
                    address.
                  </div>
                </div>
              </label>

              <label className="checklist-item" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={checklist.foodSafetyHandlingConfirmed}
                  onChange={() => handleChecklistToggle('foodSafetyHandlingConfirmed')}
                />
                <div>
                  <div className="checklist-label">3. Safe Food Handling & Storage Capacity</div>
                  <div className="checklist-desc">
                    Recipient has clean transport containers, adequate holding space, and immediate
                    distribution capacity.
                  </div>
                </div>
              </label>

              <label className="checklist-item" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={checklist.routeTierComplianceConfirmed}
                  onChange={() => handleChecklistToggle('routeTierComplianceConfirmed')}
                />
                <div>
                  <div className="checklist-label">4. Route Tier Suitability Confirmed</div>
                  <div className="checklist-desc">
                    Confirmed eligibility for human consumption (NGO), animal feed SOP (farm), or
                    compost protocol (facility).
                  </div>
                </div>
              </label>

              <label className="checklist-item" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={checklist.offlineInspectionVerified}
                  onChange={() => handleChecklistToggle('offlineInspectionVerified')}
                />
                <div>
                  <div className="checklist-label">
                    5. Strict Zero-Cost ₹0 Architecture Invariant
                  </div>
                  <div className="checklist-desc">
                    Confirmation that no digital document scans or photos are stored in Firestore
                    under Spark plan.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Verification Decision */}
          <div style={{ marginTop: 'var(--space-4)' }}>
            <label className="input-label" style={{ fontWeight: 600 }}>
              Verification Decision *
            </label>
            <div className="decision-group">
              <button
                type="button"
                className={`decision-btn approve ${decision === 'approved' ? 'selected' : ''}`}
                onClick={() => setDecision('approved')}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-1)',
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>Approve Organisation</span>
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-caption)',
                    fontWeight: 400,
                    marginTop: '2px',
                  }}
                >
                  Enables surplus listings & recipient claims
                </div>
              </button>

              <button
                type="button"
                className={`decision-btn suspend ${decision === 'suspended' ? 'selected' : ''}`}
                onClick={() => setDecision('suspended')}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-1)',
                  }}
                >
                  <XCircle size={18} />
                  <span>Suspend / Reject Application</span>
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-caption)',
                    fontWeight: 400,
                    marginTop: '2px',
                  }}
                >
                  Blocks claiming and listing privileges
                </div>
              </button>
            </div>
          </div>

          {/* Mandatory Reason / Audit Notes */}
          <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
            <label htmlFor="review-reason" className="input-label" style={{ fontWeight: 600 }}>
              Audit Inspection Reason & Notes * (Minimum 10 characters)
            </label>
            <textarea
              id="review-reason"
              className="input-field"
              rows={3}
              placeholder="e.g. Verified FSSAI certificate online and called mess coordinator. Clean dry storage and immediate dining hall distribution confirmed."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {/* Reviewer Information */}
          <div
            style={{
              marginTop: 'var(--space-3)',
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <Clock size={14} />
            <span>
              Reviewer UID: <code>{user?.uid || 'Unknown'}</code> &bull; Timestamp will be logged as
              server time in <code>verificationReviews</code>.
            </span>
          </div>

          {/* Actions */}
          <div
            style={{
              marginTop: 'var(--space-5)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${decision === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
              disabled={loading || reason.trim().length < 10}
              style={
                decision === 'suspended'
                  ? { borderColor: 'var(--color-error)', color: 'var(--color-error)' }
                  : {}
              }
            >
              {loading ? 'Recording Review...' : 'Record Verification Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
