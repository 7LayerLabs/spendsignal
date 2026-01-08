'use client';

import { useState, useEffect, useCallback } from 'react';

const SETTINGS_STORAGE_KEY = 'spendsignal_user_settings';
const PROFILE_STORAGE_KEY = 'spendsignal_user_profile';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  timezone: string;
  createdAt: Date;
}

export interface UserSettings {
  // Display preferences
  theme: 'dark' | 'light' | 'system';
  currency: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;

  // Privacy
  showAmountsOnDashboard: boolean;

  // Data
  defaultTransactionDays: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  emailNotifications: true,
  pushNotifications: false,
  weeklyDigest: true,
  showAmountsOnDashboard: true,
  defaultTransactionDays: 30,
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@spendsignal.app',
  avatar: null,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  createdAt: new Date(),
};

export function useUserSettings(userId: string) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const key = `${SETTINGS_STORAGE_KEY}_${userId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    setIsLoading(false);
  }, [userId]);

  // Save to localStorage
  const saveSettings = useCallback((updatedSettings: UserSettings) => {
    const key = `${SETTINGS_STORAGE_KEY}_${userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [userId]);

  // Update single setting
  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      saveSettings(updated);
      return updated;
    });
  }, [saveSettings]);

  // Update multiple settings
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      saveSettings(updated);
      return updated;
    });
  }, [saveSettings]);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  return {
    settings,
    isLoading,
    updateSetting,
    updateSettings,
    resetSettings,
  };
}

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const key = `${PROFILE_STORAGE_KEY}_${userId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({
          ...parsed,
          createdAt: new Date(parsed.createdAt),
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    setIsLoading(false);
  }, [userId]);

  // Save to localStorage
  const saveProfile = useCallback((updatedProfile: UserProfile) => {
    const key = `${PROFILE_STORAGE_KEY}_${userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, [userId]);

  // Update profile
  const updateProfile = useCallback((updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      saveProfile(updated);
      return updated;
    });
  }, [saveProfile]);

  return {
    profile,
    isLoading,
    updateProfile,
  };
}
