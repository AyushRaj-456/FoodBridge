import { ShieldCheck, PlusCircle, Award, Compass, Truck } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function NgoDashboardView({
  orgStatus = 'approved',
  orgName = 'Welfare Partner NGO',
  orgRegNumber = '',
  availableListings = [],
  claims = [],
  onNavigateTab,
  onOpenDemandRequest,
  onOpenDistributionProof,
}) {
  const activeClaims = claims.filter((c) => ['claimed', 'donor_confirmed', 'recipient_confirmed'].includes(c.status));
  const completedClaims = claims.filter((c) => c.status === 'completed');

  const availableCount = availableListings.length;
  const pendingCount = activeClaims.length;
  const completedCount = completedClaims.length;
  const mealsReceived = completedClaims.reduce((sum, c) => sum + (Number(c.portions) || Math.round((Number(c.actualQuantity) || 0) * 2.5)), 0);
  const foodRescuedKg = completedClaims.reduce((sum, c) => sum + (Number(c.actualQuantity) || 0), 0);

  return (
    <div className="ngo-dashboard">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
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
            <span className="badge badge-verified">
              <ShieldCheck size={13} />{' '}
              {orgStatus === 'approved' ? 'Verified Welfare Organization' : `Status: ${orgStatus}`}
            </span>
            {orgRegNumber && (
              <span className="text-muted" style={{ fontSize: '11px' }}>
                Registration: {orgRegNumber}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 'var(--font-size-title-desktop)', margin: 0 }}>
            {orgName} &bull; Operations Portal
          </h1>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-body)', marginTop: '4px' }}>
            Discover inspected surplus food batches, coordinate insulated pickups, and record distributions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button type="button" className="btn btn-primary" onClick={onOpenDemandRequest}>
            <PlusCircle size={16} />
            <span>Post Meal Request</span>
          </button>
          <button type="button" className="btn btn-secondary" onClick={onOpenDistributionProof}>
            <Award size={16} />
            <span>Submit Distribution Proof</span>
          </button>
        </div>
      </div>

      {/* KPI Cards — Authoritative real-time calculations */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Available Surplus Nearby
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              margin: '4px 0',
            }}
          >
            {availableCount} {availableCount === 1 ? 'batch' : 'batches'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Within your local zone</div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Pending Collections
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-accent)',
              margin: '4px 0',
            }}
          >
            {pendingCount} {pendingCount === 1 ? 'pickup' : 'pickups'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
            {pendingCount > 0 ? 'Awaiting collection' : 'No active pickups'}
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Completed Collections
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-brand-900)',
              margin: '4px 0',
            }}
          >
            {completedCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Lifetime verified handovers</div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Meals Received
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              margin: '4px 0',
            }}
          >
            {mealsReceived}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
            Served to verified beneficiaries
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Total Food Rescued
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0d9488', margin: '4px 0' }}>
            {foodRescuedKg} kg
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
            Diverted from waste
          </div>
        </div>
      </div>

      {/* Main Sections with Live Data and Honest Empty States */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {/* Nearby Feed Preview */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
            }}
          >
            <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: 0 }}>
              Available Fresh Surplus
            </h3>
            <button
              type="button"
              className="btn-quiet"
              style={{ fontSize: 'var(--font-size-label)' }}
              onClick={() => onNavigateTab('available-feed')}
            >
              Open Feed Explorer &rarr;
            </button>
          </div>

          {availableListings.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No surplus food available right now"
              description="New donations from partner messes and kitchens will appear here automatically as soon as they are published."
              actionLabel="Explore Feed Explorer"
              onAction={() => onNavigateTab('available-feed')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {availableListings.slice(0, 3).map((opp) => (
                <div
                  key={opp.id}
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-hover)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <span className="badge badge-success" style={{ marginBottom: '2px' }}>
                        {opp.quantity} {opp.unit} &bull; ~{opp.portions} Portions
                      </span>
                      <h4 style={{ margin: '2px 0', fontSize: '1rem' }}>{opp.title}</h4>
                      <div className="text-muted" style={{ fontSize: '12px' }}>
                        {opp.location || 'Local Donor'}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onNavigateTab('available-feed')}
                    >
                      Inspect &amp; Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Claim Coordination */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
            }}
          >
            <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: 0 }}>
              Active Claim Coordination
            </h3>
            <button
              type="button"
              className="btn-quiet"
              style={{ fontSize: 'var(--font-size-label)' }}
              onClick={() => onNavigateTab('my-claims')}
            >
              View All Claims &rarr;
            </button>
          </div>

          {activeClaims.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No pending collections"
              description="You have no active claims in progress. When you claim an available surplus listing, pickup coordination details will appear here."
              actionLabel="Find Food to Claim"
              onAction={() => onNavigateTab('available-feed')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {activeClaims.map((claim) => (
                <div
                  key={claim.id}
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{claim.title || `Claim #${claim.id.slice(-6)}`}</strong>
                    <span className="badge badge-warning">Awaiting Collection</span>
                  </div>
                  <p className="text-muted" style={{ fontSize: '12px', margin: '4px 0' }}>
                    {claim.quantity}
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 'var(--space-2)' }}
                    onClick={() => onNavigateTab('handover-confirm')}
                  >
                    Confirm Handover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
