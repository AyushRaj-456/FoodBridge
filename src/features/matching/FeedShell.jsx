import { useState } from 'react';
import { MapPin, CheckCircle, AlertTriangle, Lock, Building, ShieldAlert } from 'lucide-react';
import { canRecipientClaim } from '../organisations/orgService.js';

export default function FeedShell({ activeTab, initialOrgStatus = 'pending' }) {
  // Recipient organisation status: 'pending', 'approved', or 'suspended'
  const [recipientOrgStatus, setRecipientOrgStatus] = useState(initialOrgStatus);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState(null);

  const isEligibleToClaim = canRecipientClaim(recipientOrgStatus);

  const handleClaim = (listingTitle) => {
    if (!isEligibleToClaim) return;
    setClaimSuccessMessage(
      `Claim initiated for "${listingTitle}". Exact address and coordinator phone number unlocked!`
    );
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <div>
          <h1>Verified Recipient Feed</h1>
          <p className="text-muted">Available Surplus Opportunities (NGO / Charitable Cohort)</p>
        </div>
      </div>

      {/* Recipient Organisation Verification Gate Banner */}
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

      <div className="card" style={{ marginTop: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Available Surplus (Straight-Line Haversine Match)</h2>
            <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
              Active View: <strong>{activeTab}</strong>. Only approved recipient organisations can
              claim.
            </p>
          </div>
          {/* Organisation Status Demo/Inspection Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Building size={16} className="text-muted" />
            <span style={{ fontSize: 'var(--font-size-caption)' }} className="text-muted">
              Org Status:
            </span>
            <select
              aria-label="Simulate Organisation Status"
              value={recipientOrgStatus}
              onChange={(e) => setRecipientOrgStatus(e.target.value)}
              className="input-field"
              style={{
                width: 'auto',
                padding: '2px 8px',
                fontSize: 'var(--font-size-caption)',
                minHeight: '28px',
              }}
            >
              <option value="pending">Pending (Unverified)</option>
              <option value="approved">Approved (Verified)</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div
          style={{
            marginTop: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div
            className="listing-row card"
            style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-neutral">Approx. 1.2 km away</span>
                <strong style={{ marginLeft: 'var(--space-2)' }}>
                  Prepared Meals (College Central Mess)
                </strong>
                <div
                  style={{
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--color-muted)',
                    marginTop: '2px',
                  }}
                >
                  Quantity: 45 meals &bull; Consume before 10:30 PM &bull; Vegetarian
                </div>
              </div>

              {isEligibleToClaim ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ minHeight: '36px', padding: 'var(--space-1) var(--space-3)' }}
                  onClick={() => handleClaim('Prepared Meals (College Central Mess)')}
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

            <div
              style={{
                marginTop: 'var(--space-2)',
                fontSize: 'var(--font-size-label)',
                color: 'var(--color-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <MapPin size={14} />
              <span>
                Coarse Location: Campus North Sector (Exact street address and coordinator phone
                revealed after claim)
              </span>
            </div>
          </div>
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
            Tier 2 (Animal Feed) and Tier 3 (Compost) routes are disabled pending competent
            authority SOP. Only approved human redistribution is enabled.
          </span>
        </div>
      </div>
    </div>
  );
}
