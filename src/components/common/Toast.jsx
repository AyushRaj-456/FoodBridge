import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import './common.css';

/**
 * Standardized Toast Notification Component
 */
export default function Toast({
  message,
  type = 'success', // 'success' | 'warning' | 'error' | 'info'
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const iconMap = {
    success: <CheckCircle2 size={16} color="var(--color-success)" />,
    warning: <AlertTriangle size={16} color="var(--color-warning)" />,
    error: <AlertCircle size={16} color="var(--color-danger)" />,
    info: <Info size={16} color="var(--color-info)" />,
  };

  return (
    <div className={`toast-notification toast-${type}`} role="status" aria-live="polite">
      <div className="toast-icon">{iconMap[type] || iconMap.info}</div>
      <div className="toast-message">{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="toast-close-btn"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
