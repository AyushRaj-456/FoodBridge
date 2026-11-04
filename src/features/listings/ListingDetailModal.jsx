import { X, MapPin, ShieldCheck, AlertTriangle } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge.jsx';

export default function ListingDetailModal({
  listing,
  isOpen,
  onClose,
  onEdit,
  onWithdraw,
  onPublish,
}) {
  if (!isOpen || !listing) return null;

  const isExpired = listing.isExpired || listing.status === 'expired';
  const canEdit = ['draft', 'published'].includes(listing.status) && !isExpired;
  const isDraft = listing.status === 'draft';

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-detail-title"
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--color-surface)',
          padding: 'var(--space-5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <StatusBadge status={listing.status} />
              <span className="badge badge-neutral">{listing.dietType || 'Standard'}</span>
              <span className="badge badge-neutral">Tier: {listing.routeTier || 'human'}</span>
            </div>
            <h2 id="listing-detail-title" style={{ marginTop: 'var(--space-2)' }}>
              {listing.title}
            </h2>
            <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}>
              Listing Ref: <code>{listing.id}</code> &bull; Donor Org: {listing.donorOrgId}
            </div>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close details modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Expiry Alert Banner */}
        {isExpired && (
          <div
            className="notice-box"
            style={{
              marginTop: 'var(--space-3)',
              padding: 'var(--space-3)',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--font-size-label)',
            }}
          >
            <AlertTriangle size={18} />
            <span>
              <strong>Listing Expired:</strong> Consume-by deadline has passed. This surplus item
              can no longer be claimed for human consumption under food-safety SOP.
            </span>
          </div>
        )}

        {/* Quantities & Timing Grid */}
        <div
          style={{
            marginTop: 'var(--space-4)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
            background: 'var(--color-canvas)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div>
            <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
              Surplus Quantity
            </span>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'var(--color-brand-900)',
                marginTop: '2px',
              }}
            >
              {listing.quantity} {listing.unit}
            </div>
            <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}>
              Portions: ~{listing.portions || Math.round(listing.quantity * 3)}
            </span>
          </div>

          <div>
            <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
              Prepared Timestamp
            </span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>
              {listing.preparedAt || 'Not specified'}
            </div>
          </div>

          <div>
            <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
              Consume-By Deadline
            </span>
            <div
              style={{
                fontWeight: 600,
                color: isExpired ? 'var(--color-danger)' : 'var(--color-brand-900)',
                marginTop: '2px',
              }}
            >
              {listing.consumeBy}
            </div>
          </div>

          <div>
            <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
              Pickup Window
            </span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>
              {listing.pickupStart} &ndash; {listing.pickupEnd}
            </div>
          </div>
        </div>

        {/* Food Safety & Handling Details */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Food Safety &amp; Handling Details</h3>
          <div
            style={{
              marginTop: 'var(--space-2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              fontSize: 'var(--font-size-label)',
            }}
          >
            <div>
              <span className="text-muted">Storage Declaration:</span>{' '}
              <strong>{listing.storageDeclaration || 'Standard covered food-grade vessel'}</strong>
            </div>
            <div>
              <span className="text-muted">Allergens Declared:</span>{' '}
              <strong>{listing.allergens || 'None reported'}</strong>
            </div>
            <div>
              <span className="text-muted">Category:</span>{' '}
              <strong>{listing.category || 'Cooked Meals'}</strong>
            </div>
          </div>
        </div>

        {/* Location & Instructions */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Collection Location</h3>
          <div
            style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-3)',
              background: 'var(--color-canvas)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-label)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <MapPin
                size={16}
                color="var(--color-brand-700)"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <strong>Coarse Location:</strong> {listing.location}
                {listing.fulfillment?.exactAddress && (
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <strong>Exact Address (Partitioned):</strong> {listing.fulfillment.exactAddress}
                  </div>
                )}
                {listing.fulfillment?.contactPhone && (
                  <div style={{ marginTop: 'var(--space-1)' }}>
                    <strong>Coordinator Phone:</strong>{' '}
                    <code>{listing.fulfillment.contactPhone}</code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Zero-Cost ₹0 Architecture Notice */}
        <div
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <ShieldCheck size={16} />
          <span>Spark ₹0 Invariant: No photo uploads stored. Expiry checked at read time.</span>
        </div>

        {/* Actions */}
        <div
          style={{
            marginTop: 'var(--space-5)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>

          {isDraft && onPublish && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onPublish(listing);
                onClose();
              }}
            >
              Publish Listing
            </button>
          )}

          {canEdit && onEdit && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                onEdit(listing);
                onClose();
              }}
            >
              Edit Details
            </button>
          )}

          {listing.status === 'published' && onWithdraw && !isExpired && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: 'var(--color-danger)' }}
              onClick={() => {
                onWithdraw(listing);
                onClose();
              }}
            >
              Withdraw
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
