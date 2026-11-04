import { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  UtensilsCrossed,
  Info,
  Check,
  Trash2,
  WifiOff,
  Clock,
} from 'lucide-react';
import {
  NOTIFICATION_TYPES,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from './notificationService.js';

/**
 * Format timestamp into human-readable relative time.
 */
function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

/**
 * Returns icon and theme colors for notification type.
 */
function getNotificationIcon(type) {
  switch (type) {
    case NOTIFICATION_TYPES.CLAIM_COMPLETED:
    case NOTIFICATION_TYPES.HANDOVER_CONFIRMED:
      return <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />;
    case NOTIFICATION_TYPES.CLAIM_DISPUTED:
      return <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />;
    case NOTIFICATION_TYPES.CLAIM_CANCELLED:
      return <XCircle size={18} style={{ color: 'var(--color-danger)' }} />;
    case NOTIFICATION_TYPES.ORG_VERIFIED:
      return <ShieldCheck size={18} style={{ color: 'var(--color-brand-700)' }} />;
    case NOTIFICATION_TYPES.CLAIM_CREATED:
    case NOTIFICATION_TYPES.LISTING_PUBLISHED:
      return <UtensilsCrossed size={18} style={{ color: 'var(--color-brand-700)' }} />;
    case NOTIFICATION_TYPES.SYSTEM_ALERT:
    default:
      return <Info size={18} style={{ color: 'var(--color-brand-700)' }} />;
  }
}

export default function NotificationInboxModal({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  fromCache = false,
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.readAt;
    return true;
  });

  const handleMarkAsRead = async (notifId, e) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationAsRead(notifId);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      await markAllNotificationsAsRead(notifications);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (notifId, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteNotification(notifId);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-inbox-title"
      onClick={onClose}
    >
      <div
        className="modal-container"
        style={{
          maxWidth: '600px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Bell size={20} style={{ color: 'var(--color-brand-700)' }} />
            <h2 id="notification-inbox-title" style={{ margin: 0, fontSize: '1.25rem' }}>
              In-App Notification Inbox
            </h2>
            {unreadCount > 0 && (
              <span
                className="badge badge-neutral"
                style={{
                  fontSize: '11px',
                  background: 'var(--color-brand-100)',
                  color: 'var(--color-brand-800)',
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close notification inbox"
          >
            <X size={18} />
          </button>
        </div>

        {/* In-App Only Zero Cost Disclaimer */}
        <div
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--color-canvas)',
            borderBottom: '1px solid var(--color-border)',
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <Info size={14} style={{ flexShrink: 0, color: 'var(--color-brand-700)' }} />
          <span>
            <strong>In-App Only:</strong> FoodBridge Spark ₹0 architecture operates without paid
            SMS, WhatsApp, email, or background push workers. Live updates stream while this app is
            open.
          </span>
        </div>

        {/* Offline Sync Banner */}
        {(isOffline || fromCache) && (
          <div
            role="status"
            style={{
              padding: 'var(--space-2) var(--space-4)',
              background: '#FEF3C7',
              borderBottom: '1px solid #F59E0B',
              fontSize: 'var(--font-size-caption)',
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <WifiOff size={14} style={{ flexShrink: 0 }} />
            <span>
              <strong>Offline Mode:</strong> Showing cached notifications. Any changes made offline
              will sync automatically when your connection is restored.
            </span>
          </div>
        )}

        {/* Toolbar: Filters and Mark All Read */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-border)',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              type="button"
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('all')}
              style={{ padding: '4px 10px', fontSize: 'var(--font-size-caption)' }}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('unread')}
              style={{ padding: '4px 10px', fontSize: 'var(--font-size-caption)' }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleMarkAllAsRead}
              disabled={isProcessing}
              style={{
                fontSize: 'var(--font-size-caption)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
              }}
            >
              <Check size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notification List Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-2) 0',
          }}
        >
          {filteredNotifications.length === 0 ? (
            <div
              style={{
                padding: 'var(--space-8) var(--space-4)',
                textAlign: 'center',
                color: 'var(--color-muted)',
              }}
            >
              <Bell
                size={36}
                style={{ margin: '0 auto var(--space-2) auto', opacity: 0.35, display: 'block' }}
              />
              <p style={{ margin: 0, fontWeight: 500, fontSize: 'var(--font-size-body)' }}>
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p style={{ margin: 'var(--space-1) 0 0 0', fontSize: 'var(--font-size-caption)' }}>
                {filter === 'unread'
                  ? 'All notifications have been read.'
                  : 'You will receive real-time notifications here while FoodBridge is active.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredNotifications.map((notif) => {
                const isUnread = !notif.readAt;
                return (
                  <div
                    key={notif.id}
                    data-testid={`notification-item-${notif.id}`}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderBottom: '1px solid var(--color-border)',
                      background: isUnread ? 'var(--color-surface)' : 'var(--color-canvas)',
                      borderLeft: isUnread
                        ? '4px solid var(--color-brand-700)'
                        : '4px solid transparent',
                      display: 'flex',
                      gap: 'var(--space-3)',
                      alignItems: 'flex-start',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        flexShrink: 0,
                      }}
                    >
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          gap: 'var(--space-2)',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: isUnread ? 700 : 500,
                            fontSize: 'var(--font-size-label)',
                            color: 'var(--color-text)',
                          }}
                        >
                          {notif.title}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            flexShrink: 0,
                          }}
                        >
                          <Clock size={11} />
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 'var(--space-1) 0 0 0',
                          fontSize: 'var(--font-size-caption)',
                          color: 'var(--color-muted)',
                          lineHeight: 1.45,
                        }}
                      >
                        {notif.body}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          marginTop: 'var(--space-2)',
                        }}
                      >
                        {isUnread && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              height: '24px',
                            }}
                            title="Mark as read"
                          >
                            Mark read
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleDelete(notif.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '11px',
                            padding: '2px 4px',
                          }}
                          aria-label={`Delete notification ${notif.title}`}
                          title="Delete notification"
                        >
                          <Trash2 size={12} />
                          <span>Dismiss</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="modal-footer"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
