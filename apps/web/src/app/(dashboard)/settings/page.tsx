'use client';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { Shield, User, Palette, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Settings</h1><p className="page-subtitle">System configuration and preferences</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Profile Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <input defaultValue={`${user?.firstName} ${user?.lastName}`} className="form-input" readOnly />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input defaultValue={user?.email} className="form-input" readOnly />
            </div>
            <div>
              <label className="form-label">Role</label>
              <input defaultValue={user?.role?.replace('_', ' ')} className="form-input" readOnly />
            </div>
            {user?.branch && (
              <div>
                <label className="form-label">Branch</label>
                <input defaultValue={user.branch.name} className="form-input" readOnly />
              </div>
            )}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Security</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="form-label">Current Password</label>
              <input type="password" placeholder="••••••••" className="form-input" />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input type="password" placeholder="••••••••" className="form-input" />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="form-input" />
            </div>
            <button className="btn-primary w-full">Update Password</button>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Dark Mode</span>
              <p className="text-xs text-muted-foreground">Toggle via the moon/sun icon in the header</p>
            </div>
          </div>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Notification Preferences</h3>
          </div>
          <div className="space-y-3">
            {['Loan Due Reminders', 'Overdue Alerts', 'FD Maturity Alerts', 'Recovery Updates'].map(pref => (
              <div key={pref} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm">{pref}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
        <h3 className="font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'System Version', val: '1.0.0' },
            { label: 'Stack', val: 'Next.js 15 + NestJS' },
            { label: 'Database', val: 'PostgreSQL + Prisma' },
            { label: 'Queue', val: 'Redis + BullMQ' },
          ].map(({ label, val }) => (
            <div key={label} className="p-3 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground">{label}</div>
              <div className="font-medium mt-0.5">{val}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
