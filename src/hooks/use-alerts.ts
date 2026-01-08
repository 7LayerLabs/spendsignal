'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Alert, AlertType, AlertChannel, AlertConfig, AlertNotification } from '@/types';
import type { TrafficLightZone } from '@/constants/traffic-light';

const ALERTS_STORAGE_KEY = 'spendsignal_alerts';
const NOTIFICATIONS_STORAGE_KEY = 'spendsignal_notifications';

function generateId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useAlerts(userId: string) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const alertsKey = `${ALERTS_STORAGE_KEY}_${userId}`;
    const notificationsKey = `${NOTIFICATIONS_STORAGE_KEY}_${userId}`;

    try {
      const storedAlerts = localStorage.getItem(alertsKey);
      if (storedAlerts) {
        const parsed = JSON.parse(storedAlerts);
        setAlerts(parsed.map((a: Alert) => ({
          ...a,
          lastTriggeredAt: a.lastTriggeredAt ? new Date(a.lastTriggeredAt) : null,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
        })));
      } else {
        // Set up default alerts for new users
        const defaultAlerts = getDefaultAlerts(userId);
        setAlerts(defaultAlerts);
        localStorage.setItem(alertsKey, JSON.stringify(defaultAlerts));
      }

      const storedNotifications = localStorage.getItem(notificationsKey);
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications);
        setNotifications(parsed.map((n: AlertNotification) => ({
          ...n,
          readAt: n.readAt ? new Date(n.readAt) : null,
          createdAt: new Date(n.createdAt),
        })));
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
    setIsLoading(false);
  }, [userId]);

  // Save alerts to localStorage
  const saveAlerts = useCallback((updatedAlerts: Alert[]) => {
    const key = `${ALERTS_STORAGE_KEY}_${userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(updatedAlerts));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }, [userId]);

  // Save notifications to localStorage
  const saveNotifications = useCallback((updatedNotifications: AlertNotification[]) => {
    const key = `${NOTIFICATIONS_STORAGE_KEY}_${userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, [userId]);

  // Create new alert
  const createAlert = useCallback((alertData: {
    type: AlertType;
    name: string;
    config: AlertConfig;
    channels?: AlertChannel[];
  }) => {
    const now = new Date();
    const newAlert: Alert = {
      id: generateId(),
      userId,
      type: alertData.type,
      name: alertData.name,
      isEnabled: true,
      config: alertData.config,
      channels: alertData.channels || ['IN_APP'],
      lastTriggeredAt: null,
      createdAt: now,
      updatedAt: now,
    };

    setAlerts((prev) => {
      const updated = [...prev, newAlert];
      saveAlerts(updated);
      return updated;
    });

    return newAlert.id;
  }, [userId, saveAlerts]);

  // Update alert
  const updateAlert = useCallback((id: string, updates: Partial<Omit<Alert, 'id' | 'userId' | 'createdAt'>>) => {
    setAlerts((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
      );
      saveAlerts(updated);
      return updated;
    });
  }, [saveAlerts]);

  // Toggle alert enabled
  const toggleAlert = useCallback((id: string) => {
    setAlerts((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, isEnabled: !a.isEnabled, updatedAt: new Date() } : a
      );
      saveAlerts(updated);
      return updated;
    });
  }, [saveAlerts]);

  // Delete alert
  const deleteAlert = useCallback((id: string) => {
    setAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveAlerts(updated);
      return updated;
    });
  }, [saveAlerts]);

  // Add notification
  const addNotification = useCallback((alertId: string, title: string, message: string, data?: Record<string, unknown>) => {
    const notification: AlertNotification = {
      id: generateId(),
      alertId,
      title,
      message,
      data: data || null,
      isRead: false,
      readAt: null,
      createdAt: new Date(),
    };

    setNotifications((prev) => {
      const updated = [notification, ...prev].slice(0, 50); // Keep last 50
      saveNotifications(updated);
      return updated;
    });

    return notification.id;
  }, [saveNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date() } : n
      );
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const now = new Date();
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true, readAt: now }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, [saveNotifications]);

  // Count unread notifications
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  // Get enabled alerts
  const enabledAlerts = useMemo(() => alerts.filter((a) => a.isEnabled), [alerts]);

  return {
    alerts,
    notifications,
    isLoading,
    unreadCount,
    enabledAlerts,
    createAlert,
    updateAlert,
    toggleAlert,
    deleteAlert,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}

// Default alerts for new users
function getDefaultAlerts(userId: string): Alert[] {
  const now = new Date();
  return [
    {
      id: generateId(),
      userId,
      type: 'SPENDING_THRESHOLD',
      name: 'RED zone exceeds $300',
      isEnabled: true,
      config: { zone: 'RED', amount: 300, period: 'monthly' },
      channels: ['IN_APP'],
      lastTriggeredAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      type: 'GOAL_PROGRESS',
      name: 'Goal at risk',
      isEnabled: true,
      config: { threshold: 80 },
      channels: ['IN_APP'],
      lastTriggeredAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      type: 'WEEKLY_SUMMARY',
      name: 'Weekly spending summary',
      isEnabled: false,
      config: { period: 'weekly' },
      channels: ['IN_APP', 'EMAIL'],
      lastTriggeredAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
