import { Clock, ShieldAlert } from 'lucide-react';
import { useAuth } from './useAuth.js';
import './auth.css';

export default function AccountStateBanner() {
  const { user, profile, isAdmin } = useAuth();

  if (!user || !profile) return null;

  const status = profile.status || 'pending';

  if (status === 'suspended') {
    return (
      <aside className="account-alert-banner alert-suspended" role="alert">
        <div className="account-alert-content">
          <ShieldAlert size={20} aria-hidden="true" />
          <div>
            <strong>Account Suspended:</strong> This account has been suspended by an administrator.
            Listing creation, claiming, and handover transactions are disabled.
          </div>
        </div>
      </aside>
    );
  }

  if (status === 'pending' && !isAdmin) {
    return (
      <aside className="account-alert-banner alert-pending" role="status">
        <div className="account-alert-content">
          <Clock size={18} aria-hidden="true" />
          <div>
            <strong>Account Verification Pending:</strong> Your account is registered. To claim
            surplus or publish declarations, an administrator must review your organization offline
            checklist.
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
