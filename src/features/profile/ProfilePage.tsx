import { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Shield,
  TrendingUp,
  Award,
  Clock,
  Edit2,
  Camera,
} from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassBadge } from '@/components/ui/glass-badge';
import { GlassInput } from '@/components/ui/glass-input';
import { cn } from '@/lib/utils';

interface StatItemProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

function StatItem({ label, value, icon, trend }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
      <div className="p-2 rounded-lg bg-white/5 text-blue-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={cn(
          'text-lg font-semibold',
          trend === 'up' && 'text-emerald-400',
          trend === 'down' && 'text-red-400',
          !trend && 'text-white'
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Trader',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    timezone: 'America/New_York',
    tradingExperience: 'Advanced (3-5 years)',
  });

  const stats = {
    totalTrades: 156,
    winRate: '68.5%',
    avgPL: '+$234.50',
    memberSince: 'Jan 2024',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <User className="w-8 h-8 text-blue-400" />
            Profile
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your account information
          </p>
        </div>
        <GlassButton
          variant={isEditing ? 'primary' : 'outline'}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Save Changes' : (
            <>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <GlassCard className="text-center">
            <GlassCardContent className="pt-6">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>

              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              <p className="text-slate-400">{profile.email}</p>

              <div className="flex items-center justify-center gap-2 mt-3">
                <GlassBadge variant="primary">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </GlassBadge>
                <GlassBadge variant="success">
                  <Award className="w-3 h-3 mr-1" />
                  Pro Trader
                </GlassBadge>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <StatItem
                    label="Total Trades"
                    value={stats.totalTrades}
                    icon={<TrendingUp className="w-4 h-4" />}
                  />
                  <StatItem
                    label="Win Rate"
                    value={stats.winRate}
                    icon={<Award className="w-4 h-4" />}
                    trend="up"
                  />
                  <StatItem
                    label="Avg P&L"
                    value={stats.avgPL}
                    icon={<TrendingUp className="w-4 h-4" />}
                    trend="up"
                  />
                  <StatItem
                    label="Member Since"
                    value={stats.memberSince}
                    icon={<Clock className="w-4 h-4" />}
                  />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Personal Information</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <GlassInput
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-white py-2">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <GlassInput
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-white py-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {profile.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <GlassInput
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-white py-2">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Timezone
                  </label>
                  {isEditing ? (
                    <GlassInput
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    />
                  ) : (
                    <p className="text-white py-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {profile.timezone}
                    </p>
                  )}
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Trading Experience</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Experience Level
                  </label>
                  <p className="text-white">{profile.tradingExperience}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Account Status
                  </label>
                  <div className="flex items-center gap-3">
                    <GlassBadge variant="success">Active</GlassBadge>
                    <span className="text-slate-400 text-sm">Full access to all features</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Permissions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <GlassBadge size="sm">AI Screener</GlassBadge>
                    <GlassBadge size="sm">Filter Screener</GlassBadge>
                    <GlassBadge size="sm">Trade Management</GlassBadge>
                    <GlassBadge size="sm">AI Assistant</GlassBadge>
                    <GlassBadge size="sm">Trade Reviewer</GlassBadge>
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard className="border-red-500/20">
            <GlassCardHeader>
              <GlassCardTitle className="text-red-400">Danger Zone</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Delete Account</p>
                  <p className="text-sm text-slate-400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <GlassButton variant="destructive">Delete Account</GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
