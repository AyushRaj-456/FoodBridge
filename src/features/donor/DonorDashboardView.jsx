import { PlusCircle, Truck, History } from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export default function DonorDashboardView({
  listings = [],
  onNavigateTab,
  onOpenCreateListing,
  onViewListing,
}) {
  const { user, profile } = useAuth();
  const donorName = profile?.displayName || user?.displayName || 'Campus Mess Lead';

  // Compute metrics from listings
  const activeListings = listings.filter((l) =>
    ['published', 'draft', 'claimed'].includes(l.status)
  );
  const publishedListings = listings.filter((l) => l.status === 'published');
  const claimedListings = listings.filter((l) => l.status === 'claimed');

  // Real-time metrics computed directly from authoritative Firestore records
  const completedListings = listings.filter((l) => l.status === 'completed');
  const completedPickups = completedListings.length;
  const foodRescuedKg = completedListings.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
  const mealsRedistributed = completedListings.reduce(
    (sum, l) => sum + (Number(l.portions) || Math.round((Number(l.quantity) || 0) * 2.5)),
    0
  );
  const totalDonations = listings.length;

  return (
    <div className="donor-dashboard">
      {/* Top Section Greeting */}
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
          <h1 style={{ fontSize: 'var(--font-size-title-desktop)', margin: '0 0 var(--space-1)' }}>
            Good morning, {donorName}
          </h1>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-body)', margin: 0 }}>
            Here&apos;s an overview of your food-sharing activity.
          </p>
        </div>

        <button type="button" className="btn btn-primary btn-lg" onClick={onOpenCreateListing}>
          <PlusCircle size={18} />
          <span>+ Create Food Listing</span>
        </button>
      </div>

      {/* Summary Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Active Listings
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              margin: '4px 0',
            }}
          >
            {publishedListings.length + claimedListings.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
            {claimedListings.length} awaiting pickup
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Total Donations
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-brand-900)',
              margin: '4px 0',
            }}
          >
            {totalDonations}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
            Lifetime recorded batches
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Meals Redistributed
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              margin: '4px 0',
            }}
          >
            {mealsRedistributed}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>400g / meal benchmark</div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Food Rescued
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0d9488', margin: '4px 0' }}>
            {foodRescuedKg} kg
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Diverted from waste</div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Completed Pickups
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-secondary)',
              margin: '4px 0',
            }}
          >
            {completedPickups}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
            100% successful handover
          </div>
        </div>
      </div>

      {/* Main Grid: Active Listings & Quick Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {/* Section 1: Active Listings */}
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
              Active Surplus Listings
            </h3>
            <button
              type="button"
              className="btn-quiet"
              style={{ fontSize: 'var(--font-size-label)' }}
              onClick={() => onNavigateTab('active-listings')}
            >
              View all ({activeListings.length})
            </button>
          </div>

          {activeListings.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 'var(--font-size-body)' }}>
              No active listings currently published. Click <strong>+ Create Food Listing</strong>{' '}
              to declare surplus.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {activeListings.slice(0, 3).map((listing) => (
                <div
                  key={listing.id}
                  style={{
                    padding: 'var(--space-3)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <StatusBadge status={listing.status} />
                      <strong style={{ fontSize: '14px' }}>{listing.title}</strong>
                    </div>
                    <div className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
                      {listing.quantity} {listing.unit} &bull; Consume by {listing.consumeBy}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onViewListing(listing)}
                  >
                    Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Quick Actions & SOP Reminders */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-4)' }}>
            Quick Operations &amp; Safety SOP
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={onOpenCreateListing}
            >
              <PlusCircle size={16} color="var(--color-primary)" />
              <span>Declare Shift Surplus (In-App Camera)</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => onNavigateTab('pickup-status')}
            >
              <Truck size={16} color="var(--color-primary)" />
              <span>Inspect Pickup Logistics &amp; Handover</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => onNavigateTab('donor-history')}
            >
              <History size={16} color="var(--color-primary)" />
              <span>Review Past Donation Receipts</span>
            </button>

            <div
              style={{
                marginTop: 'var(--space-2)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-canvas)',
                border: '1px solid var(--color-border)',
                fontSize: '12px',
                color: 'var(--color-muted)',
              }}
            >
              <strong style={{ color: 'var(--color-primary)' }}>FSSAI Good Samaritan Rule:</strong>{' '}
              All food items must be held above 60&deg;C in stainless food-grade containers until
              pickup.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
