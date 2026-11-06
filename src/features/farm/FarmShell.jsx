import { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle2, Wheat } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';

const SAMPLE_ANIMAL_FEED_LISTINGS = [
  {
    id: 'feed-101',
    title: 'Fresh Vegetable Trimmings (Cabbage, Carrot, Pumpkin Peels)',
    donorOrg: 'Central Dining Hall 1 Pre-Prep Cell',
    category: 'Vegetable Scraps (Clean Pre-Cook)',
    quantity: 45,
    unit: 'kg',
    suitability: 'Dairy Cattle & Goats (FSSAI Animal Feed SOP Qualified)',
    pickupLocation: 'Kitchen Veg Pre-prep Loading Bay',
    pickupWindow: '14:00 – 17:00 Today',
    status: 'published',
  },
  {
    id: 'feed-102',
    title: 'Dry Wheat Bran & Clean Bread Ends',
    donorOrg: 'Hostel Bakery Unit',
    category: 'Clean Bakery Grain Trimmings',
    quantity: 30,
    unit: 'kg',
    suitability: 'Dairy Cattle Feed Concentrate',
    pickupLocation: 'Bakery Dispatch Counter',
    pickupWindow: '16:00 – 18:30 Today',
    status: 'published',
  },
];

const SAMPLE_FARM_HISTORY = [
  {
    id: 'farm-hist-01',
    title: 'Clean Cauliflower & Spinach Trimmings',
    date: 'Nov 02, 2026',
    quantity: '50 kg',
    donor: 'Central Mess 3',
    status: 'completed',
  },
  {
    id: 'farm-hist-02',
    title: 'Unhusked Rice & Grain Siftings',
    date: 'Oct 28, 2026',
    quantity: '35 kg',
    donor: 'Hostel Storage Cell',
    status: 'completed',
  },
];

