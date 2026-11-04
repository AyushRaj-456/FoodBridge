import { useState } from 'react';
import {
  PlusCircle,
  PackageCheck,
  Truck,
  AlertCircle,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Eye,
  Info,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';

const SAMPLE_ACTIVE_LISTINGS = [
  {
    id: 'lst-101',
    title: 'Cooked Rice & Yellow Dal Tadka',
    category: 'Cooked Meals',
    quantity: 18,
    unit: 'kg',
    portions: 55,
    preparedAt: '19:30',
    consumeBy: '23:00',
    pickupStart: '20:30',
    pickupEnd: '22:00',
    storage: 'Insulated hot containers (>60°C)',
    dietType: 'Vegetarian',
    allergens: 'None',
    status: 'published',
    location: 'North Campus Mess 3, Ground Floor Kitchen',
  },
  {
    id: 'lst-102',
    title: 'Assorted Roti & Chapati Pack',
    category: 'Cooked Meals',
    quantity: 80,
    unit: 'pieces',
    portions: 40,
    preparedAt: '20:00',
    consumeBy: '23:30',
    pickupStart: '20:45',
    pickupEnd: '22:15',
    storage: 'Dry clean food-grade cloth crates',
    dietType: 'Vegetarian',
    allergens: 'Wheat / Gluten',
    status: 'claimed',
    location: 'Hostel Block B Dispatch Counter',
  },
];

const SAMPLE_DONOR_HISTORY = [
  {
    id: 'lst-hist-01',
    title: 'Mixed Vegetable Curry & Rice',
    date: 'Nov 03, 2026',
    quantity: '22 kg',
    portions: 65,
    recipient: 'City Care Welfare NGO',
    status: 'completed',
  },
  {
    id: 'lst-hist-02',
    title: 'Morning Breakfast Idli & Sambar',
    date: 'Nov 02, 2026',
    quantity: '12 kg',
    portions: 35,
    recipient: 'Seva Relief Society',
    status: 'completed',
  },
  {
    id: 'lst-hist-03',
    title: 'Steamed Rice',
    date: 'Oct 31, 2026',
    quantity: '10 kg',
    portions: 30,
    recipient: 'Withdrawn by donor (quality test failed)',
    status: 'withdrawn',
  },
];

export default function ListingShell({ activeTab }) {
  const [listings, setListings] = useState(SAMPLE_ACTIVE_LISTINGS);
  const [history] = useState(SAMPLE_DONOR_HISTORY);
  const [filterQuery, setFilterQuery] = useState('');
  const [confirmWithdrawModal, setConfirmWithdrawModal] = useState({
    isOpen: false,
    listing: null,
  });

  // Create Listing Form State
  const [formValues, setFormValues] = useState({
    title: '',
    category: 'cooked_meals',
    quantity: '',
    unit: 'kg',
    portions: '',
    preparedAt: '',
    consumeBy: '',
    pickupStart: '',
    pickupEnd: '',
    storage: '',
    dietType: 'vegetarian',
    allergens: '',
    location: '',
  });

  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleWithdrawListing = (listing) => {
    setConfirmWithdrawModal({ isOpen: true, listing });
  };

  const confirmWithdraw = () => {
    if (!confirmWithdrawModal.listing) return;
    setListings((prev) =>
      prev.map((l) =>
        l.id === confirmWithdrawModal.listing.id ? { ...l, status: 'withdrawn' } : l
      )
    );
    setConfirmWithdrawModal({ isOpen: false, listing: null });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    const qty = parseFloat(formValues.quantity);
    if (!qty || qty <= 0) {
      setFormError('Quantity must be a positive number greater than 0.');
      return;
    }

    if (!formValues.title.trim()) {
      setFormError('Food title is required.');
      return;
    }

    if (!formValues.consumeBy) {
      setFormError('Consume-by deadline is mandatory for food safety.');
      return;
    }

    const newListing = {
      id: `lst-${Date.now().toString().slice(-4)}`,
      title: formValues.title,
      category: formValues.category === 'cooked_meals' ? 'Cooked Meals' : 'Packaged Goods',
      quantity: qty,
      unit: formValues.unit,
      portions: parseInt(formValues.portions, 10) || Math.round(qty * 3),
      preparedAt: formValues.preparedAt || 'Just now',
      consumeBy: formValues.consumeBy,
      pickupStart: formValues.pickupStart || 'Immediate',
      pickupEnd: formValues.pickupEnd || formValues.consumeBy,
      storage: formValues.storage || 'Clean covered container',
      dietType: formValues.dietType,
      allergens: formValues.allergens || 'None reported',
      status: 'published',
      location: formValues.location || 'Central Mess Dispatch',
    };

    setListings((prev) => [newListing, ...prev]);
    setFormSuccess(
      `Surplus listing "${newListing.title}" successfully published for verified recipients.`
    );
    setFormValues({
      title: '',
      category: 'cooked_meals',
      quantity: '',
      unit: 'kg',
      portions: '',
      preparedAt: '',
      consumeBy: '',
      pickupStart: '',
      pickupEnd: '',
      storage: '',
      dietType: 'vegetarian',
      allergens: '',
      location: '',
    });
    setPreviewMode(false);
  };

  const filteredListings = listings.filter((l) =>
    l.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="feature-container">
      {/* Header */}
      <div className="feature-header">
        <div>
          <h1>Donor Operations</h1>
          <p className="text-muted">Mess Surplus Declaration & Direct Collection Coordination</p>
        </div>
      </div>

      {/* View 1: Active Listings */}
      {activeTab === 'active-listings' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}
          >
            <div>
              <h2>Active Surplus Listings</h2>
              <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
                Entries available for verified charitable recipients. Direct collection only.
              </p>
            </div>
            <div>
              <input
                type="search"
                className="input-field"
                placeholder="Filter listings..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                style={{ width: '220px' }}
              />
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <EmptyState
                icon={PackageCheck}
                title="No active listings"
                description="There are currently no active surplus listings published for this mess facility."
              />
            </div>
          ) : (
            <div
              style={{
                marginTop: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="card"
                  style={{
                    padding: 'var(--space-4)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}
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
                        <StatusBadge status={listing.status} />
                        <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{listing.title}</h3>
                        <span className="badge badge-neutral">{listing.dietType}</span>
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--font-size-label)',
                          color: 'var(--color-muted)',
                          marginTop: 'var(--space-1)',
                        }}
                      >
                        Category: {listing.category} &bull; Quantity:{' '}
                        <strong>
                          {listing.quantity} {listing.unit}
                        </strong>{' '}
                        (~{listing.portions} portions)
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      {listing.status === 'published' && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{
                            minHeight: '32px',
                            padding: 'var(--space-1) var(--space-2)',
                            fontSize: 'var(--font-size-label)',
                            color: 'var(--color-danger)',
                          }}
                          onClick={() => handleWithdrawListing(listing)}
                        >
                          <Trash2 size={14} />
                          <span>Withdraw</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 'var(--space-3)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'var(--space-2)',
                      fontSize: 'var(--font-size-caption)',
                      color: 'var(--color-muted)',
                      borderTop: '1px solid var(--color-border-subtle)',
                      paddingTop: 'var(--space-2)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <Clock size={13} />
                      <span>
                        Consume by: <strong>{listing.consumeBy}</strong>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <Truck size={13} />
                      <span>
                        Pickup:{' '}
                        <strong>
                          {listing.pickupStart} &ndash; {listing.pickupEnd}
                        </strong>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <MapPin size={13} />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 2: Create Listing */}
      {activeTab === 'create-listing' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <PlusCircle size={22} color="var(--color-brand-700)" />
            <h2>Declare Food Surplus (New Listing)</h2>
          </div>
          <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
            Notify verified recipient organisations for immediate collection. Direct collection
            only.
          </p>

          {/* Zero-Cost ₹0 Spark Photo Upload Omission Banner */}
          <div
            className="notice-box"
            style={{
              marginTop: 'var(--space-3)',
              background: 'var(--color-canvas)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: 'var(--space-2)',
              fontSize: 'var(--font-size-label)',
            }}
          >
            <Info size={18} color="var(--color-brand-700)" style={{ flexShrink: 0 }} />
            <div>
              <strong>Strict Zero-Cost Architecture (No Photo Uploads):</strong> FoodBridge operates
              within the Firebase Spark free quota without paid file storage. Describe food items
              accurately using explicit weights, times, and allergens.
            </div>
          </div>

          {formSuccess && (
            <div
              className="alert alert-success"
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div
              className="alert alert-danger"
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          {previewMode ? (
            <div
              style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-4)',
                background: 'var(--color-canvas)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3>Listing Preview</h3>
              <p className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
                This is how verified recipients will view your declaration.
              </p>

              <div style={{ marginTop: 'var(--space-3)' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{formValues.title}</div>
                <div style={{ marginTop: 'var(--space-1)' }}>
                  <span className="badge badge-success">Published</span>
                  <span className="badge badge-neutral" style={{ marginLeft: '6px' }}>
                    {formValues.dietType}
                  </span>
                </div>
                <p style={{ marginTop: 'var(--space-2)' }}>
                  Quantity:{' '}
                  <strong>
                    {formValues.quantity} {formValues.unit}
                  </strong>{' '}
                  (~{formValues.portions || '40'} portions)
                </p>
                <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-muted)' }}>
                  Consume before: <strong>{formValues.consumeBy || 'N/A'}</strong> &bull; Pickup:{' '}
                  {formValues.pickupStart} &ndash; {formValues.pickupEnd}
                </p>
                <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-muted)' }}>
                  Allergens: {formValues.allergens || 'None'} &bull; Storage:{' '}
                  {formValues.storage || 'Standard'}
                </p>
              </div>

              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPreviewMode(false)}
                >
                  Back to Editing
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreateSubmit}>
                  Confirm &amp; Publish Listing
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} style={{ marginTop: 'var(--space-4)' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 'var(--space-3)',
                }}
              >
                <div className="input-group">
                  <label htmlFor="listing-title" className="input-label">
                    Surplus Food Description *
                  </label>
                  <input
                    id="listing-title"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Steamed Rice, Rajma & Roti"
                    value={formValues.title}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="listing-diet" className="input-label">
                    Dietary Classification *
                  </label>
                  <select
                    id="listing-diet"
                    className="input-field"
                    value={formValues.dietType}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, dietType: e.target.value }))
                    }
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                    <option value="halal">Halal Certified</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 'var(--space-3)',
                  marginTop: 'var(--space-3)',
                }}
              >
                <div className="input-group">
                  <label htmlFor="listing-qty" className="input-label">
                    Quantity *
                  </label>
                  <input
                    id="listing-qty"
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="input-field"
                    placeholder="e.g. 15.0"
                    value={formValues.quantity}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, quantity: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="listing-unit" className="input-label">
                    Unit *
                  </label>
                  <select
                    id="listing-unit"
                    className="input-field"
                    value={formValues.unit}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, unit: e.target.value }))}
                  >
                    <option value="kg">kg</option>
                    <option value="portions">portions</option>
                    <option value="pieces">pieces</option>
                    <option value="crates">crates</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="listing-portions" className="input-label">
                    Portions Estimate
                  </label>
                  <input
                    id="listing-portions"
                    type="number"
                    className="input-field"
                    placeholder="e.g. 45"
                    value={formValues.portions}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, portions: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-3)',
                  marginTop: 'var(--space-3)',
                }}
              >
                <div className="input-group">
                  <label htmlFor="listing-consume" className="input-label">
                    Consume-By Deadline *
                  </label>
                  <input
                    id="listing-consume"
                    type="time"
                    className="input-field"
                    value={formValues.consumeBy}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, consumeBy: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="listing-pickup-start" className="input-label">
                    Pickup Window Start
                  </label>
                  <input
                    id="listing-pickup-start"
                    type="time"
                    className="input-field"
                    value={formValues.pickupStart}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, pickupStart: e.target.value }))
                    }
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="listing-pickup-end" className="input-label">
                    Pickup Window End
                  </label>
                  <input
                    id="listing-pickup-end"
                    type="time"
                    className="input-field"
                    value={formValues.pickupEnd}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, pickupEnd: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 'var(--space-3)',
                  marginTop: 'var(--space-3)',
                }}
              >
                <div className="input-group">
                  <label htmlFor="listing-allergens" className="input-label">
                    Allergens Declaration
                  </label>
                  <input
                    id="listing-allergens"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Wheat, Milk/Dairy, Peanuts, None"
                    value={formValues.allergens}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, allergens: e.target.value }))
                    }
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="listing-storage" className="input-label">
                    Storage &amp; Hygiene Declaration
                  </label>
                  <input
                    id="listing-storage"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Kept hot above 60°C in food grade steel containers"
                    value={formValues.storage}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, storage: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginTop: 'var(--space-3)' }}>
                <label htmlFor="listing-location" className="input-label">
                  Pickup Location &amp; Instructions
                </label>
                <input
                  id="listing-location"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Kitchen Loading Bay, Door 2, North Campus Mess"
                  value={formValues.location}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div
                style={{
                  marginTop: 'var(--space-5)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 'var(--space-3)',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPreviewMode(true)}
                  disabled={!formValues.title || !formValues.quantity}
                >
                  <Eye size={16} />
                  <span>Preview Declaration</span>
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Publish Listing</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* View 3: Pickup Coordination */}
      {activeTab === 'pickup-status' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <h2>Pickup Coordination &amp; Handover</h2>
          <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
            Real-time status for claimed listings. Direct recipient collection in progress.
          </p>

          <div
            className="card"
            style={{
              marginTop: 'var(--space-4)',
              background: 'var(--color-canvas)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-warning">Claim In Progress</span>
                <h3 style={{ marginTop: 'var(--space-1)' }}>Assorted Roti & Chapati Pack</h3>
                <span style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-muted)' }}>
                  Claimed by: <strong>City Care Welfare Trust</strong> &bull; Coordinator: M. Patil
                  (+91 98200 44321)
                </span>
              </div>
              <button type="button" className="btn btn-primary">
                <CheckCircle2 size={16} />
                <span>Confirm Handover</span>
              </button>
            </div>

            <div
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-caption)',
              }}
            >
              <strong>Handover Checklist:</strong>
              <ul style={{ paddingLeft: 'var(--space-4)', marginTop: 'var(--space-1)' }}>
                <li>Recipient arrived with clean, food-grade transit vessels.</li>
                <li>Visual and smell hygiene check completed without dispute.</li>
                <li>Independent confirmation recorded in FoodBridge by both parties.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* View 4: Donation History */}
      {activeTab === 'donor-history' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <h2>Surplus Donation History</h2>
          <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
            Audit log of completed and resolved surplus redistribution transactions.
          </p>

          <div className="responsive-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Date</th>
                  <th>Quantity & Portions</th>
                  <th>Recipient / Disposition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.title}</strong>
                    </td>
                    <td>{row.date}</td>
                    <td>
                      {row.quantity} (~{row.portions} portions)
                    </td>
                    <td>{row.recipient}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Destructive Withdraw Action */}
      <ConfirmDialog
        isOpen={confirmWithdrawModal.isOpen}
        title="Withdraw Surplus Listing?"
        message={`Are you sure you want to withdraw "${confirmWithdrawModal.listing?.title}"? Verified recipients will no longer be able to claim this item.`}
        confirmLabel="Withdraw Listing"
        isDestructive={true}
        onConfirm={confirmWithdraw}
        onCancel={() => setConfirmWithdrawModal({ isOpen: false, listing: null })}
      />
    </div>
  );
}
