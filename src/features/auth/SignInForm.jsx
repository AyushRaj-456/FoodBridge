import { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from './useAuth.js';

export default function SignInForm({ onSwitchToRegister, onSwitchToReset, onSuccess }) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
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
        <h2>Sign In to FoodBridge</h2>
        <p className="text-muted">Enter your email and password to access your account.</p>
      </div>

      {localError && (
        <div className="auth-error-alert" role="alert">
          <AlertCircle size={16} />
          <span>{localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="signin-email">Email Address</label>
          <input
            id="signin-email"
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
          <div className="form-label-row">
            <label htmlFor="signin-password">Password</label>
            <button
              type="button"
              className="btn-link"
              onClick={onSwitchToReset}
              disabled={submitting}
            >
              Forgot password?
            </button>
          </div>
          <input
            id="signin-password"
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={submitting}
          />
        </div>

        <button type="submit" className="btn btn-primary auth-submit-btn" disabled={submitting}>
          <LogIn size={18} />
          <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="btn btn-secondary google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={submitting}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </form>

      <div className="auth-form-footer">
        <p>
          Don&apos;t have an account?{' '}
          <button type="button" className="btn-link" onClick={onSwitchToRegister}>
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
