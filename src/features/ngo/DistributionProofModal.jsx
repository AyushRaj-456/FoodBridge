import { useState } from 'react';
import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import Modal from '../../components/common/Modal.jsx';

export default function DistributionProofModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    batchId: 'opp-201',
    peopleServed: '55',
    distributionDate: new Date().toISOString().split('T')[0],
    programName: 'Community Evening Dinner Drive',
    feedbackNotes:
      'All 55 meals served warm. Zero leftovers or complaints. Insulated boxes maintained ~62°C.',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      role="dialog"
      aria-modal="true"
      title="Submit Distribution Proof &amp; Impact Log"
      subtitle="Record verified beneficiary distribution to finalize collection accounting and audit trails."
      maxWidth="560px"
      footer={
        submitted ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleSubmit}>
              <Award size={14} />
              <span>Submit Verified Log</span>
            </button>
          </div>
        )
      }
    >
      {submitted ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
          <CheckCircle2
            size={44}
            color="var(--color-success)"
            style={{ margin: '0 auto var(--space-2)' }}
          />
          <h3 style={{ margin: '0 0 var(--space-1)', fontSize: '1.2rem' }}>
            Distribution Proof Logged
          </h3>
          <p
            className="text-muted"
            style={{ fontSize: 'var(--font-size-body)', maxWidth: '420px', margin: '0 auto' }}
          >
            Impact ledger updated: <strong>{formData.peopleServed} individuals served</strong> on{' '}
            {formData.distributionDate}. Thank you for nourishing the community!
          </p>
          <div
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-canvas)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: '12px',
              textAlign: 'left',
            }}
          >
            <div>
              <strong>Batch Reference:</strong> {formData.batchId}
            </div>
            <div style={{ marginTop: '2px' }}>
              <strong>Status:</strong>{' '}
              <span className="badge badge-verified">Verified Complete</span>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Beneficiary Privacy Notice */}
          <div
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-brand-100)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              gap: 'var(--space-2)',
              fontSize: '12px',
              color: 'var(--color-brand-900)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Beneficiary Privacy Guarantee:</strong> FoodBridge protects the dignity of all
              recipients. Never photograph recipient faces or collect individual identity documents.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="dist-people">
                Number of People Served
              </label>
              <input
                id="dist-people"
                type="number"
                min="1"
                required
                className="input-field"
                value={formData.peopleServed}
                onChange={(e) => setFormData({ ...formData, peopleServed: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dist-date">
                Distribution Date
              </label>
              <input
                id="dist-date"
                type="date"
                required
                className="input-field"
                value={formData.distributionDate}
                onChange={(e) => setFormData({ ...formData, distributionDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dist-program">
              Program / Distribution Center
            </label>
            <input
              id="dist-program"
              type="text"
              required
              className="input-field"
              value={formData.programName}
              onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dist-feedback">
              Operational Observations &amp; Temperature Verification
            </label>
            <textarea
              id="dist-feedback"
              className="textarea-field"
              value={formData.feedbackNotes}
              onChange={(e) => setFormData({ ...formData, feedbackNotes: e.target.value })}
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
