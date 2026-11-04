import { FileText, Lock } from 'lucide-react';

export default function InfoView({ type }) {
  if (type === 'privacy') {
    return (
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Lock size={20} color="var(--color-brand-700)" />
          <h1>Privacy, Retention & Data Minimisation</h1>
        </div>
        <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
          FoodBridge strictly adheres to purpose limitation and minimal data collection.
        </p>

        <div
          style={{
            marginTop: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <p>
            1. <strong>Location Privacy:</strong> Exact pickup addresses and coordinator contact
            numbers are hidden until a claim transaction succeeds.
          </p>
          <p>
            2. <strong>Zero Scans / Photos:</strong> No identity cards, PAN images, or beneficiary
            photos are stored on cloud infrastructure.
          </p>
          <p>
            3. <strong>Retention Schedule:</strong> Operational claim logs are retained only as long
            as necessary for the pilot and reconciliation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <FileText size={20} color="var(--color-brand-700)" />
        <h1>Pilot Standard Operating Procedure (SOP)</h1>
      </div>
      <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
        Food safety oversight is required before surplus food is offered or consumed.
      </p>

      <div
        style={{
          marginTop: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <p>
          1. <strong>Human Consumption SOP:</strong> Prepared food must be stored at safe
          temperatures and consumed within the verified deadline.
        </p>
        <p>
          2. <strong>Animal Feed / Compost:</strong> Gated routes remain disabled until
          institutional approvals are verified.
        </p>
        <p>
          3. <strong>Direct Collection:</strong> Recipients inspect food condition at handover and
          retain the right of refusal.
        </p>
      </div>
    </div>
  );
}
