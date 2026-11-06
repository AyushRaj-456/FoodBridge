import { AlertTriangle, Layers, CheckCircle2 } from 'lucide-react';

const ROUTING_TIERS = [
  {
    tier: 1,
    name: 'Humans First',
    subtitle: 'Surplus Cooked Meals & Wholesome Prepared Food',
    target: 'Government-Registered Welfare NGOs & Shelters',
    color: 'var(--color-primary)',
    badgeClass: 'badge-verified',
    sopCode: 'FB-SOP-PILOT-HUMAN-2026',
    activeStatus: 'Active & Operational in Campus Pilot',
    criteria: [
      'Hot holding maintained above 60°C or cold below 5°C',
      'Untouched stainless kitchen vessels (no open buffet trays)',
      'Consumption within 4 hours of meal shift end',
      'Mandatory donor food safety declaration & allergen tagging',
    ],
  },
  {
    tier: 2,
    name: 'Animals Second',
    subtitle: 'Safe Vegetable Trimmings, Clean Grains & Bakery Ends',
    target: 'Verified Cattle & Dairy Farms (Gaushalas)',
    color: 'var(--color-accent)',
    badgeClass: 'badge-warning',
    sopCode: 'FB-SOP-TIER2-ANIMAL-GATED',
    activeStatus: 'Operational for Qualified Pre-Prep Feed Only',
    criteria: [
      'Clean vegetable trimmings, grain bran, unseasoned bakery ends',
      'NEVER infer animal suitability from human rejection / spoilage',
      'Separate qualified animal-feed eligibility SOP required',
      'No meat residues, alliums (onions/garlic) or spices hazardous to livestock',
    ],
  },
  {
    tier: 3,
    name: 'Soil Third',
    subtitle: 'Plate Scraps, Inedible Organics & Kitchen Peels',
    target: 'Campus Composting & Biogas Digestion Facilities',
    color: '#0d9488',
    badgeClass: 'badge-info',
    sopCode: 'FB-SOP-TIER3-COMPOST-GATED',
    activeStatus: 'Phase 2 Pilot Expansion Pathway',
    criteria: [
      'Post-consumer plate leftovers, coffee grounds, eggshells',
      'Sorted for non-biodegradable packaging or plastic zero-tolerance',
      'Thermal aerobic composting (>55°C) or sealed anaerobic digestion',
      'Direct diversion accounting with ~0.5 kg bio-fertilizer yield / kg',
    ],
  },
];

const AUDIT_LOTS = [
  {
    id: 'LOT-2026-101',
    foodItem: 'Cooked Steamed Rice & Dal Tadka',
    source: 'North Campus Mess 3',
    quantity: '18 kg',
    classifiedTier: 1,
    recipient: 'City Care Welfare NGO',
    status: 'Delivered & Served',
  },
  {
    id: 'LOT-2026-102',
    foodItem: 'Raw Cabbage & Pumpkin Prep Peels',
    source: 'Central Prep Bay 1',
    quantity: '45 kg',
    classifiedTier: 2,
    recipient: 'Shree Krishna Dairy Gaushala',
    status: 'Feed Handover Complete',
  },
  {
    id: 'LOT-2026-103',
    foodItem: 'Student Dining Plate Organic Scraps',
    source: 'Mess Dishwashing Station',
    quantity: '65 kg',
    classifiedTier: 3,
    recipient: 'University Biogas Digester Unit',
    status: 'Anaerobic Digestion Active',
  },
];

export default function ThreeTierRoutingView() {
  return (
    <div className="feature-container">
      {/* Header */}
      <div className="feature-header">
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-1)',
            }}
          >
            <span className="badge badge-verified">
              <Layers size={13} /> Ecological Recovery Architecture
            </span>
          </div>
          <h1>Three-Tier Surplus Routing System</h1>
          <p className="text-muted">
            The core biological routing matrix: Humans First &rarr; Animals Second &rarr; Soil Third
          </p>
        </div>
      </div>

      {/* Primary Invariant Banner */}
      <div
        className="notice-box"
        style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderLeft: '4px solid var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'flex-start',
        }}
      >
        <AlertTriangle
          size={22}
          color="var(--color-danger)"
          style={{ flexShrink: 0, marginTop: '2px' }}
        />
        <div>
          <strong style={{ color: 'var(--color-danger)' }}>
            Strict Routing Safety Invariant (OD-03 &amp; SOP Enforcement):
          </strong>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 'var(--font-size-label)',
              color: 'var(--color-muted)',
              lineHeight: 1.5,
            }}
          >
            Food deemed unfit or rejected for human consumption is{' '}
            <strong>never automatically routed to animals</strong>. Animal suitability cannot be
            inferred by default. Tier 2 feed requires independent eligibility criteria protecting
            livestock health. Any rejected or questionable food bypasses animals directly to Tier 3
            composting or disposal.
          </p>
        </div>
      </div>

      {/* Visual Flow Representation */}
      <div
        style={{
          marginTop: 'var(--space-6)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {ROUTING_TIERS.map((tier) => (
          <div
            key={tier.tier}
            className="card"
            style={{
              padding: 'var(--space-6)',
              borderTop: `4px solid ${tier.color}`,
              backgroundColor: 'var(--color-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={`badge ${tier.badgeClass}`}>
                Tier {tier.tier} &bull; Priority {tier.tier}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-family-mono)',
                  color: 'var(--color-muted)',
                }}
              >
                {tier.sopCode}
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 var(--space-1)' }}>{tier.name}</h3>
              <p className="text-muted" style={{ fontSize: 'var(--font-size-label)', margin: 0 }}>
                {tier.subtitle}
              </p>
            </div>

            <div
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-canvas)',
                fontSize: '12px',
              }}
            >
              <strong>Authorized Target:</strong>
              <div style={{ color: tier.color, fontWeight: 600 }}>{tier.target}</div>
            </div>

            <div>
              <strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Gated Eligibility Criteria:
              </strong>
              <ul
                style={{
                  paddingLeft: 'var(--space-4)',
                  margin: 0,
                  fontSize: '12px',
                  color: 'var(--color-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {tier.criteria.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div
              style={{
                marginTop: 'auto',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
                fontSize: '11px',
                color: 'var(--color-muted)',
              }}
            >
              Status: <strong>{tier.activeStatus}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Live Routing Audit Ledger */}
      <div className="card" style={{ marginTop: 'var(--space-8)', padding: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-2)' }}>
          Active Lots &bull; Three-Tier Routing Ledger
        </h3>
        <p
          className="text-muted"
          style={{ fontSize: 'var(--font-size-body)', marginBottom: 'var(--space-4)' }}
        >
          Real-time tracking of classified food batches from source kitchen through final
          destination.
        </p>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lot ID</th>
                <th>Food Batch Description</th>
                <th>Source Kitchen</th>
                <th>Quantity</th>
                <th>Classified Tier</th>
                <th>Designated Recipient</th>
                <th>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOTS.map((lot) => (
                <tr key={lot.id}>
                  <td style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px' }}>
                    {lot.id}
                  </td>
                  <td>
                    <strong>{lot.foodItem}</strong>
                  </td>
                  <td>{lot.source}</td>
                  <td>{lot.quantity}</td>
                  <td>
                    <span
                      className={`badge ${
                        lot.classifiedTier === 1
                          ? 'badge-verified'
                          : lot.classifiedTier === 2
                            ? 'badge-warning'
                            : 'badge-info'
                      }`}
                    >
                      Tier {lot.classifiedTier}
                    </span>
                  </td>
                  <td>{lot.recipient}</td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                      <CheckCircle2 size={12} /> {lot.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
