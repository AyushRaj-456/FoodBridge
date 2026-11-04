import { FileText, Lock, ShieldCheck } from 'lucide-react';

export default function InfoView({ type }) {
  if (type === 'privacy') {
    return (
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Lock size={20} color="var(--color-brand-700)" />
          <h1>Privacy, Retention &amp; Data Minimisation</h1>
        </div>
        <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
          FoodBridge strictly adheres to purpose limitation and minimal data collection under the ₹0
          Spark architecture.
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
            1. <strong>Location Privacy:</strong> Exact street pickup addresses and coordinator
            phone numbers are hidden until a claim transaction is server-confirmed.
          </p>
          <p>
            2. <strong>Zero Scans / Photos:</strong> No identity cards, PAN images, or beneficiary
            photographs are uploaded or stored on cloud infrastructure.
          </p>
          <p>
            3. <strong>Retention Schedule:</strong> Operational claim logs are retained only as long
            as necessary for pilot audit reconciliation and food safety traceability.
          </p>
        </div>
      </div>
    );
  }

  if (type === 'terms') {
    return (
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <ShieldCheck size={20} color="var(--color-brand-700)" />
          <h1>Community Terms of Service &amp; Good Samaritan Protection</h1>
        </div>
        <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
          Legal safeguards and food distribution responsibilities.
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
            1. <strong>Good Faith Redistribution:</strong> Surplus food is offered without monetary
            exchange to registered, verified welfare organizations.
          </p>
          <p>
            2. <strong>Inspection at Handover:</strong> Recipient organizations retain the full
            right of refusal if sensory or temperature inspection indicates compromised quality.
          </p>
          <p>
            3. <strong>Good Samaritan Standard:</strong> Food donors acting in good faith without
            reckless disregard for safety are protected under applicable food donation frameworks.
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
