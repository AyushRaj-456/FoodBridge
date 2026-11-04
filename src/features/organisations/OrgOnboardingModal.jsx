import { X } from 'lucide-react';
import OrgOnboardingForm from './OrgOnboardingForm.jsx';
import './org.css';

export default function OrgOnboardingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="org-onboard-title"
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--color-surface)',
          padding: 'var(--space-4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 'var(--space-2)',
          }}
        >
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close onboarding modal"
          >
            <X size={20} />
          </button>
        </div>
        <OrgOnboardingForm onSuccess={onClose} onCancel={onClose} />
      </div>
    </div>
  );
}
