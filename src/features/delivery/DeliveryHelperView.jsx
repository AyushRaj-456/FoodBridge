import { useState } from 'react';
import { ShieldAlert, CheckCircle2, Star, KeyRound } from 'lucide-react';

const SAMPLE_DELIVERY_JOBS = [
  {
    id: 'job-501',
    pickupAddress: 'North Campus Mess 3 Loading Bay',
    dropoffAddress: 'City Care Orphanage, 2.4 km east',
    packageDesc: '2 Insulated Stainless Food Boxes (18 kg Cooked Rice & Dal)',
    pickupDeadline: '21:00 Today',
    stipendOffer: '₹120 Community Micro-Stipend',
    status: 'available',
  },
  {
    id: 'job-502',
    pickupAddress: 'Engineering Cafeteria Dispatch Counter',
    dropoffAddress: 'Shree Krishna Gaushala, 4.2 km south',
    packageDesc: '3 Covered Sacks Clean Veg Trimmings (45 kg Cattle Feed)',
    pickupDeadline: '17:30 Today',
    stipendOffer: '₹180 Volunteer Travel Allowance',
    status: 'assigned',
  },
];

export default function DeliveryHelperView() {
  const [activeTab, setActiveTab] = useState('nearby-jobs');
  const [otpInput, setOtpInput] = useState('');
  const [verifiedJob, setVerifiedJob] = useState(null);

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpInput.length === 6) {
      setVerifiedJob('job-501');
    }
  };

  return (
    <div className="feature-container">
      {/* Prominent Architectural Future Label (Section 14) */}
      <div
        className="notice-box"
        style={{
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-warning-bg)',
          border: '1px solid var(--color-warning)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'flex-start',
          marginBottom: 'var(--space-6)',
        }}
      >
        <ShieldAlert
          size={22}
          color="var(--color-warning)"
          style={{ flexShrink: 0, marginTop: '2px' }}
        />
        <div>
          <strong style={{ color: 'var(--color-warning)' }}>
            Future Architecture Specification (Section 14 &bull; Non-Operational In Spark Baseline):
          </strong>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 'var(--font-size-label)',
              color: 'var(--color-text)',
              lineHeight: 1.5,
            }}
          >
            This delivery helper interface represents the planned architectural interface for future
            student micro-stipend courier workflows. In accordance with zero-cost Spark constraints,
            volunteer logistics currently rely on direct bilateral pickup between donors and
            recipient vehicles.
          </p>
        </div>
      </div>

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
            <span className="badge badge-warning">Future Module Preview</span>
          </div>
          <h1>Delivery Helper Coordination Console</h1>
          <p className="text-muted">
            Micro-stipend volunteer routing &bull; End-to-end handover with cryptographic OTP
            verification
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav" style={{ marginTop: 'var(--space-4)' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'nearby-jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('nearby-jobs')}
        >
          Nearby Delivery Jobs
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'otp-verify' ? 'active' : ''}`}
          onClick={() => setActiveTab('otp-verify')}
        >
          Handover OTP Verification
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'helper-profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('helper-profile')}
        >
          Helper Registration &amp; Ratings
        </button>
      </div>

      {/* Tab 1: Nearby Jobs */}
      {activeTab === 'nearby-jobs' && (
        <div
          style={{
            marginTop: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {SAMPLE_DELIVERY_JOBS.map((job) => (
            <div key={job.id} className="card" style={{ padding: 'var(--space-5)' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'gap',
                  gap: 'var(--space-2)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className="badge badge-info">{job.status.toUpperCase()}</span>
                    <strong style={{ fontSize: '1rem' }}>{job.packageDesc}</strong>
                  </div>
                  <div className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                    Pickup: <strong>{job.pickupAddress}</strong> &rarr; Dropoff:{' '}
                    <strong>{job.dropoffAddress}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}
                  >
                    {job.stipendOffer}
                  </div>
                  <span className="text-muted" style={{ fontSize: '11px' }}>
                    Distance: ~2.4 km
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 'var(--space-4)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span className="text-muted" style={{ fontSize: '12px' }}>
                  Deadline: <strong>{job.pickupDeadline}</strong>
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('otp-verify')}
                >
                  Inspect Delivery Route &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: OTP Verification */}
      {activeTab === 'otp-verify' && (
        <div
          className="card"
          style={{ marginTop: 'var(--space-5)', padding: 'var(--space-6)', maxWidth: '540px' }}
        >
          <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-2)' }}>
            Recipient Dropoff OTP Verification
          </h3>
          <p
            className="text-muted"
            style={{ fontSize: 'var(--font-size-body)', marginBottom: 'var(--space-4)' }}
          >
            To protect food provenance and eliminate dispute risks, the recipient organization
            provides a 6-digit cryptographic completion token upon receiving the batch.
          </p>

          {verifiedJob ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
              <CheckCircle2
                size={44}
                color="var(--color-success)"
                style={{ margin: '0 auto var(--space-2)' }}
              />
              <h4>Handover Verified Successfully</h4>
              <p className="text-muted" style={{ fontSize: 'var(--font-size-label)' }}>
                Stipend ₹120 credited to volunteer ledger. Recipient feedback logged.
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label className="form-label" htmlFor="delivery-otp">
                  Enter 6-Digit Recipient OTP
                </label>
                <input
                  id="delivery-otp"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 842915"
                  className="input-field"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  style={{
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    letterSpacing: '4px',
                    fontWeight: 700,
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
              >
                <KeyRound size={16} />
                <span>Verify &amp; Finalize Delivery Handover</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: Helper Profile */}
      {activeTab === 'helper-profile' && (
        <div className="card" style={{ marginTop: 'var(--space-5)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-3)' }}>
            Volunteer Courier Profile
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <div>
              <strong>Volunteer Name:</strong>
              <div className="text-muted">Karthik R. (Campus Student Council)</div>
            </div>
            <div>
              <strong>Reliability Rating:</strong>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--color-accent)',
                }}
              >
                <Star size={16} fill="currentColor" />
                <strong style={{ color: 'var(--color-text)' }}>4.95 / 5.0</strong>
                <span className="text-muted" style={{ fontSize: '11px' }}>
                  (22 completed deliveries)
                </span>
              </div>
            </div>
            <div>
              <strong>Transport Mode:</strong>
              <div className="text-muted">Bicycle with Rear Insulated Panniers</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
