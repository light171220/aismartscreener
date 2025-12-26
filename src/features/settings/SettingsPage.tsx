import { useState } from 'react';
import { Settings, Bell, Moon, Sun, Shield, Palette, Database } from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassBadge } from '@/components/ui/glass-badge';
import { cn } from '@/lib/utils';

interface SettingToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function SettingToggle({ label, description, enabled, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && (
          <p className="text-xs text-slate-400">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          enabled ? 'bg-blue-500' : 'bg-slate-600'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    screeningAlerts: true,
    tradeReminders: true,
    darkMode: true,
    compactView: false,
    autoRefresh: true,
    showPLColors: true,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-400" />
          Settings
        </h1>
        <p className="text-slate-400 mt-1">
          Manage your application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Notifications
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="divide-y divide-white/10">
            <SettingToggle
              label="Email Notifications"
              description="Receive daily screening summaries via email"
              enabled={settings.emailNotifications}
              onChange={(v) => updateSetting('emailNotifications', v)}
            />
            <SettingToggle
              label="Push Notifications"
              description="Get browser notifications for new alerts"
              enabled={settings.pushNotifications}
              onChange={(v) => updateSetting('pushNotifications', v)}
            />
            <SettingToggle
              label="Screening Alerts"
              description="Notify when new stocks pass screening"
              enabled={settings.screeningAlerts}
              onChange={(v) => updateSetting('screeningAlerts', v)}
            />
            <SettingToggle
              label="Trade Reminders"
              description="Reminder to close or review open trades"
              enabled={settings.tradeReminders}
              onChange={(v) => updateSetting('tradeReminders', v)}
            />
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Appearance
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="divide-y divide-white/10">
            <SettingToggle
              label="Dark Mode"
              description="Use dark theme throughout the app"
              enabled={settings.darkMode}
              onChange={(v) => updateSetting('darkMode', v)}
            />
            <SettingToggle
              label="Compact View"
              description="Reduce spacing for more data density"
              enabled={settings.compactView}
              onChange={(v) => updateSetting('compactView', v)}
            />
            <SettingToggle
              label="P&L Colors"
              description="Show green/red colors for profit/loss"
              enabled={settings.showPLColors}
              onChange={(v) => updateSetting('showPLColors', v)}
            />
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              Data & Sync
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="divide-y divide-white/10">
            <SettingToggle
              label="Auto-Refresh"
              description="Automatically refresh data every minute"
              enabled={settings.autoRefresh}
              onChange={(v) => updateSetting('autoRefresh', v)}
            />
            <div className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Clear Cache</p>
                  <p className="text-xs text-slate-400">Remove locally stored data</p>
                </div>
                <GlassButton variant="outline" size="sm">
                  Clear
                </GlassButton>
              </div>
            </div>
            <div className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Export Data</p>
                  <p className="text-xs text-slate-400">Download your trade history</p>
                </div>
                <GlassButton variant="outline" size="sm">
                  Export
                </GlassButton>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Security
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                <p className="text-xs text-slate-400">Add an extra layer of security</p>
              </div>
              <GlassBadge variant="warning">Not Enabled</GlassBadge>
            </div>
            <GlassButton variant="primary" className="w-full">
              Enable 2FA
            </GlassButton>
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm font-medium text-white mb-2">Active Sessions</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">This device</span>
                  <GlassBadge variant="success" size="sm">Active</GlassBadge>
                </div>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      <div className="flex justify-end gap-3">
        <GlassButton variant="ghost">Reset to Defaults</GlassButton>
        <GlassButton variant="primary">Save Changes</GlassButton>
      </div>
    </div>
  );
}

export default SettingsPage;
