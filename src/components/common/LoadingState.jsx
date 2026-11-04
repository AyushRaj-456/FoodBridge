import './common.css';

export default function LoadingState({ message = 'Loading records...' }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <span className="text-muted" style={{ fontSize: 'var(--font-size-label)' }}>
        {message}
      </span>
    </div>
  );
}
