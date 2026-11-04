import { AlertCircle, RefreshCw } from 'lucide-react';
import './common.css';

export default function ErrorState({
  title = 'Failed to load records',
  message = 'An unexpected error occurred while fetching information.',
  onRetry,
}) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div className="error-state-content">
        <div className="error-state-title">{title}</div>
        <div className="error-state-message">{message}</div>
        {onRetry && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onRetry}
            style={{
              marginTop: 'var(--space-3)',
              minHeight: '32px',
              padding: 'var(--space-1) var(--space-3)',
              fontSize: 'var(--font-size-label)',
            }}
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
}
