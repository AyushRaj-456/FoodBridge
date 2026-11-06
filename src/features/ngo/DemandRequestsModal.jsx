import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import Modal from '../../components/common/Modal.jsx';

export default function DemandRequestsModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '60',
    foodPreference: 'vegetarian',
    requiredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    requiredTime: '13:00',
    purpose: 'Community Shelter Evening Meal Drive',
    location: 'Gandhi Nagar Community Center Hall 2',
    additionalInfo: 'Insulated transport boxes ready. Can arrange volunteer collection.',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      role="dialog"
      aria-modal="true"
      title="Publish Demand-Side Food Requirement"
      subtitle="Broadcast your meal requirements to nearby dining halls and hostels in advance."
      maxWidth="580px"
      footer={
        submitted ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleSubmit}>
              <Send size={14} />
              <span>Broadcast Request</span>
            </button>
          </div>
        )
      }
    >
      {submitted ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
          <CheckCircle2
            size={44}
            color="var(--color-success)"
            style={{ margin: '0 auto var(--space-2)' }}
          />
          <h3 style={{ margin: '0 0 var(--space-1)', fontSize: '1.2rem' }}>
            Demand Request Broadcasted
          </h3>
          <p
            className="text-muted"
            style={{ fontSize: 'var(--font-size-body)', maxWidth: '420px', margin: '0 auto' }}
          >
            Your request for{' '}
            <strong>
              {formData.quantity} {formData.foodPreference} meals
            </strong>{' '}
            has been transmitted to 3 participating dining halls within 5 km.
          </p>

          <div
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-canvas)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: '12px',
              textAlign: 'left',
            }}
          >
            <div>
              <strong>Status:</strong> <span className="badge badge-info">Active Broadcast</span>
            </div>
            <div style={{ marginTop: '4px' }}>
              <strong>Matching Mess Operators:</strong> North Campus Mess 3, Engineering Cafeteria
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="demand-qty">
                Required Meals / Portions
              </label>
              <input
                id="demand-qty"
                type="number"
                min="1"
                required
                className="input-field"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="demand-pref">
                Dietary Preference
              </label>
              <select
                id="demand-pref"
                className="select-field"
                value={formData.foodPreference}
                onChange={(e) => setFormData({ ...formData, foodPreference: e.target.value })}
              >
                <option value="vegetarian">Strict Vegetarian</option>
                <option value="any">Any (Veg / Non-Veg)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="demand-date">
                Required Date
              </label>
              <input
                id="demand-date"
                type="date"
                required
                className="input-field"
                value={formData.requiredDate}
                onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="demand-time">
                Target Serving Time
              </label>
              <input
                id="demand-time"
                type="time"
                required
                className="input-field"
                value={formData.requiredTime}
                onChange={(e) => setFormData({ ...formData, requiredTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="demand-purpose">
              Relief Purpose / Program
            </label>
            <input
              id="demand-purpose"
              type="text"
              required
              className="input-field"
              placeholder="e.g. Daily Children's Shelter Dinner"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="demand-location">
              Distribution Location &amp; Reach
            </label>
            <input
              id="demand-location"
              type="text"
              required
              className="input-field"
              placeholder="e.g. Gandhi Nagar Shelter Hall 2"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="demand-notes">
              Logistics &amp; Transport Equipment
            </label>
            <textarea
              id="demand-notes"
              className="textarea-field"
              placeholder="Insulated container availability, vehicle access, etc."
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
