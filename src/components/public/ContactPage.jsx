import { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, Send } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'dining_operator',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      style={{
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        padding: 'var(--space-10) var(--gutter-desktop)',
      }}
    >
      <div style={{ maxWidth: '720px', marginBottom: 'var(--space-10)' }}>
        <span
          style={{
            fontSize: 'var(--font-size-label)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-primary)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          Institutional Inquiry &amp; Support
        </span>
        <h1
          style={{
            fontSize: 'var(--font-size-display)',
            margin: 'var(--space-2) 0 var(--space-4)',
          }}
        >
          Contact the FoodBridge Pilot Cell
        </h1>
        <p className="text-muted" style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>
          Interested in bringing the FoodBridge community network to your university campus, hostel
          dining cluster, or municipality? Reach out to our community support team.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-8)',
        }}
      >
        {/* Contact Form */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
              <CheckCircle2
                size={48}
                color="var(--color-success)"
                style={{ margin: '0 auto var(--space-3)' }}
              />
              <h3 style={{ fontSize: 'var(--font-size-section)', margin: '0 0 var(--space-2)' }}>
                Message Transmitted Successfully
              </h3>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--font-size-body)', margin: '0 0 var(--space-4)' }}
              >
                Thank you, <strong>{formData.name}</strong>. Our campus pilot coordinator will
                respond within 24 hours.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', role: 'dining_operator', message: '' });
                }}
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3
                style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-4)' }}
              >
                Send an Inquiry
              </h3>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">
                  Institutional Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  className="input-field"
                  placeholder="e.g. rajesh.kumar@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-role">
                  Your Role / Organization
                </label>
                <select
                  id="contact-role"
                  className="select-field"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="dining_operator">Campus Mess / Dining Hall Operator</option>
                  <option value="ngo">Welfare NGO / Charity Representative</option>
                  <option value="farm_compost">Cattle Farm / Biogas Facility Operator</option>
                  <option value="student_volunteer">Student Volunteer / Civic Researcher</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">
                  Message / Scope Description
                </label>
                <textarea
                  id="contact-message"
                  required
                  className="textarea-field"
                  placeholder="Describe your dining hall scale, daily volume, or partnership proposal..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
              >
                <Send size={16} />
                <span>Transmit Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Pilot Cell Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-4)' }}>
              Pilot Cell Coordination
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                fontSize: 'var(--font-size-body)',
              }}
            >
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <MapPin
                  size={20}
                  color="var(--color-primary)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div>
                  <strong>Active Pilot Location:</strong>
                  <div className="text-muted">
                    North Campus Mess 3 &bull; Kitchen Operations Cell
                  </div>
                  <div className="text-muted">Student Hostel Residential Complex</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Mail
                  size={20}
                  color="var(--color-primary)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div>
                  <strong>Pilot Cell Email:</strong>
                  <div className="text-muted">pilot@foodbridge.civic</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Phone
                  size={20}
                  color="var(--color-primary)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div>
                  <strong>Operational Helpdesk:</strong>
                  <div className="text-muted">+91 94450 99887 (Operational Meal Shift Hours)</div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-canvas)' }}
          >
            <h4 style={{ margin: '0 0 var(--space-2)', fontSize: '1rem' }}>
              Zero Vendor Lock-In &bull; Open Source
            </h4>
            <p
              className="text-muted"
              style={{ fontSize: 'var(--font-size-label)', lineHeight: 1.5, margin: 0 }}
            >
              FoodBridge code, security rules, and food-safety SOPs are released as open public
              civic assets. Any institution or community network can adopt FoodBridge with zero
              monthly licensing fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
