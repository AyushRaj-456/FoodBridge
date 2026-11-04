import { useState } from 'react';
import {
  MapPin,
  CheckCircle,
  AlertTriangle,
  Lock,
  Building,
  ShieldAlert,
  Clock,
  Truck,
  HeartHandshake,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import { canRecipientClaim } from '../organisations/orgService.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import MapView from '../location/MapView.jsx';
import { DEFAULT_CAMPUS_LANDMARKS } from '../location/locationService.js';

const SAMPLE_SURPLUS_OPPORTUNITIES = [
  {
    id: 'opp-201',
    title: 'Prepared Meals: Steamed Rice & Dal Tadka',
    donorOrg: 'Central Campus Hostel Mess 3',
    quantity: 18,
    unit: 'kg',
    portions: 55,
    distanceKm: 1.2,
    lat: 13.0827,
    lng: 80.2707,
    consumeBy: '23:00',
    pickupStart: '20:30',
    pickupEnd: '22:00',
    dietType: 'Vegetarian',
    allergens: 'None',
    coarseLocation: 'North Campus Sector B',
    exactAddress: 'Kitchen Loading Bay, Gate 4, Central Mess 3',
    contactPerson: 'Mr. Raman (+91 94450 99887)',
    status: 'published',
  },
  {
    id: 'opp-202',
    title: 'Vegetable Pulao & Raita',
    donorOrg: 'Engineering Cafeteria',
    quantity: 12,
    unit: 'kg',
    portions: 35,
    distanceKm: 2.4,
    lat: 13.0862,
    lng: 80.2751,
    consumeBy: '22:30',
    pickupStart: '21:00',
    pickupEnd: '22:00',
    dietType: 'Vegetarian',
    allergens: 'Milk/Dairy (Raita)',
    coarseLocation: 'Engineering Complex, East Wing',
    exactAddress: 'Cafeteria Dispatch Pantry, Floor 1',
    contactPerson: 'Chef Anand (+91 98210 55443)',
    status: 'published',
  },
];

const SAMPLE_ACTIVE_CLAIMS = [
  {
    id: 'clm-301',
    listingId: 'opp-201',
    title: 'Cooked Rice & Dal (Hostel Block A)',
    donorOrg: 'Central Campus Hostel Mess',
    quantity: '15 kg (~45 portions)',
    claimedAt: '20:15',
    pickupDeadline: '22:00',
    exactAddress: 'North Campus Dining Complex, Kitchen Door 2',
    coordinatorContact: 'M. K. Ramanathan (+91 94450 99887)',
    status: 'claimed',
  },
];

const SAMPLE_RECIPIENT_HISTORY = [
  {
    id: 'clm-hist-01',
    title: 'Steamed Rice & Lentil Curry',
    date: 'Nov 03, 2026',
    donor: 'Central Mess 3',
    quantity: '20 kg',
    portions: 60,
    status: 'completed',
  },
  {
    id: 'clm-hist-02',
    title: 'Chapati & Mix Veg',
    date: 'Nov 01, 2026',
    donor: 'Engineering Cafeteria',
    quantity: '15 kg',
    portions: 45,
    status: 'completed',
  },
];

export default function FeedShell({ activeTab, initialOrgStatus = 'pending' }) {
  const [recipientOrgStatus, setRecipientOrgStatus] = useState(initialOrgStatus);
  const [dietFilter, setDietFilter] = useState('all');
  const [claims, setClaims] = useState(SAMPLE_ACTIVE_CLAIMS);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState(null);
  const [userLocation, setUserLocation] = useState({
    lat: DEFAULT_CAMPUS_LANDMARKS[0].lat,
    lng: DEFAULT_CAMPUS_LANDMARKS[0].lng,
    name: DEFAULT_CAMPUS_LANDMARKS[0].name,
  });

  // Handover confirmation state
  const [handoverDetails, setHandoverDetails] = useState({
    actualQty: '15',
    conditionVerified: true,
    recipientNotes: '',
    confirmed: false,
  });

  const isEligibleToClaim = canRecipientClaim(recipientOrgStatus);

  const handleClaim = (opp) => {
    if (!isEligibleToClaim) return;
    const newClaim = {
      id: `clm-${Date.now().toString().slice(-4)}`,
      listingId: opp.id,
      title: opp.title,
      donorOrg: opp.donorOrg,
      quantity: `${opp.quantity} ${opp.unit} (~${opp.portions} portions)`,
      claimedAt: 'Just now',
      pickupDeadline: opp.pickupEnd,
      exactAddress: opp.exactAddress,
      coordinatorContact: opp.contactPerson,
      status: 'claimed',
    };
    setClaims((prev) => [newClaim, ...prev]);
    setClaimSuccessMessage(
      `Claim initiated for "${opp.title}". Exact address and coordinator phone number unlocked!`
    );
  };

  const filteredOpportunities = SAMPLE_SURPLUS_OPPORTUNITIES.filter((opp) => {
    if (dietFilter === 'all') return true;
    return opp.dietType.toLowerCase() === dietFilter.toLowerCase();
  });

  return (
    <div className="feature-container">
      {/* Header */}
      <div className="feature-header">
        <div>
          <h1>Verified Recipient Feed &amp; Claims</h1>
          <p className="text-muted">Direct Redistribution Network for Verified Welfare Groups</p>
        </div>
      </div>

      {/* Recipient Verification Required Banner */}
      {!isEligibleToClaim && (
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
            color: 'var(--color-warning)',
          }}
        >
          <ShieldAlert size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>
              Recipient Verification Required (Status: {recipientOrgStatus.toUpperCase()})
            </strong>
            <p style={{ marginTop: '2px', fontSize: 'var(--font-size-label)' }}>
              Under FoodBridge safety protocols, unapproved recipient organisations cannot claim
              surplus food. An administrator must complete offline verification of your society or
              trust registration before claiming privileges are enabled.
            </p>
          </div>
        </div>
      )}

      {claimSuccessMessage && (
        <div
          className="notice-box"
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3)',
            background: 'var(--color-success-bg)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            fontSize: 'var(--font-size-label)',
          }}
        >
          <CheckCircle size={18} style={{ display: 'inline', marginRight: '6px' }} />
          <span>{claimSuccessMessage}</span>
        </div>
      )}

      {/* View 1: Available Feed */}
      {activeTab === 'available-feed' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <h2>Surplus Opportunities (Haversine Straight-Line Match)</h2>
              <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
                Active View: <strong>Available Feed</strong>. Exact pickup coordinates unlock upon
                successful claim.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <select
                aria-label="Filter by Diet"
                value={dietFilter}
                onChange={(e) => setDietFilter(e.target.value)}
                className="input-field"
                style={{ width: 'auto', padding: '2px 8px', minHeight: '32px' }}
              >
                <option value="all">All Diet Types</option>
                <option value="vegetarian">Vegetarian Only</option>
                <option value="vegan">Vegan Only</option>
              </select>

              {/* Status Simulation Tool for Dev / Testing */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <Building size={14} className="text-muted" />
                <select
                  aria-label="Simulate Organisation Status"
                  value={recipientOrgStatus}
                  onChange={(e) => setRecipientOrgStatus(e.target.value)}
                  className="input-field"
                  style={{
                    width: 'auto',
                    padding: '2px 8px',
                    fontSize: 'var(--font-size-caption)',
                    minHeight: '32px',
                  }}
                >
                  <option value="pending">Pending (Unverified)</option>
                  <option value="approved">Approved (Verified)</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Proximity Map & Proximity Fallback View */}
          <div style={{ marginTop: 'var(--space-4)' }}>
            <MapView
              opportunities={filteredOpportunities}
              userLocation={userLocation}
              onUserLocationChange={setUserLocation}
              onSelectOpportunity={handleClaim}
              isEligibleToClaim={isEligibleToClaim}
            />
          </div>

          <div
            style={{
              marginTop: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            {filteredOpportunities.map((opp) => (
              <div
                key={opp.id}
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
                      <span className="badge badge-neutral">Approx. {opp.distanceKm} km away</span>
                      <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{opp.title}</h3>
                      <span className="badge badge-success">{opp.dietType}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-label)',
                        color: 'var(--color-muted)',
                        marginTop: 'var(--space-1)',
                      }}
                    >
                      Donor: <strong>{opp.donorOrg}</strong> &bull; Quantity:{' '}
                      <strong>
                        {opp.quantity} {opp.unit}
                      </strong>{' '}
                      (~{opp.portions} meals)
                    </div>
                  </div>

                  <div>
                    {isEligibleToClaim ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ minHeight: '36px', padding: 'var(--space-1) var(--space-3)' }}
                        onClick={() => handleClaim(opp)}
                      >
                        <CheckCircle size={16} />
                        <span>Claim Surplus</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled
                        title="Unapproved recipient organisations cannot claim. Offline verification required."
                        style={{
                          minHeight: '36px',
                          padding: 'var(--space-1) var(--space-3)',
                          opacity: 0.6,
                          cursor: 'not-allowed',
                        }}
                      >
                        <Lock size={14} />
                        <span>Claims Disabled (Unapproved)</span>
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
                      Consume before: <strong>{opp.consumeBy}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <Truck size={13} />
                    <span>
                      Pickup Window:{' '}
                      <strong>
                        {opp.pickupStart} &ndash; {opp.pickupEnd}
                      </strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <MapPin size={13} />
                    <span>Coarse: {opp.coarseLocation} (Exact address unlocked upon claim)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="notice-box"
            style={{
              marginTop: 'var(--space-6)',
              padding: 'var(--space-3)',
              background: 'var(--color-warning-bg)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: 'var(--space-2)',
              color: 'var(--color-warning)',
            }}
          >
            <AlertTriangle size={18} />
            <span style={{ fontSize: 'var(--font-size-label)' }}>
              Tier 2 (Animal Feed) and Tier 3 (Compost) routes are gated by competent authority
              SOPs. Only approved human redistribution is enabled for verified welfare recipients.
            </span>
          </div>
        </div>
      )}

      {/* View 2: Active Claims */}
      {activeTab === 'my-claims' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <h2>My Active Claims</h2>
          <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
            Surplus assigned to your organization. Complete collection before the deadline.
          </p>

          {claims.length === 0 ? (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <EmptyState
                icon={HeartHandshake}
                title="No active claims"
                description="Your organisation has no active claims in progress. Browse the surplus feed to claim available food."
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
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="card"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <StatusBadge status={claim.status} />
                      <h3 style={{ marginTop: 'var(--space-1)' }}>{claim.title}</h3>
                      <div
                        style={{
                          fontSize: 'var(--font-size-label)',
                          color: 'var(--color-muted)',
                        }}
                      >
                        Donor: <strong>{claim.donorOrg}</strong> &bull; Allocated:{' '}
                        <strong>{claim.quantity}</strong>
                      </div>
                    </div>
                    <span className="badge badge-warning">Deadline: {claim.pickupDeadline}</span>
                  </div>

                  {/* Exact Location Partition Reveal */}
                  <div
                    style={{
                      marginTop: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      background: 'var(--color-brand-100)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-label)',
                    }}
                  >
                    <div>
                      <MapPin
                        size={15}
                        style={{
                          display: 'inline',
                          marginRight: '6px',
                          color: 'var(--color-brand-700)',
                        }}
                      />
                      <strong>Exact Pickup Location:</strong> {claim.exactAddress}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <strong>Coordinator Contact:</strong> <code>{claim.coordinatorContact}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 3: Handover & Collect */}
      {activeTab === 'handover-confirm' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FileCheck2 size={22} color="var(--color-brand-700)" />
            <h2>Handover &amp; Dual Confirmation</h2>
          </div>
          <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
            Confirm receipt, inspect food hygiene, and log actual received quantity.
          </p>

          {handoverDetails.confirmed ? (
            <div
              className="alert alert-success"
              style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-4)',
                background: 'var(--color-success-bg)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <CheckCircle2 size={24} color="var(--color-success)" />
                <strong>Handover Recorded &amp; Completed!</strong>
              </div>
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-label)' }}>
                Transaction resolved. Actual quantity logged: {handoverDetails.actualQty} kg.
                Surplus marked completed in audit records.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setHandoverDetails((prev) => ({ ...prev, confirmed: true }));
              }}
              style={{ marginTop: 'var(--space-4)', maxWidth: '540px' }}
            >
              <div className="input-group">
                <label htmlFor="handover-qty" className="input-label">
                  Actual Received Quantity (kg) *
                </label>
                <input
                  id="handover-qty"
                  type="number"
                  step="0.5"
                  min="0.5"
                  className="input-field"
                  value={handoverDetails.actualQty}
                  onChange={(e) =>
                    setHandoverDetails((prev) => ({ ...prev, actualQty: e.target.value }))
                  }
                  required
                />
              </div>

              <div style={{ marginTop: 'var(--space-3)' }}>
                <label style={{ display: 'flex', gap: 'var(--space-2)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={handoverDetails.conditionVerified}
                    onChange={(e) =>
                      setHandoverDetails((prev) => ({
                        ...prev,
                        conditionVerified: e.target.checked,
                      }))
                    }
                    required
                  />
                  <span style={{ fontSize: 'var(--font-size-label)' }}>
                    <strong>Food Hygiene &amp; Quality Verified:</strong> Inspected visually and by
                    smell. Food is suitable for distribution to verified beneficiaries.
                  </span>
                </label>
              </div>

              <div style={{ marginTop: 'var(--space-4)' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!handoverDetails.conditionVerified}
                >
                  <CheckCircle2 size={16} />
                  <span>Confirm Receipt &amp; Complete Handover</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* View 4: Claim History */}
      {activeTab === 'recipient-history' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <h2>Surplus Redistribution History</h2>
          <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
            Historical record of all received donations and verified community impact.
          </p>

          <div className="responsive-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Date</th>
                  <th>Donor Facility</th>
                  <th>Quantity Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_RECIPIENT_HISTORY.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.title}</strong>
                    </td>
                    <td>{row.date}</td>
                    <td>{row.donor}</td>
                    <td>
                      {row.quantity} (~{row.portions} beneficiaries)
                    </td>
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
    </div>
  );
}
