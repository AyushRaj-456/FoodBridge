import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  FileText,
  AlertTriangle,
  Thermometer,
  Eye,
} from 'lucide-react';
import { ROUTE_STATES, APPROVED_PILOT_SOP } from './routingService.js';

/**
 * RouteAuditCard — Displays Zero-Waste Routing Governance & SOP Traceability
 *
 * Invariants:
 * 1. Humans First -> Animals Second -> Soil Third (No automatic cascade).
 * 2. Tier 1 Human Route requires approved written pilot SOP.
 * 3. Tier 2 Animal Feed & Tier 3 Compost remain disabled in MVP.
 * 4. Never infer animal suitability from human food rejection.
 * 5. Traceable audit fields for all decisions.
 */
export default function RouteAuditCard({ listing }) {
  if (!listing) return null;

  const sop = listing.sopVerification;
  const isHumanApproved =
    listing.routeStatus === ROUTE_STATES.HUMAN_ROUTE_APPROVED ||
    (sop?.sopApproved && sop?.holdingTempCompliant && sop?.sensoryInspectionPassed);

  const isBlocked = listing.routeStatus === ROUTE_STATES.BLOCKED;

  return (
    <div
      className="card"
      style={{
        marginTop: 'var(--space-4)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        padding: 'var(--space-4)',
      }}
      data-testid="route-audit-card"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: 'var(--font-size-caption)',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-brand-700)',
              }}
            >
              Zero-Waste Routing Hierarchy
            </span>
          </div>
          <h3 style={{ margin: 'var(--space-1) 0 0 0', fontSize: '1.1rem' }}>
            Routing Governance: Humans First &rarr; Animals Second &rarr; Soil Third
          </h3>
          <p
            className="text-muted"
            style={{ fontSize: 'var(--font-size-caption)', marginTop: '2px' }}
          >
            Non-cascading safety hierarchy under FSSAI Surplus Food Regulations (2019).
          </p>
        </div>

        <div>
          {isHumanApproved ? (
            <span
              className="badge badge-success"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ShieldCheck size={14} />
              <span>Human Route Approved</span>
            </span>
          ) : isBlocked ? (
            <span
              className="badge badge-danger"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ShieldAlert size={14} />
              <span>Route Blocked</span>
            </span>
          ) : (
            <span
              className="badge badge-neutral"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <AlertTriangle size={14} />
              <span>Unassessed / Pending SOP</span>
            </span>
          )}
        </div>
      </div>

      {/* Tier 1 Human Route Audit Section */}
      <div
        style={{
          marginTop: 'var(--space-3)',
          padding: 'var(--space-3)',
          background: isHumanApproved ? 'var(--color-success-bg)' : 'var(--color-canvas)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          fontSize: 'var(--font-size-label)',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 600 }}
        >
          <FileText size={16} color="var(--color-brand-700)" />
          <span>Tier 1: Human Consumption Route (Active Pilot)</span>
        </div>

        {isHumanApproved ? (
          <div
            style={{
              marginTop: 'var(--space-2)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-2)',
              fontSize: 'var(--font-size-caption)',
            }}
          >
            <div>
              <span className="text-muted">Approved Written SOP:</span>
              <br />
              <strong>{sop?.sopRef || APPROVED_PILOT_SOP.REF}</strong> (v
              {sop?.sopVersion || APPROVED_PILOT_SOP.VERSION})
            </div>
            <div>
              <span className="text-muted">Thermal Holding Check:</span>
              <br />
              <span
                style={{
                  color: 'var(--color-success)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Thermometer size={13} />
                <span>Compliant (&gt;60&deg;C / &lt;4&deg;C)</span>
              </span>
            </div>
            <div>
              <span className="text-muted">Sensory Hygiene Check:</span>
              <br />
              <span
                style={{
                  color: 'var(--color-success)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Eye size={13} />
                <span>Passed (Odor &amp; Visual)</span>
              </span>
            </div>
            <div>
              <span className="text-muted">Verified Assessor:</span>
              <br />
              <code>{sop?.assessedBy || 'Mess Safety Officer'}</code>
            </div>
          </div>
        ) : (
          <div
            style={{
              marginTop: 'var(--space-2)',
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-danger)',
            }}
          >
            {listing.rejectionReason ||
              'Human route locked: Surplus has not completed offline food-safety inspection under written SOP.'}
          </div>
        )}

        {sop?.safetyNotes && (
          <div
            style={{
              marginTop: 'var(--space-2)',
              fontSize: 'var(--font-size-caption)',
              borderTop: '1px dashed var(--color-border)',
              paddingTop: 'var(--space-1)',
            }}
          >
            <strong>Safety Audit Notes:</strong> {sop.safetyNotes}
          </div>
        )}
      </div>

      {/* Tier 2 & Tier 3 Disabled Route Controls Grid */}
      <div
        style={{
          marginTop: 'var(--space-3)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {/* Tier 2: Animal Feed (Disabled) */}
        <div
          style={{
            padding: 'var(--space-3)',
            background: 'var(--color-canvas)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            opacity: 0.85,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-label)' }}>
              Tier 2: Animal Feed Route
            </span>
            <span
              className="badge badge-neutral"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '11px' }}
            >
              <Lock size={11} />
              <span>Disabled in MVP</span>
            </span>
          </div>
          <p
            style={{
              margin: 'var(--space-1) 0 0 0',
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-muted)',
            }}
          >
            <strong>Negative Invariant:</strong> Animal feed suitability is{' '}
            <strong>never inferred from human rejection</strong>. Food rejected for humans may
            contain ingredients toxic to animals. Requires separate veterinary clearance before
            future pilot.
          </p>
        </div>

        {/* Tier 3: Compost / Soil (Disabled) */}
        <div
          style={{
            padding: 'var(--space-3)',
            background: 'var(--color-canvas)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            opacity: 0.85,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-label)' }}>
              Tier 3: Soil &amp; Compost Route
            </span>
            <span
              className="badge badge-neutral"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '11px' }}
            >
              <Lock size={11} />
              <span>Disabled in MVP</span>
            </span>
          </div>
          <p
            style={{
              margin: 'var(--space-1) 0 0 0',
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-muted)',
            }}
          >
            Composting route disabled until qualified campus organic processing SOP and dedicated
            bio-waste stream partnerships are established.
          </p>
        </div>
      </div>

      {/* No AI Safety Certification Policy Notice */}
      <div
        style={{
          marginTop: 'var(--space-3)',
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--color-surface)',
          borderLeft: '3px solid var(--color-brand-700)',
          fontSize: '11px',
          color: 'var(--color-muted)',
        }}
      >
        <strong>Zero-Cost Safety Policy:</strong> AI models and computer vision are never permitted
        to certify food safety or approve redistribution routes. All route approvals require human
        physical inspection.
      </div>
    </div>
  );
}
