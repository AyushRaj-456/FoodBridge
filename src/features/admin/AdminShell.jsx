import { ShieldAlert, Lock } from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import VerificationQueue from './VerificationQueue.jsx';
import './admin.css';

export default function AdminShell({ activeTab }) {
  const { user, isAdmin } = useAuth();

  return (
    <div className="feature-container">
      <div className="feature-header">
        <div>
          <h1>Administrative & Moderation Console</h1>
          <p className="text-muted">
            Privileged Controls & Verification Operations (Firebase Spark ₹0 Compliance)
          </p>
        </div>
      </div>

      {!isAdmin ? (
        <div
          className="card"
          style={{ maxWidth: '640px', margin: 'var(--space-6) auto', textAlign: 'center' }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: 'var(--space-3)',
              background: 'var(--color-warning-bg)',
              color: 'var(--color-warning)',
              borderRadius: 'var(--radius-full)',
              marginBottom: 'var(--space-2)',
            }}
          >
            <Lock size={36} />
          </div>
          <h2>Console Admin Provisioning Required</h2>
          <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
            Under FoodBridge&apos;s deny-by-default security model, administrator privileges are
            strictly provisioned manually in the Firebase Console under the <code>admins</code>{' '}
            collection (<code>admins/&#123;uid&#125;</code>).
          </p>

          <div
            className="notice-box"
            style={{
              marginTop: 'var(--space-4)',
              textAlign: 'left',
              background: 'var(--color-canvas)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-label)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontWeight: 600,
              }}
            >
              <ShieldAlert size={18} color="var(--color-brand-600)" />
              <span>How Admin Accounts are Provisioned:</span>
            </div>
            <ol
              style={{
                marginTop: 'var(--space-2)',
                paddingLeft: 'var(--space-4)',
                lineHeight: '1.6',
              }}
            >
              <li>Open the Firebase Console &rarr; Cloud Firestore.</li>
              <li>
                Navigate to or create the top-level collection <code>admins</code>.
              </li>
              <li>
                Create a document with ID equal to your user UID (
                <code>{user?.uid || 'Sign in to see your UID'}</code>).
              </li>
              <li>
                Add field <code>isAdmin: true</code>.
              </li>
              <li>Reload the FoodBridge application to access this console.</li>
            </ol>
            <p
              style={{
                marginTop: 'var(--space-2)',
                color: 'var(--color-muted)',
                fontSize: 'var(--font-size-caption)',
              }}
            >
              Note: Client write operations to <code>admins</code> are permanently denied by
              Firestore security rules (<code>allow write: if false;</code>).
            </p>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 'var(--space-4)' }}>
          {activeTab === 'verification-queue' && <VerificationQueue />}
          {activeTab !== 'verification-queue' && (
            <div className="card">
              <h2>{activeTab.replace('-', ' ').toUpperCase()}</h2>
              <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
                This section is active. To review pending organisations, switch to the Verification
                Queue tab.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
