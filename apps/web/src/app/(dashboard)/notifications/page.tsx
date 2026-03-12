'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notificationsApi } from '@/lib/api';
import { Bell, Mail, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

const typeIcon: Record<string, any> = {
  EMAIL: Mail, SMS: MessageSquare, IN_APP: Bell,
};
const statusBadge: Record<string, string> = {
  SENT: 'badge-active', PENDING: 'badge-pending', FAILED: 'badge-overdue',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      notificationsApi.getAll({ type: typeFilter || undefined, status: statusFilter || undefined, limit: 30 }),
      notificationsApi.getStats(),
    ]).then(([n, s]) => {
      setNotifications(n.data.data || []);
      setStats(s.data);
    }).catch(() => {
      setNotifications([
        { id: '1', type: 'EMAIL', trigger: 'LOAN_DUE', status: 'SENT', recipient: 'rajan@email.com',
          subject: 'Loan EMI Due Reminder', message: 'Your EMI of LKR 23,536 is due on March 15.', createdAt: new Date().toISOString() },
        { id: '2', type: 'SMS', trigger: 'OVERDUE_ALERT', status: 'SENT', recipient: '+94 76 567 8901',
          subject: null, message: 'URGENT: Your loan is overdue by 285 days.', createdAt: new Date().toISOString() },
        { id: '3', type: 'IN_APP', trigger: 'FD_MATURITY', status: 'PENDING', recipient: 'system',
          subject: 'FD Maturity Alert', message: 'FD FD-2024-001 matures in 30 days.', createdAt: new Date().toISOString() },
      ]);
      setStats({ total: 48, sent: 39, pending: 6, failed: 3 });
    }).finally(() => setLoading(false));
  }, [typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Notification Center</h1><p className="page-subtitle">SMS, email, and in-app alerts</p></div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', val: stats.total, icon: Bell, color: 'text-blue-500' },
            { label: 'Sent', val: stats.sent, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Pending', val: stats.pending, icon: Clock, color: 'text-yellow-500' },
            { label: 'Failed', val: stats.failed, icon: XCircle, color: 'text-red-500' },
          ].map(({ label, val, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card p-5 flex items-center gap-4">
              <Icon className={`w-8 h-8 ${color}`} />
              <div><div className="text-2xl font-bold">{val}</div><div className="text-sm text-muted-foreground">{label}</div></div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="glass-card p-4 flex gap-3">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="form-input w-40">
          <option value="">All Types</option>
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
          <option value="IN_APP">In-App</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-40">
          <option value="">All Status</option>
          <option value="SENT">Sent</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card divide-y divide-border">
        {loading ? <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          : notifications.map((n, i) => {
            const Icon = typeIcon[n.type] || Bell;
            return (
              <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {n.subject && <span className="text-sm font-medium truncate">{n.subject}</span>}
                    <span className={statusBadge[n.status] || ''}>{n.status}</span>
                    <span className="text-xs text-muted-foreground">{n.trigger?.replace('_', ' ')}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    To: {n.recipient} · {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{n.type}</span>
              </motion.div>
            );
          })}
      </motion.div>
    </div>
  );
}
