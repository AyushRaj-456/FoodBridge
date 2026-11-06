import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Wheat } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';

export default function FarmShell({ initialTab = 'feed-dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [feedListings, setFeedListings] = useState([]);
  const [claimedFeed, setClaimedFeed] = useState([]);
  const [confirmClaimModal, setConfirmClaimModal] = useState({ isOpen: false, item: null });
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Firestore fetch for animal-route listings
  useEffect(() => {
    let isMounted = true;
    async function loadFeedListings() {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'listings'),
          where('routeTier', '==', 'animal'),
          where('status', '==', 'published'),
          limit(25)
        );
        const snap = await getDocs(q);
        if (isMounted) {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setFeedListings(docs);
        }
      } catch (err) {
        console.warn('[FarmShell] Live animal-feed listings fetch:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFeedListings();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const totalClaimedKg = claimedFeed.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

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
          </div>
          <h1>Cattle Farm &amp; Feed Management</h1>
          <p className="text-muted">
            Qualified livestock feed recovery &bull; Segregated clean grain &amp; vegetable feedstock
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
            backgroundColor: 'var(--color-success-bg, #ecfdf5)',
            border: '1px solid var(--color-success, #059669)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success, #059669)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
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
                Active Feed Claims
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  margin: '4px 0',
                }}
              >
                {claimedFeed.length} {claimedFeed.length === 1 ? 'batch' : 'batches'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                {claimedFeed.length > 0 ? 'Pending dairy collection' : 'No active claims'}
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
                Feed Claimed This Session
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--color-brand-900)',
                  margin: '4px 0',
                }}
              >
                {totalClaimedKg} kg
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Diverted to cattle nutrition
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
                {feedListings.length} {feedListings.length === 1 ? 'batch' : 'batches'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Ready for verified pickup
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-3)' }}>
              Active Farm Reservations
            </h3>
            {claimedFeed.length === 0 ? (
              <EmptyState
                icon={Wheat}
                title="No active feed claims"
                description="Your farm has not claimed any feed batches yet. Browse qualified animal feed in the discovery tab to schedule a collection."
                actionLabel="Discover Available Feed"
                onAction={() => setActiveTab('feed-discovery')}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {claimedFeed.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-success">Reserved for Gaushala Collection</span>
                      <span className="text-muted" style={{ fontSize: '12px' }}>
                        {item.quantity} {item.unit || 'kg'}
                      </span>
                    </div>
                    <h4 style={{ margin: '6px 0 2px' }}>{item.title}</h4>
                    <p className="text-muted" style={{ margin: 0, fontSize: '13px' }}>
                      {item.location || 'Loading Bay'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Feed Discovery */}
      {activeTab === 'feed-discovery' && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          {loading ? (
            <p className="text-muted">Loading qualified animal feed listings...</p>
          ) : feedListings.length === 0 ? (
            <EmptyState
              icon={Wheat}
              title="No animal-feed qualified listings currently available"
              description="Surplus food independently assessed as suitable for livestock feed will appear here when published by partner kitchens."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {feedListings.map((f) => (
                <div
                  key={f.id}
                  className="card"
                  style={{
                    padding: 'var(--space-4)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div style={{ maxWidth: '600px' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <span className="badge badge-warning">Tier 2 Feed</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {f.quantity} {f.unit || 'kg'}
                      </span>
                    </div>
                    <h3 style={{ margin: '4px 0 2px', fontSize: '1.05rem' }}>{f.title}</h3>
                    <p className="text-muted" style={{ margin: 0, fontSize: '13px' }}>
                      {f.storageDeclaration || 'Clean food-grade storage'} &bull; Location: {f.location || 'Kitchen Bay'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleClaim(f)}
                  >
                    Claim for Farm
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Farm Collection History */}
      {activeTab === 'farm-history' && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <EmptyState
            icon={Wheat}
            title="No past collection records"
            description="Verified historical feed handovers and animal nutrition diversion logs will appear here after collection completion."
          />
        </div>
      )}

      {/* Confirm Claim Dialog */}
      <ConfirmDialog
        isOpen={confirmClaimModal.isOpen}
        title="Confirm Farm Feed Claim"
        message={
          confirmClaimModal.item
            ? `Are you sure you want to claim "${confirmClaimModal.item.title}" (${confirmClaimModal.item.quantity} ${confirmClaimModal.item.unit || 'kg'}) for verified livestock feeding? You commit to collecting with clean transport containers.`
            : ''
        }
        confirmText="Confirm Claim"
        cancelText="Cancel"
        onConfirm={executeClaim}
        onCancel={() => setConfirmClaimModal({ isOpen: false, item: null })}
      />
    </div>
  );
}
