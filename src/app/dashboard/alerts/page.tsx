'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAlerts } from '@/hooks/use-alerts';
import { formatCurrency } from '@/lib/utils';
import type { Alert, AlertType, AlertChannel, AlertConfig } from '@/types';
import type { TrafficLightZone } from '@/constants/traffic-light';

const ALERT_TYPE_CONFIG: Record<AlertType, {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = {
  SPENDING_THRESHOLD: {
    label: 'Spending Threshold',
    description: 'Get notified when spending exceeds a limit',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: '#EF4444',
  },
  UNUSUAL_ACTIVITY: {
    label: 'Unusual Activity',
    description: 'Alert for unexpected spending patterns',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: '#EAB308',
  },
  GOAL_PROGRESS: {
    label: 'Goal Progress',
    description: 'Updates on your spending goal progress',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: '#3B82F6',
  },
  RECURRING_CHARGE: {
    label: 'Recurring Charge',
    description: 'Notifications for subscription payments',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    color: '#8B5CF6',
  },
  WEEKLY_SUMMARY: {
    label: 'Weekly Summary',
    description: 'Weekly spending report digest',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: '#22C55E',
  },
};

const ZONE_COLORS: Record<TrafficLightZone, string> = {
  GREEN: '#22C55E',
  YELLOW: '#EAB308',
  RED: '#EF4444',
  UNCATEGORIZED: '#3B82F6',
};

export default function AlertsPage() {
  const {
    alerts,
    notifications,
    isLoading,
    unreadCount,
    createAlert,
    updateAlert,
    toggleAlert,
    deleteAlert,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useAlerts('demo-user');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'notifications'>('alerts');

  // Sort notifications - unread first, then by date
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-[#22C55E] border-t-transparent animate-spin" />
          <p className="text-[#9BA4B0]">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 -ml-2  text-[#9BA4B0] hover:text-[white] hover:bg-[white/5] transition-colors lg:hidden"
            aria-label="Back to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[white]">Alerts & Notifications</h1>
            <p className="text-sm text-[#9BA4B0] mt-1">
              Stay informed about your spending patterns
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#16A34A] to-[#22C55E]  hover:shadow-[0_0_24px_rgba(34,197,94,0.4)] transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Alert
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#0D1117]  border border-[#424242] w-fit">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 text-sm font-medium  transition-colors ${
            activeTab === 'alerts'
              ? 'bg-[#FFC700] text-black'
              : 'text-[#6B7280] hover:text-[white]'
          }`}
        >
          Alert Rules
          <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
            {alerts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-sm font-medium  transition-colors ${
            activeTab === 'notifications'
              ? 'bg-[#FFC700] text-black'
              : 'text-[#6B7280] hover:text-[white]'
          }`}
        >
          Notifications
          {unreadCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-[#EF4444] text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="p-12  bg-[#111820] border border-[#424242] text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFC700]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#FFC700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[white] mb-2">No alerts configured</h3>
              <p className="text-sm text-[#6B7280] mb-6">
                Set up alerts to stay on top of your spending.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#22C55E]  hover:bg-[#16A34A] transition-colors"
              >
                Create your first alert
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onToggle={() => toggleAlert(alert.id)}
                  onEdit={() => setEditingAlert(alert)}
                  onDelete={() => deleteAlert(alert.id)}
                />
              ))}
            </div>
          )}

          {/* Quick add suggestions */}
          {alerts.length < 5 && (
            <div className="p-6  bg-gradient-to-br from-[#3B82F6]/10 to-[#111820] border border-[#FFC700]/20">
              <h3 className="text-sm font-semibold text-[white] mb-4">Suggested Alerts</h3>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                <QuickAlertButton
                  label="Budget warning at 80%"
                  onClick={() => {
                    createAlert({
                      type: 'SPENDING_THRESHOLD',
                      name: 'Budget at 80%',
                      config: { threshold: 80, period: 'monthly' },
                    });
                  }}
                />
                <QuickAlertButton
                  label="RED zone over $200"
                  onClick={() => {
                    createAlert({
                      type: 'SPENDING_THRESHOLD',
                      name: 'RED exceeds $200',
                      config: { zone: 'RED', amount: 200, period: 'monthly' },
                    });
                  }}
                />
                <QuickAlertButton
                  label="Weekly spending digest"
                  onClick={() => {
                    createAlert({
                      type: 'WEEKLY_SUMMARY',
                      name: 'Weekly summary',
                      config: { period: 'weekly' },
                      channels: ['IN_APP', 'EMAIL'],
                    });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {/* Actions bar */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6B7280]">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-[#FFC700] hover:text-[#FFC700] transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={clearNotifications}
                  className="text-sm text-[#6B7280] hover:text-[#EF4444] transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {sortedNotifications.length === 0 ? (
            <div className="p-12  bg-[#111820] border border-[#424242] text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[white] mb-2">No notifications yet</h3>
              <p className="text-sm text-[#6B7280]">
                Alerts will appear here when triggered.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingAlert) && (
        <AlertModal
          alert={editingAlert}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAlert(null);
          }}
          onSave={(data) => {
            if (editingAlert) {
              updateAlert(editingAlert.id, data);
            } else {
              createAlert(data);
            }
            setShowCreateModal(false);
            setEditingAlert(null);
          }}
        />
      )}

      {/* Premium badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-[#6B7280]">
        <svg className="w-4 h-4 text-[#EAB308]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>Premium Feature - Email & push notifications with subscription</span>
      </div>
    </div>
  );
}

// Alert Card Component
function AlertCard({
  alert,
  onToggle,
  onEdit,
  onDelete,
}: {
  alert: Alert;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const config = ALERT_TYPE_CONFIG[alert.type];

  const getConfigDescription = () => {
    const parts: string[] = [];
    if (alert.config.zone) {
      parts.push(`${alert.config.zone} zone`);
    }
    if (alert.config.amount) {
      parts.push(`${formatCurrency(alert.config.amount)}`);
    }
    if (alert.config.threshold) {
      parts.push(`${alert.config.threshold}%`);
    }
    if (alert.config.period) {
      parts.push(alert.config.period);
    }
    return parts.join(' • ') || config.description;
  };

  return (
    <div
      className={`p-5  border transition-all ${
        alert.isEnabled
          ? 'bg-[#111820] border-[#424242]'
          : 'bg-[#111820]/50 border-[#424242]/50 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-10 h-10  flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${config.color}20`, color: config.color }}
          >
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[white]">{alert.name}</h3>
            <p className="text-sm text-[#6B7280] mt-0.5">{getConfigDescription()}</p>
            <div className="flex items-center gap-2 mt-2">
              {alert.channels.map((channel) => (
                <span
                  key={channel}
                  className="px-2 py-0.5 text-xs rounded-full bg-[#424242] text-[#9BA4B0]"
                >
                  {channel === 'IN_APP' ? 'In-App' : channel === 'EMAIL' ? 'Email' : 'Push'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Toggle */}
          <button
            onClick={onToggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              alert.isEnabled ? 'bg-[#22C55E]' : 'bg-[#424242]'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                alert.isEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>

          {/* Edit */}
          <button
            onClick={onEdit}
            className="p-1.5  text-[#6B7280] hover:text-[white] hover:bg-[white/5] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-1.5  text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Notification Card
function NotificationCard({
  notification,
  onMarkAsRead,
}: {
  notification: {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
  };
  onMarkAsRead: () => void;
}) {
  const timeAgo = getTimeAgo(new Date(notification.createdAt));

  return (
    <div
      className={`p-4  border transition-all ${
        notification.isRead
          ? 'bg-[#111820]/50 border-[#424242]/50'
          : 'bg-[#111820] border-[#FFC700]/30'
      }`}
    >
      <div className="flex items-start gap-3">
        {!notification.isRead && (
          <div className="w-2 h-2 rounded-full bg-[#22C55E] mt-2 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium ${notification.isRead ? 'text-[#9BA4B0]' : 'text-[white]'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-[#6B7280] flex-shrink-0">{timeAgo}</span>
          </div>
          <p className="text-sm text-[#6B7280] mt-1">{notification.message}</p>
        </div>
        {!notification.isRead && (
          <button
            onClick={onMarkAsRead}
            className="p-1.5  text-[#6B7280] hover:text-[#FFC700] hover:bg-[#FFC700]/10 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Quick Alert Button
function QuickAlertButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-3  bg-[#111820] border border-[#424242] hover:border-[#FFC700]/50 transition-all text-left"
    >
      <span className="text-sm text-[#9BA4B0]">{label}</span>
    </button>
  );
}

// Alert Modal
function AlertModal({
  alert,
  onClose,
  onSave,
}: {
  alert: Alert | null;
  onClose: () => void;
  onSave: (data: {
    type: AlertType;
    name: string;
    config: AlertConfig;
    channels?: AlertChannel[];
  }) => void;
}) {
  const [type, setType] = useState<AlertType>(alert?.type || 'SPENDING_THRESHOLD');
  const [name, setName] = useState(alert?.name || '');
  const [zone, setZone] = useState<TrafficLightZone>(alert?.config.zone || 'RED');
  const [amount, setAmount] = useState(alert?.config.amount?.toString() || '');
  const [threshold, setThreshold] = useState(alert?.config.threshold?.toString() || '80');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>(alert?.config.period || 'monthly');
  const [channels, setChannels] = useState<AlertChannel[]>(alert?.channels || ['IN_APP']);

  const handleSave = () => {
    if (!name.trim()) return;

    const config: AlertConfig = { period };

    if (type === 'SPENDING_THRESHOLD') {
      config.zone = zone;
      if (amount) config.amount = parseFloat(amount);
    }

    if (type === 'GOAL_PROGRESS' || type === 'SPENDING_THRESHOLD') {
      if (threshold) config.threshold = parseFloat(threshold);
    }

    onSave({
      type,
      name: name.trim(),
      config,
      channels,
    });
  };

  const toggleChannel = (channel: AlertChannel) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const typeConfig = ALERT_TYPE_CONFIG[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4 bg-[#000000] border border-[#424242]  shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#424242] bg-gradient-to-r from-[#111820] to-transparent">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[white]">
              {alert ? 'Edit Alert' : 'Create Alert'}
            </h2>
            <button
              onClick={onClose}
              className="p-2  text-[#6B7280] hover:text-[white] hover:bg-[white/5] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Alert Type */}
          {!alert && (
            <div>
              <label className="block text-sm font-medium text-[#9BA4B0] mb-3">Alert Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(ALERT_TYPE_CONFIG) as [AlertType, typeof ALERT_TYPE_CONFIG[AlertType]][]).map(
                  ([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      className={`p-3  border text-left transition-all ${
                        type === key
                          ? 'border-[#3B82F6] bg-[#FFC700]/10'
                          : 'border-[#424242] hover:border-[#FFC700]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ color: config.color }}>{config.icon}</span>
                        <span className="text-sm font-medium text-[white]">{config.label}</span>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#9BA4B0] mb-2">Alert Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly RED limit"
              className="w-full px-4 py-2.5  bg-[#111820] border border-[#424242] text-[white] placeholder:text-[#6B7280] focus:border-[#3B82F6] focus:outline-none transition-colors"
            />
          </div>

          {/* Zone selector for threshold type */}
          {type === 'SPENDING_THRESHOLD' && (
            <div>
              <label className="block text-sm font-medium text-[#9BA4B0] mb-2">Zone</label>
              <div className="flex gap-2">
                {(['GREEN', 'YELLOW', 'RED'] as TrafficLightZone[]).map((z) => (
                  <button
                    key={z}
                    onClick={() => setZone(z)}
                    className={`flex-1 px-4 py-2.5  border text-sm font-medium transition-all ${
                      zone === z
                        ? 'border-current'
                        : 'border-[#424242] hover:border-current'
                    }`}
                    style={{ color: ZONE_COLORS[z], borderColor: zone === z ? ZONE_COLORS[z] : undefined }}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount for threshold */}
          {type === 'SPENDING_THRESHOLD' && (
            <div>
              <label className="block text-sm font-medium text-[#9BA4B0] mb-2">Amount Threshold ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="200"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5  bg-[#111820] border border-[#424242] text-[white] placeholder:text-[#6B7280] focus:border-[#3B82F6] focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-[#9BA4B0] mb-2">Check Period</label>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 px-4 py-2.5  border text-sm font-medium transition-all ${
                    period === p
                      ? 'border-[#3B82F6] bg-[#FFC700]/10 text-[white]'
                      : 'border-[#424242] text-[#6B7280] hover:text-[white]'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div>
            <label className="block text-sm font-medium text-[#9BA4B0] mb-2">Notification Channels</label>
            <div className="flex gap-2">
              {(['IN_APP', 'EMAIL', 'PUSH'] as AlertChannel[]).map((channel) => (
                <button
                  key={channel}
                  onClick={() => toggleChannel(channel)}
                  className={`flex-1 px-4 py-2.5  border text-sm font-medium transition-all ${
                    channels.includes(channel)
                      ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]'
                      : 'border-[#424242] text-[#6B7280] hover:text-[white]'
                  }`}
                >
                  {channel === 'IN_APP' ? 'In-App' : channel === 'EMAIL' ? 'Email' : 'Push'}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#6B7280] mt-2">Email & Push require Premium subscription</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#424242] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5  text-sm font-medium text-[#9BA4B0] hover:text-[white] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 py-2.5  text-sm font-medium text-white bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {alert ? 'Save Changes' : 'Create Alert'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
