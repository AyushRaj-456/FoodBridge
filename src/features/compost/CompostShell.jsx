import { useState } from 'react';
import { Recycle, CheckCircle2, Flame, Leaf } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';

const SAMPLE_ORGANIC_WASTE_LISTINGS = [
  {
    id: 'org-waste-201',
    title: 'Post-Meal Plate Organics & Kitchen Scraps',
    donorOrg: 'North Campus Mess 3 Cleaning Station',
    category: 'Cooked Plate Waste & Kitchen Organics',
    quantity: 65,
    unit: 'kg',
    compatibility: 'Anaerobic Biogas Digestion & Thermal Composting',
    pickupLocation: 'Rear Loading Dock & Waste Bay 2',
    pickupWindow: '21:30 – 23:00 Nightly',
    status: 'published',
  },
  {
    id: 'org-waste-202',
    title: 'Spent Coffee Grounds & Tea Leaves',
    donorOrg: 'Campus Cafeteria Cluster (3 outlets)',
    category: 'High Nitrogen Organic Beverage Waste',
    quantity: 25,
    unit: 'kg',
    compatibility: 'Vermicomposting Accelerator',
    pickupLocation: 'Cafeteria Service Alleys',
    pickupWindow: '20:00 – 22:00 Today',
    status: 'published',
  },
];

const SAMPLE_PROCESSING_HISTORY = [
  {
    id: 'proc-hist-01',
    date: 'Nov 03, 2026',
    wasteType: 'Mixed Plate Organic Waste',
    quantity: '70 kg',
    method: 'Anaerobic Biogas Digestion',
    yieldOutput: '~14 m³ Biogas fuel generated',
    status: 'completed',
  },
  {
    id: 'proc-hist-02',
    date: 'Oct 30, 2026',
    wasteType: 'Kitchen Veg Peels & Coffee Scraps',
    quantity: '110 kg',
    method: 'Aerobic Vermicomposting',
    yieldOutput: '~55 kg Bio-fertilizer in curing pile',
    status: 'completed',
  },
];

export default function CompostShell({ initialTab = 'facility-dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [wasteListings, setWasteListings] = useState(SAMPLE_ORGANIC_WASTE_LISTINGS);
  const [claimedBatches, setClaimedBatches] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null });
  const [successMessage, setSuccessMessage] = useState(null);

  const processingCapacityKgDay = 500;
  const wasteReceivedMonthKg = 480;

  const handleClaim = (item) => {
    setConfirmModal({ isOpen: true, item });
  };

  const executeClaim = () => {
    if (!confirmModal.item) return;
    const item = confirmModal.item;
    setClaimedBatches((prev) => [item, ...prev]);
    setWasteListings((prev) => prev.filter((w) => w.id !== item.id));
    setSuccessMessage(`Organic waste batch "${item.title}" scheduled for facility pickup!`);
    setConfirmModal({ isOpen: false, item: null });
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
            <span className="badge badge-info">Tier 3 Soil &amp; Energy Recovery</span>
            <span className="text-muted" style={{ fontSize: '11px' }}>
              Permit: SWM-FACILITY-2024-001
            </span>
          </div>
          <h1>Composting &amp; Biogas Facility Operations</h1>
          <p className="text-muted">
            Transforming inedible organic scraps into clean bio-energy and nutrient-dense soil
            amendment
          </p>
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
          className={`tab-btn ${activeTab === 'facility-dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('facility-dashboard')}
        >
          Facility Dashboard (
          {claimedBatches.length > 0 ? `${claimedBatches.length} Active` : 'Overview'})
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
          Processing History
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
                Daily Processing Capacity
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0d9488', margin: '4px 0' }}>
                {processingCapacityKgDay} kg/day
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Continuous anaerobic digester
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
                {wasteReceivedMonthKg} kg
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Month-to-date recovery
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
                {wasteListings.length} batches
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Ready for evening dispatch
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)' }}>
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
                    Generates methane replacement gas for university student union water boilers.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Leaf size={22} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Organic Soil Conditioner:</strong>
                  <div className="text-muted">
                    High-nitrogen compost supplied to campus botanical landscaping and student
                    gardens.
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
          {wasteListings.length === 0 ? (
            <EmptyState
              icon={Recycle}
              title="No organic waste batches declared"
              description="Dining kitchens have not logged post-service plate organics at this hour."
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
                        {item.category}
                      </span>
                      <h3 style={{ margin: '4px 0', fontSize: '1.15rem' }}>{item.title}</h3>
                      <div className="text-muted" style={{ fontSize: 'var(--font-size-label)' }}>
                        Donor: <strong>{item.donorOrg}</strong> &bull; Pickup Bay:{' '}
                        {item.pickupLocation}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d9488' }}>
                        {item.quantity} {item.unit}
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
                      <strong>Digestion Compatibility:</strong> {item.compatibility}
                    </div>
                    <div>
                      <span>{item.pickupWindow}</span>
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
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Processing Date</th>
                  <th>Organic Waste Category</th>
                  <th>Quantity Processed</th>
                  <th>Method</th>
                  <th>Resource Yield</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_PROCESSING_HISTORY.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>
                      <strong>{item.wasteType}</strong>
                    </td>
                    <td>{item.quantity}</td>
                    <td>
                      <span className="badge badge-neutral">{item.method}</span>
                    </td>
                    <td style={{ color: '#0d9488', fontWeight: 600 }}>{item.yieldOutput}</td>
                    <td>
                      <span className="badge badge-verified">Processed</span>
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
        isOpen={confirmModal.isOpen}
        title="Schedule Organic Waste Collection"
        body={`Accept collection for "${confirmModal.item?.title}" (${confirmModal.item?.quantity} ${confirmModal.item?.unit})? Dedicated sealed organic transport bins required.`}
        confirmLabel="Confirm Collection"
        onConfirm={executeClaim}
        onCancel={() => setConfirmModal({ isOpen: false, item: null })}
      />
    </div>
  );
}
