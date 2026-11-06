import { useState, useEffect } from 'react';
import { Recycle, CheckCircle2, Flame, Leaf } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';

export default function CompostShell({ initialTab = 'facility-dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [wasteListings, setWasteListings] = useState([]);
  const [claimedBatches, setClaimedBatches] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null });
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Firestore fetch for organic route listings
  useEffect(() => {
    let isMounted = true;
    async function loadOrganicListings() {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'listings'),
          where('routeTier', '==', 'organic'),
          where('status', '==', 'published'),
          limit(25)
        );
        const snap = await getDocs(q);
        if (isMounted) {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setWasteListings(docs);
        }
      } catch (err) {
        console.warn('[CompostShell] Live organic waste listings fetch:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOrganicListings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleClaim = (item) => {
    setConfirmModal({ isOpen: true, item });
  };

  const executeClaim = () => {
    if (!confirmModal.item) return;
    const item = confirmModal.item;
    setClaimedBatches((prev) => [item, ...prev]);
    setWasteListings((prev) => prev.filter((w) => w.id !== item.id));
    setSuccessMessage(`Organic waste batch "${item.title || 'Organic Lot'}" scheduled for facility pickup!`);
    setConfirmModal({ isOpen: false, item: null });
  };

  const totalDivertedKg = claimedBatches.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

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
            <span className="badge badge-info">Tier 3 Soil &amp; Energy Recovery</span>
            <span className="text-muted" style={{ fontSize: '11px' }}>
              Permit: SWM-FACILITY-2024-001
            </span>
          </div>
          <h1>Composting &amp; Biogas Facility Operations</h1>
          <p className="text-muted">
            Transforming inedible organic scraps into clean bio-energy and nutrient-dense soil amendment
          </p>
        </div>
      </div>

      {successMessage && (
        <div
          className="notice-box"
          style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-success-bg, #ecfdf5)',
            color: 'var(--color-success, #059669)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-success-border, #a7f3d0)',
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
          className={`tab-btn ${activeTab === 'facility-dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('facility-dashboard')}
        >
          Facility Dashboard ({claimedBatches.length > 0 ? `${claimedBatches.length} Active` : 'Overview'})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'waste-discovery' ? 'active' : ''}`}
          onClick={() => setActiveTab('waste-discovery')}
        >
          Organic Waste Discovery ({wasteListings.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'processing-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('processing-history')}
        >
          Processing History ({claimedBatches.length})
        </button>
      </div>

      {/* Tab 1: Dashboard */}
      {activeTab === 'facility-dashboard' && (
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
                Active Facility Claims
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0d9488', margin: '4px 0' }}>
                {claimedBatches.length} {claimedBatches.length === 1 ? 'batch' : 'batches'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                {claimedBatches.length > 0 ? 'Dispatched for pickup' : 'No active collections'}
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
                Organic Waste Diverted
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--color-brand-900)',
                  margin: '4px 0',
                }}
              >
                {totalDivertedKg} kg
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Diverted this session
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
                Available Organic Waste
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--color-accent)',
                  margin: '4px 0',
                }}
              >
                {wasteListings.length} {wasteListings.length === 1 ? 'batch' : 'batches'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Ready for facility dispatch
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-3)' }}>
              Active Facility Batches
            </h3>
            {claimedBatches.length === 0 ? (
              <EmptyState
                icon={Recycle}
                title="No active collections"
                description="Your facility has not scheduled any organic waste collections yet. Discover available kitchen organics in the discovery tab."
                actionLabel="Discover Organic Waste"
                onAction={() => setActiveTab('waste-discovery')}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {claimedBatches.map((item) => (
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
                      <span className="badge badge-success">Dispatched to Facility</span>
                      <span style={{ fontWeight: 700, color: '#0d9488' }}>
                        {item.quantity} {item.unit || 'kg'}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, marginTop: '4px' }}>{item.title || 'Organic Lot'}</div>
                    <div className="text-muted" style={{ fontSize: '12px' }}>
                      Location: {item.pickupLocation || item.pickupAddress || 'Campus Waste Bay'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-3)' }}>
              Circular Resource Conversion
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--space-4)',
                fontSize: 'var(--font-size-body)',
              }}
            >
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Flame size={22} color="#0d9488" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Biogas Energy Output:</strong>
                  <div className="text-muted">
                    Generates methane replacement gas for community hot water and clean energy.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Leaf size={22} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Organic Soil Conditioner:</strong>
                  <div className="text-muted">
                    High-nitrogen compost supplied to botanical landscaping and community gardens.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Organic Waste Discovery */}
      {activeTab === 'waste-discovery' && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          {loading ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-muted)' }}>
              Loading organic waste listings...
            </div>
          ) : wasteListings.length === 0 ? (
            <EmptyState
              icon={Recycle}
              title="No organic waste batches declared"
              description="Dining kitchens and messes have not logged post-service plate organics or kitchen scraps at this hour."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {wasteListings.map((item) => (
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
                      <span className="badge badge-info" style={{ marginBottom: '4px' }}>
                        {item.category || 'Organic Waste'}
                      </span>
                      <h3 style={{ margin: '4px 0', fontSize: '1.15rem' }}>{item.title}</h3>
                      <div className="text-muted" style={{ fontSize: 'var(--font-size-label)' }}>
                        Donor Org: <strong>{item.donorOrgName || item.donorOrgId || 'Campus Kitchen'}</strong> &bull; Pickup Bay:{' '}
                        {item.pickupLocation || item.pickupAddress || 'Waste Dock'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d9488' }}>
                        {item.quantity} {item.unit || 'kg'}
                      </div>
                      <span className="text-muted" style={{ fontSize: '11px' }}>
                        Total organic mass
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
                      <strong>Digestion Compatibility:</strong> {item.compatibility || 'Anaerobic Digestion & Composting'}
                    </div>
                    <div>
                      <span>{item.pickupWindow || 'Today'}</span>
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
                      <span>Accept &amp; Dispatch Waste Carts</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Processing History */}
      {activeTab === 'processing-history' && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          {claimedBatches.length === 0 ? (
            <EmptyState
              icon={Recycle}
              title="No processed batches logged"
              description="Collections confirmed and processed by this facility will be listed here with resource conversion metrics."
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Batch Title</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claimedBatches.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.title || 'Organic Lot'}</strong>
                      </td>
                      <td>{item.category || 'Organic Scraps'}</td>
                      <td>
                        {item.quantity} {item.unit || 'kg'}
                      </td>
                      <td>
                        <span className="badge badge-neutral">Composting / Digestion</span>
                      </td>
                      <td>
                        <span className="badge badge-verified">Dispatched</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title="Schedule Organic Waste Collection"
        body={`Accept collection for "${confirmModal.item?.title || 'this batch'}" (${confirmModal.item?.quantity || ''} ${confirmModal.item?.unit || 'kg'})? Dedicated sealed organic transport bins required.`}
        confirmLabel="Confirm Collection"
        onConfirm={executeClaim}
        onCancel={() => setConfirmModal({ isOpen: false, item: null })}
      />
    </div>
  );
}
