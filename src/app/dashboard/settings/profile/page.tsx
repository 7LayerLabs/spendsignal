'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUserProfile } from '@/hooks/use-user-settings';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export default function ProfilePage() {
  const { profile, isLoading, updateProfile } = useUserProfile('demo-user');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [timezone, setTimezone] = useState(profile.timezone);

  // Sync state when profile loads
  useState(() => {
    setName(profile.name);
    setEmail(profile.email);
    setTimezone(profile.timezone);
  });

  const handleSave = () => {
    updateProfile({ name, email, timezone });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(profile.name);
    setEmail(profile.email);
    setTimezone(profile.timezone);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-[#FFC700] border-t-transparent animate-spin" />
          <p className="text-[#9BA4B0]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back Button & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/settings"
          className="p-2 -ml-2 rounded text-[#9BA4B0] hover:text-[white] hover:bg-[white/5] transition-colors"
          aria-label="Back to Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard/settings" className="text-[#6B7280] hover:text-[white] transition-colors">
            Settings
          </Link>
          <span className="text-[#6B7280]">/</span>
          <span className="text-[white]">Profile</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[white]">Profile</h1>
          <p className="text-sm text-[#9BA4B0] mt-1">
            Manage your personal information
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded bg-[#FFC700] text-white text-sm font-medium hover:bg-[#E6B800] transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded bg-[#111820] border border-[#424242]">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-[#424242]">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFC700] to-[#22C55E] flex items-center justify-center text-3xl font-bold text-white">
              {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#FFC700] border-2 border-[#111820] flex items-center justify-center text-white hover:bg-[#E6B800] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[white]">{profile.name}</h2>
            <p className="text-sm text-[#6B7280]">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#FFC700]/20 text-[#FFC700]">
                Demo Account
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#22C55E]/20 text-[#22C55E]">
                Free Tier
              </span>
            </div>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="pt-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#9BA4B0] mb-2">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded bg-[#0D1117] border border-[#424242] text-[white] placeholder:text-[#6B7280] focus:border-[#FFC700] focus:outline-none transition-colors"
              />
            ) : (
              <p className="text-[white]">{profile.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#9BA4B0] mb-2">Email Address</label>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded bg-[#0D1117] border border-[#424242] text-[white] placeholder:text-[#6B7280] focus:border-[#FFC700] focus:outline-none transition-colors"
              />
            ) : (
              <p className="text-[white]">{profile.email}</p>
            )}
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-[#9BA4B0] mb-2">Timezone</label>
            {isEditing ? (
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 rounded bg-[#0D1117] border border-[#424242] text-[white] focus:border-[#FFC700] focus:outline-none transition-colors"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                ))}
              </select>
            ) : (
              <p className="text-[white]">{profile.timezone.replace(/_/g, ' ')}</p>
            )}
          </div>

          {/* Member Since */}
          <div>
            <label className="block text-sm font-medium text-[#9BA4B0] mb-2">Member Since</label>
            <p className="text-[white]">{profile.createdAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-[#424242]">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded text-sm font-medium text-[#9BA4B0] hover:text-[white] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded text-sm font-medium text-white bg-[#22C55E] hover:bg-[#16A34A] transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="p-6 rounded bg-[#111820] border border-[#424242]">
        <h2 className="text-lg font-semibold text-[white] mb-6">Security</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded bg-[#0D1117] border border-[#424242]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#FFC700]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#FFC700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[white]">Password</p>
                <p className="text-xs text-[#6B7280]">Last changed: Never (Demo mode)</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded text-sm font-medium text-[#FFC700] hover:bg-[#FFC700]/10 transition-colors">
              Change
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded bg-[#0D1117] border border-[#424242]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#22C55E]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[white]">Two-Factor Authentication</p>
                <p className="text-xs text-[#6B7280]">Add extra security to your account</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded text-sm font-medium text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors">
              Enable
            </button>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="p-6 rounded bg-[#111820] border border-[#424242]">
        <h2 className="text-lg font-semibold text-[white] mb-6">Connected Accounts</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded bg-[#0D1117] border border-[#424242]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[white]">Google</p>
                <p className="text-xs text-[#6B7280]">Not connected</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded text-sm font-medium text-[#FFC700] hover:bg-[#FFC700]/10 transition-colors">
              Connect
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded bg-[#0D1117] border border-[#424242]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-black flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[white]">Apple</p>
                <p className="text-xs text-[#6B7280]">Not connected</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded text-sm font-medium text-[#FFC700] hover:bg-[#FFC700]/10 transition-colors">
              Connect
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded bg-[#111820] border border-[#EF4444]/30">
        <h2 className="text-lg font-semibold text-[#EF4444] mb-2">Danger Zone</h2>
        <p className="text-sm text-[#6B7280] mb-6">Irreversible actions for your account</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded bg-[#EF4444]/5 border border-[#EF4444]/20">
            <div>
              <p className="text-sm font-medium text-[white]">Delete Account</p>
              <p className="text-xs text-[#6B7280]">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 rounded text-sm font-medium text-[#EF4444] border border-[#EF4444]/50 hover:bg-[#EF4444]/10 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
