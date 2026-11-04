import { useState } from 'react';
import { UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from './useAuth.js';

export default function RegisterForm({ onSwitchToSignIn, onSuccess }) {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!displayName || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password, displayName);
      if (onSuccess) onSuccess();
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form-card">
      <div className="auth-form-header">
        <h2>Register FoodBridge Account</h2>
        <p className="text-muted">Create your community member profile to begin onboarding.</p>
      </div>

      {localError && (
        <div className="auth-error-alert" role="alert">
          <AlertCircle size={16} />
          <span>{localError}</span>
        </div>
      )}

      <div className="auth-notice-card">
        <ShieldCheck size={16} />
        <span>
          <strong>Role Policy:</strong> New accounts are registered with pending verification.
          Platform administrator privileges cannot be self-selected and are console-provisioned
          only.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="register-name">Full Name or Coordinator Name</label>
          <input
            id="register-name"
            type="text"
            className="input-field"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            autoComplete="name"
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-email">Email Address</label>
          <input
            id="register-email"
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="coordinator@organisation.org"
            autoComplete="email"
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-password">Password (min 6 characters)</label>
          <input
            id="register-password"
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-confirm-password">Confirm Password</label>
          <input
            id="register-confirm-password"
            type="password"
            className="input-field"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            disabled={submitting}
          />
        </div>

        <button type="submit" className="btn btn-primary auth-submit-btn" disabled={submitting}>
          <UserPlus size={18} />
          <span>{submitting ? 'Creating Account...' : 'Register Account'}</span>
        </button>
      </form>

      <div className="auth-form-footer">
        <p>
          Already have an account?{' '}
          <button type="button" className="btn-link" onClick={onSwitchToSignIn}>
            Sign In instead
          </button>
        </p>
      </div>
    </div>
  );
}
