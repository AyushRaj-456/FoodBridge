import { useState } from 'react';
import { Utensils, Building2, HeartHandshake, Sprout, ArrowRight, Check } from 'lucide-react';
import Modal from '../../components/common/Modal.jsx';

const ROLE_OPTIONS = [
  {
    id: 'donor',
    title: 'I want to donate food',
    subtitle:
      'Campus mess, hostel canteen, restaurant, catering company, or corporate dining hall.',
    icon: Utensils,
    badge: 'Donor Operations',
    color: 'var(--color-primary)',
  },
  {
    id: 'ngo',
    title: 'I represent an NGO',
    subtitle: 'Registered welfare society, orphanage, shelter, or community distribution kitchen.',
    icon: Building2,
    badge: 'Tier 1 Recipient',
    color: 'var(--color-primary)',
  },
  {
    id: 'farm',
    title: 'I operate a cattle farm',
    subtitle: 'Dairy farm or livestock holding requiring safe vegetable and grain feedstock.',
    icon: HeartHandshake,
    badge: 'Tier 2 Recovery',
    color: 'var(--color-accent)',
  },
  {
    id: 'compost',
    title: 'I operate a composting/biogas facility',
    subtitle: 'Organic waste processing facility, vermicomposting unit, or biogas digestion plant.',
    icon: Sprout,
    badge: 'Tier 3 Recovery',
    color: '#0d9488',
  },
];

export default function RoleSelectionModal({ isOpen, onClose, onSelectRole }) {
  const [selectedRole, setSelectedRole] = useState('donor');

  const handleConfirm = () => {
    onSelectRole(selectedRole);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      role="dialog"
      aria-modal="true"
      title="Select Your FoodBridge Role"
      subtitle="Choose the role matching your organization to personalize your workspace and verification requirements."
      maxWidth="620px"
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            width: '100%',
          }}
        >
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleConfirm}>
            <span>Confirm Role &amp; Enter Workspace</span>
            <ArrowRight size={14} />
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {ROLE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedRole === option.id;

          return (
            <div
              key={option.id}
              onClick={() => setSelectedRole(option.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-4)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: isSelected
                  ? '2px solid var(--color-primary)'
                  : '1px solid var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-brand-100)' : 'var(--color-surface)',
                cursor: 'pointer',
                transition:
                  'border-color var(--transition-fast), background-color var(--transition-fast)',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-canvas)',
                  color: isSelected ? '#ffffff' : option.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={22} />
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--space-2)',
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{option.title}</h4>
                  <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                    {option.badge}
                  </span>
                </div>
                <p
                  className="text-muted"
                  style={{ fontSize: 'var(--font-size-label)', margin: '4px 0 0', lineHeight: 1.4 }}
                >
                  {option.subtitle}
                </p>
              </div>

              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: isSelected
                    ? '2px solid var(--color-primary)'
                    : '2px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {isSelected && <Check size={14} />}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
