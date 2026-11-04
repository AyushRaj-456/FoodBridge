import { useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from './useAuth.js';

export default function PasswordResetForm({ onBackToSignIn }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!email) {
      setLocalError('Please enter your account email address.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email);
      setSentSuccess(true);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form-card">
      <div className="auth-form-header">
        <h2>Reset Password</h2>
        <p className="text-muted">
          We will send a password reset link to your verified email address within Firebase Spark
          quotas.
        </p>
      </div>

      {localError && (
        <div className="auth-error-alert" role="alert">
          <AlertCircle size={16} />
          <span>{localError}</span>
        </div>
      )}

      {sentSuccess ? (
        <div className="auth-success-card" role="status">
          <CheckCircle2 size={24} color="var(--color-success)" />
          <h3>Reset Link Sent</h3>
          <p>
            If an account exists for <strong>{email}</strong>, a password reset email has been
            dispatched. Please check your inbox.
          </p>
          <button
            type="button"
            className="btn btn-secondary auth-submit-btn"
            onClick={onBackToSignIn}
            style={{ marginTop: 'var(--space-4)' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Sign In</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="reset-email">Registered Email Address</label>
            <input
              id="reset-email"
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

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={submitting}>
            <Mail size={18} />
            <span>{submitting ? 'Sending Link...' : 'Send Password Reset Email'}</span>
          </button>

          <button
            type="button"
            className="btn btn-quiet"
            onClick={onBackToSignIn}
            disabled={submitting}
            style={{ marginTop: 'var(--space-2)', width: '100%' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </button>
        </form>
      )}
    </div>
  );
}
