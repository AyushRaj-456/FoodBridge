import { useState } from 'react';
import { X } from 'lucide-react';
import SignInForm from './SignInForm.jsx';
import RegisterForm from './RegisterForm.jsx';
import PasswordResetForm from './PasswordResetForm.jsx';
import './auth.css';

export default function AuthModal({ isOpen, initialView = 'signin', onClose }) {
  const [view, setView] = useState(initialView);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Authentication Dialog"
    >
      <div className="modal-card auth-modal-card">
        <button
          type="button"
          className="icon-btn auth-modal-close"
          onClick={onClose}
          aria-label="Close Authentication Dialog"
        >
          <X size={18} />
        </button>

        {view === 'signin' && (
          <SignInForm
            onSwitchToRegister={() => setView('register')}
            onSwitchToReset={() => setView('reset')}
            onSuccess={onClose}
          />
        )}

        {view === 'register' && (
          <RegisterForm onSwitchToSignIn={() => setView('signin')} onSuccess={onClose} />
        )}

        {view === 'reset' && <PasswordResetForm onBackToSignIn={() => setView('signin')} />}
      </div>
    </div>
  );
}
