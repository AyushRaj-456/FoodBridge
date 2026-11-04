import { useState } from 'react';
import {
  Utensils,
  HeartHandshake,
  Wheat,
  Recycle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import { createOrganisationApplication } from './orgService.js';
import './org.css';

const ORG_TYPES_CONFIG = [
  {
    id: 'donor',
    label: 'Food Donor',
    icon: Utensils,
    subtitle: 'University Mess, Canteen, Caterer, Restaurant',
    regLabel: 'FSSAI License / Institutional Reg No.',
    regPlaceholder: 'e.g. 10019011000123 / IITB-MESS-04',
    capacityLabel: 'Daily Surplus Capacity (Estimated Meals/day)',
    capacityPlaceholder: 'e.g. 50-150 meals',
  },
  {
    id: 'recipient',
    label: 'Food Relief NGO',
    icon: HeartHandshake,
    subtitle: 'Verified Charitable NGO, Shelter, Community Kitchen',
    regLabel: 'NGO Darpan / Society / Trust Reg No.',
    regPlaceholder: 'e.g. MH/2021/0284912 / 12A-Trust-88',
    capacityLabel: 'Daily Beneficiary Serving Capacity',
    capacityPlaceholder: 'e.g. 100-300 individuals',
  },
  {
    id: 'farm',
    label: 'Livestock / Cattle Farm',
    icon: Wheat,
    subtitle: 'Dairy Farm, Gaushala, Livestock Feed (Gated SOP)',
    regLabel: 'Farm Registry / Panchayat Animal Welfare License',
    regPlaceholder: 'e.g. DL-FARM-2023-991',
    capacityLabel: 'Cattle / Animal Head Count',
    capacityPlaceholder: 'e.g. 45 cattle heads',
  },
  {
    id: 'facility',
    label: 'Compost & Bio-energy',
    icon: Recycle,
    subtitle: 'Municipal / Campus Organic Recycling Unit (Gated SOP)',
    regLabel: 'Pollution Control / Solid Waste Facility Reg',
    regPlaceholder: 'e.g. SWM-FACILITY-2024-001',
    capacityLabel: 'Daily Compost Processing Capacity (kg)',
    capacityPlaceholder: 'e.g. 500 kg/day',
  },
];

export default function OrgOnboardingForm({ onSuccess, onCancel }) {
  const { user } = useAuth();

  const [type, setType] = useState('donor');
  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [addressText, setAddressText] = useState('');
  const [contactPerson, setContactPerson] = useState(user?.displayName || '');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [regNumber, setRegNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [notes, setNotes] = useState('');

  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedOrg, setSubmittedOrg] = useState(null);

  const selectedTypeConfig = ORG_TYPES_CONFIG.find((cfg) => cfg.id === type) || ORG_TYPES_CONFIG[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to submit an organisation application.');
      return;
    }

    if (!declarationAgreed) {
      setError('You must confirm the offline verification declaration before submitting.');
      return;
    }

    setLoading(true);

    try {
      const res = await createOrganisationApplication(
        {
          type,
          legalName,
          displayName,
          addressText,
          contactPerson,
          contactPhone,
          contactEmail,
          regNumber,
          capacity,
          operatingHours,
          notes,
        },
        user
      );

      setSubmittedOrg(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setError(err.message || 'Failed to submit organisation onboarding application.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedOrg) {
    return (
      <div className="card org-onboarding-container" style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            padding: 'var(--space-3)',
            color: 'var(--color-success)',
          }}
        >
          <CheckCircle2 size={48} />
        </div>
        <h2>Application Submitted for Offline Review</h2>
        <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
          Organisation Reference ID: <code>{submittedOrg.orgId}</code>
        </p>

        <div
          className="notice-box"
          style={{
            marginTop: 'var(--space-4)',
            textAlign: 'left',
            background: 'var(--color-brand-50)',
            border: '1px solid var(--color-brand-200)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <strong>Status: Pending Verification</strong>
          <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-label)' }}>
            Under FoodBridge&apos;s ₹0 Spark architecture, an administrator will verify your legal
            registration details and contact information offline. Recipient claiming capabilities
            will activate once an administrator records verification approval.
          </p>
        </div>

        <div
          style={{
            marginTop: 'var(--space-6)',
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSubmittedOrg(null);
              if (onCancel) onCancel();
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="org-onboarding-container">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Building size={24} color="var(--color-brand-600)" />
          <h2>Organisation Onboarding & Verification Application</h2>
        </div>
        <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
          Register your campus mess, food-recovery NGO, cattle farm, or organic compost unit.
        </p>

        {/* ₹0 Spark Invariant Offline Verification Banner */}
        <div className="zero-cost-notice">
          <ShieldCheck size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Offline Document Verification (₹0 Zero-Cost Architecture):</strong>
            <p style={{ marginTop: '2px' }}>
              FoodBridge operates strictly within the Firebase Spark free tier without file uploads.
              Do NOT attempt to upload scans or photos. Our verification team verifies government
              registrations (FSSAI, 12A/80G, NGO Darpan, RoC) offline before activating recipient
              claims.
            </p>
          </div>
        </div>

        {error && (
          <div
            className="alert alert-error"
            style={{
              marginTop: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--font-size-label)',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-4)' }}>
          {/* Organisation Type Selection */}
          <label className="input-label" style={{ fontWeight: 600 }}>
            Select Organisation Type *
          </label>
          <div className="org-type-grid" role="radiogroup" aria-label="Organisation Type">
            {ORG_TYPES_CONFIG.map((cfg) => {
              const Icon = cfg.icon;
              const isSelected = type === cfg.id;
              return (
                <button
                  key={cfg.id}
                  type="button"
                  className={`org-type-card ${isSelected ? 'selected' : ''}`}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setType(cfg.id)}
                >
                  <div className="icon-wrapper">
                    <Icon size={24} />
                  </div>
                  <div className="org-type-title">{cfg.label}</div>
                  <div className="org-type-subtitle">{cfg.subtitle}</div>
                </button>
              );
            })}
          </div>

          {/* Legal and Public Name */}
          <div className="form-grid-2" style={{ marginTop: 'var(--space-4)' }}>
            <div className="input-group">
              <label htmlFor="org-legal-name" className="input-label">
                Official Legal Entity Name *
              </label>
              <input
                id="org-legal-name"
                type="text"
                className="input-field"
                placeholder="e.g. Central University Hostel Mess Trust"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="org-display-name" className="input-label">
                Public Display / Common Name *
              </label>
              <input
                id="org-display-name"
                type="text"
                className="input-field"
                placeholder="e.g. Hostel 4 Central Kitchen"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Registration Number & Capacity */}
          <div className="form-grid-2" style={{ marginTop: 'var(--space-3)' }}>
            <div className="input-group">
              <label htmlFor="org-reg-number" className="input-label">
                {selectedTypeConfig.regLabel} *
              </label>
              <input
                id="org-reg-number"
                type="text"
                className="input-field"
                placeholder={selectedTypeConfig.regPlaceholder}
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="org-capacity" className="input-label">
                {selectedTypeConfig.capacityLabel}
              </label>
              <input
                id="org-capacity"
                type="text"
                className="input-field"
                placeholder={selectedTypeConfig.capacityPlaceholder}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>

          {/* Physical Address */}
          <div className="input-group" style={{ marginTop: 'var(--space-3)' }}>
            <label htmlFor="org-address" className="input-label">
              Physical Location & Street Address *
            </label>
            <textarea
              id="org-address"
              className="input-field"
              rows={2}
              placeholder="e.g. Gate 2, North Campus, University Road, Pin 400076"
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              required
            />
          </div>

          {/* Primary Coordinator Contact Information */}
          <div className="form-grid-2" style={{ marginTop: 'var(--space-3)' }}>
            <div className="input-group">
              <label htmlFor="org-contact-person" className="input-label">
                Authorized Contact Person / Coordinator *
              </label>
              <input
                id="org-contact-person"
                type="text"
                className="input-field"
                placeholder="e.g. Prof. R. Sharma / Mess Secretary"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="org-contact-phone" className="input-label">
                Contact Phone Number (Offline Coordinator) *
              </label>
              <input
                id="org-contact-phone"
                type="tel"
                className="input-field"
                placeholder="e.g. +91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid-2" style={{ marginTop: 'var(--space-3)' }}>
            <div className="input-group">
              <label htmlFor="org-contact-email" className="input-label">
                Official Entity Email *
              </label>
              <input
                id="org-contact-email"
                type="email"
                className="input-field"
                placeholder="e.g. mess@university.ac.in"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="org-hours" className="input-label">
                Operating / Receiving Hours
              </label>
              <input
                id="org-hours"
                type="text"
                className="input-field"
                placeholder="e.g. 7:00 AM - 10:30 PM daily"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="input-group" style={{ marginTop: 'var(--space-3)' }}>
            <label htmlFor="org-notes" className="input-label">
              Special Handling or Dietary Requirements / Notes
            </label>
            <input
              id="org-notes"
              type="text"
              className="input-field"
              placeholder="e.g. Has refrigeration, accepts vegetarian and non-vegetarian surplus"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Mandatory Offline Verification Acknowledgment */}
          <div
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'var(--color-canvas)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <label style={{ display: 'flex', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={declarationAgreed}
                onChange={(e) => setDeclarationAgreed(e.target.checked)}
                style={{ marginTop: '3px' }}
                required
              />
              <span style={{ fontSize: 'var(--font-size-label)' }}>
                <strong>Declaration & Offline Review Agreement:</strong> I certify that all details
                provided are accurate. I acknowledge that FoodBridge verifies registration offline
                and does not store document scans. I understand recipient claiming remains disabled
                until an administrator approves this application.
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div
            style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
            }}
          >
            {onCancel && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !declarationAgreed}
            >
              {loading ? 'Submitting Application...' : 'Submit Application for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
