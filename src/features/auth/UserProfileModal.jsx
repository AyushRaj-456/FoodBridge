import { useState } from 'react';
import { X, User, Mail, Shield, LogOut, Check } from 'lucide-react';
import { useAuth } from './useAuth.js';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, profile, isAdmin, logout, updateProfileData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.displayName || user?.displayName || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !user) return null;

  const status = profile?.status || 'pending';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfileData({ displayName: name.trim() });
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="modal-card">
        <div className="modal-header">
          <h2 id="profile-modal-title">User Account & Profile</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close Profile">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="profile-info-grid">
            <div className="profile-field">
              <span className="field-label">Account Verification Status</span>
              <div style={{ marginTop: '4px' }}>
                {status === 'active' && (
                  <span className="badge badge-success">Active / Approved</span>
                )}
                {status === 'pending' && (
                  <span className="badge badge-warning">Pending Review</span>
                )}
                {status === 'suspended' && <span className="badge badge-danger">Suspended</span>}
                {isAdmin && (
                  <span className="badge badge-neutral" style={{ marginLeft: '6px' }}>
                    Console Admin
                  </span>
                )}
              </div>
            </div>

            <div className="profile-field">
              <span className="field-label">Email Address</span>
              <div className="profile-value">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
            </div>

            <div className="profile-field">
              <span className="field-label">Display Name</span>
              {editing ? (
                <form
                  onSubmit={handleSave}
                  style={{ display: 'flex', gap: '8px', marginTop: '4px' }}
                >
                  <input
                    type="text"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Check size={16} />
                  </button>
                </form>
              ) : (
                <div className="profile-value-editable">
                  <div className="profile-value">
                    <User size={16} />
                    <span>{profile?.displayName || user.displayName || 'No name set'}</span>
                  </div>
                  <button type="button" className="btn-link" onClick={() => setEditing(true)}>
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="profile-field">
              <span className="field-label">Security Tier</span>
              <div className="profile-value">
                <Shield size={16} />
                <span>Firebase Spark Auth (No Phone SMS / Card Required)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-danger" onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
