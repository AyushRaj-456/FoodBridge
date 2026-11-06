import { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from './useAuth.js';

export default function PhoneSignInView({ onSuccess, onSwitchToEmail }) {
  const { loginWithGoogle } = useAuth();
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError(null);
    const cleanNum = phoneNumber.replace(/\D/g, '');
    if (cleanNum.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setTimer(30);
    }, 600);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError(null);
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP verification code.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 700);
    }, 600);
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setTimer(30);
    setError(null);
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      if (loginWithGoogle) await loginWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Google sign-in encountered an issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone-auth-container">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontSize: '1.35rem', margin: '0 0 var(--space-1)' }}>
          {otpSent ? 'Verify Phone Number' : 'Sign In with Phone'}
        </h2>
        <p className="text-muted" style={{ fontSize: 'var(--font-size-label)', margin: 0 }}>
          {otpSent
            ? `Enter the 6-digit code transmitted to ${countryCode} ${phoneNumber}`
            : 'Access your FoodBridge operations portal using secure OTP authentication'}
        </p>
      </div>

      {error && (
        <div className="auth-error-alert" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {verified ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
          <CheckCircle2
            size={44}
            color="var(--color-success)"
            style={{ margin: '0 auto var(--space-2)' }}
          />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Phone Verified</h3>
          <p
            className="text-muted"
            style={{ fontSize: 'var(--font-size-label)', marginTop: '4px' }}
          >
            Signing in to your dashboard...
          </p>
        </div>
      ) : !otpSent ? (
        <form onSubmit={handleSendOtp}>
          <div className="form-group">
            <label className="form-label" htmlFor="phone-number">
              Mobile Phone Number
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <select
                className="select-field"
                style={{ width: '100px', flexShrink: 0 }}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                disabled={loading}
              >
                <option value="+91">+91 (IN)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+971">+971 (AE)</option>
              </select>
              <input
                id="phone-number"
                type="tel"
                className="input-field"
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
            </div>
            <span className="form-help">A 6-digit OTP will be dispatched via carrier SMS</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-3)' }}
            disabled={loading}
          >
            {loading ? (
              <span>Sending OTP...</span>
            ) : (
              <>
                <span>Send Verification OTP</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div className="form-group" style={{ textAlign: 'center' }}>
            <label
              className="form-label"
              style={{ justifyContent: 'center', marginBottom: 'var(--space-3)' }}
            >
              Enter 6-Digit One-Time Password
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="input-field"
                  style={{
                    width: '44px',
                    height: '50px',
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                  }}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={loading}
                  autoFocus={idx === 0}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: 'var(--space-4) 0',
              fontSize: 'var(--font-size-label)',
            }}
          >
            <button
              type="button"
              className="btn-quiet"
              style={{ padding: 0 }}
              onClick={() => {
                setOtpSent(false);
                setOtp(['', '', '', '', '', '']);
              }}
            >
              Change phone number
            </button>

            <button
              type="button"
              className="btn-quiet"
              style={{
                padding: 0,
                color: timer > 0 ? 'var(--color-muted)' : 'var(--color-primary)',
                cursor: timer > 0 ? 'not-allowed' : 'pointer',
              }}
              disabled={timer > 0}
              onClick={handleResendOtp}
            >
              {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? <span>Verifying...</span> : <span>Verify &amp; Continue</span>}
          </button>
        </form>
      )}

      {/* Optional Google & Email Alternatives */}
      <div
        style={{
          marginTop: 'var(--space-5)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: '100%' }}
          onClick={handleGoogle}
          disabled={loading}
        >
          <span>Sign in with Google</span>
        </button>

        {onSwitchToEmail && (
          <button
            type="button"
            className="btn-quiet"
            style={{ width: '100%', fontSize: 'var(--font-size-label)' }}
            onClick={onSwitchToEmail}
          >
            Use institutional email &amp; password instead
          </button>
        )}
      </div>
    </div>
  );
}