export default function FarmShell({ initialTab = 'feed-dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [feedListings, setFeedListings] = useState(SAMPLE_ANIMAL_FEED_LISTINGS);
  const [claimedFeed, setClaimedFeed] = useState([]);
  const [confirmClaimModal, setConfirmClaimModal] = useState({ isOpen: false, item: null });
  const [successMessage, setSuccessMessage] = useState(null);

  const animalCount = 38; // Dairy cattle head count
  const monthlyFeedReceivedKg = 245;

  const handleClaim = (item) => {
    setConfirmClaimModal({ isOpen: true, item });
  };

  const executeClaim = () => {
    if (!confirmClaimModal.item) return;
    const item = confirmClaimModal.item;
    setClaimedFeed((prev) => [item, ...prev]);
    setFeedListings((prev) => prev.filter((f) => f.id !== item.id));
    setSuccessMessage(`Feed batch "${item.title}" reserved for dairy collection!`);
    setConfirmClaimModal({ isOpen: false, item: null });
  };

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
            <span className="badge badge-warning">Tier 2 Animal Feed Recovery</span>
            <span className="text-muted" style={{ fontSize: '11px' }}>
              Farm License: DL-FARM-2023-991
            </span>
          </div>
          <h1>Cattle Farm &amp; Feed Management</h1>
          <p className="text-muted">
            Qualified livestock feed recovery &bull; Segregated clean grain &amp; vegetable
            feedstock
          </p>
        </div>
      </div>

      {/* Strict Negative Rule Alert */}
      <div
        className="notice-box"
        style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-3)',
          background: 'var(--color-warning-bg)',
          border: '1px solid var(--color-warning)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)',
        }}
      >
        <AlertTriangle
          size={20}
          color="var(--color-warning)"
          style={{ flexShrink: 0, marginTop: '2px' }}
        />
        <div style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text)' }}>
          <strong>Strict Animal-Feed Safety Invariant:</strong>
          <span style={{ display: 'block', marginTop: '2px', color: 'var(--color-muted)' }}>
            Food rejected for human consumption is <em>never</em> inferred to be safe for animal
            consumption. Only food lots specifically assessed, inspected, and categorized under the
            Animal Feed SOP are visible in this feed.
          </span>
        </div>
      </div>

      {successMessage && (
        <div
          className="notice-box"
          style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-success-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--font-size-label)',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-nav" style={{ marginTop: 'var(--space-5)' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'feed-dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed-dashboard')}
        >
          Farm Overview ({claimedFeed.length > 0 ? `${claimedFeed.length} Claimed` : 'Overview'})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'feed-discovery' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed-discovery')}
        >
          Feed Discovery ({feedListings.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'farm-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('farm-history')}
        >
          Collection History
        </button>
      </div>

      {/* Tab 1: Farm Dashboard */}
      {activeTab === 'feed-dashboard' && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
                Livestock Head Count
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  margin: '4px 0',
                }}
              >
                {animalCount} cattle
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Registered dairy cows &amp; calves
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
                Monthly Feed Rescued
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--color-brand-900)',
                  margin: '4px 0',
                }}
              >
                {monthlyFeedReceivedKg} kg
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Diversion to cattle nutrition
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
                Available Qualified Feed
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--color-accent)',
                  margin: '4px 0',
                }}
              >
                {feedListings.length} batches
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Ready for pickup today
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-3)' }}>
              Farm Profile &amp; Feed Specifications
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--space-4)',
                fontSize: 'var(--font-size-body)',
              }}
            >
              <div>
                <strong>Farm Facility Name:</strong>
                <div className="text-muted">Shree Krishna Dairy &amp; Gaushala</div>
              </div>
              <div>
                <strong>Location:</strong>
                <div className="text-muted">
                  East Outskirts Rural Cluster &bull; 4.8 km from Campus
                </div>
              </div>
              <div>
                <strong>Permitted Feed Categories:</strong>
                <div className="text-muted">
                  Vegetable peels, grain screenings, clean bakery end-crusts
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Feed Discovery */}
      {activeTab === 'feed-discovery' && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          {feedListings.length === 0 ? (
            <EmptyState
              icon={Wheat}
              title="No qualified animal feed available"
              description="All assessed livestock feed batches for today have been claimed or none are currently declared."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {feedListings.map((item) => (
                <div key={item.id} className="card" style={{ padding: 'var(--space-5)' }}>
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
                      <span className="badge badge-warning" style={{ marginBottom: '4px' }}>
                        {item.category}
                      </span>
                      <h3 style={{ margin: '4px 0', fontSize: '1.15rem' }}>{item.title}</h3>
                      <div className="text-muted" style={{ fontSize: 'var(--font-size-label)' }}>
                        Donor: <strong>{item.donorOrg}</strong> &bull; Location:{' '}
                        {item.pickupLocation}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 800,
                          color: 'var(--color-primary)',
                        }}
                      >
                        {item.quantity} {item.unit}
                      </div>
                      <span className="text-muted" style={{ fontSize: '11px' }}>
                        Feedstock quantity
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 'var(--space-3)',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-canvas)',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <div>
                      <strong>Animal Suitability:</strong> {item.suitability}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <Clock size={13} color="var(--color-muted)" />
                      <span>Window: {item.pickupWindow}</span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 'var(--space-4)',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleClaim(item)}
                    >
                      <CheckCircle2 size={14} />
                      <span>Accept &amp; Schedule Feed Pickup</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Farm History */}
      {activeTab === 'farm-history' && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Collection Date</th>
                  <th>Feed Description</th>
                  <th>Quantity Collected</th>
                  <th>Donor Facility</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_FARM_HISTORY.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>
                      <strong>{item.title}</strong>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{item.donor}</td>
                    <td>
                      <span className="badge badge-verified">Handover Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmClaimModal.isOpen}
        title="Confirm Animal Feed Collection"
        body={`Are you sure you want to accept "${confirmClaimModal.item?.title}" (${confirmClaimModal.item?.quantity} ${confirmClaimModal.item?.unit})? You agree to transport in covered feed sacks before ${confirmClaimModal.item?.pickupWindow}.`}
        confirmLabel="Accept Feed Batch"
        onConfirm={executeClaim}
        onCancel={() => setConfirmClaimModal({ isOpen: false, item: null })}
      />
    </div>
  );
}
