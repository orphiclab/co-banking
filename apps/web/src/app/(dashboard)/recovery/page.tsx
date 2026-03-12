'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { recoveryApi } from '@/lib/api';
import { AlertTriangle, Search } from 'lucide-react';

const statusBadge: Record<string, string> = {
  OPEN: 'badge-pending', REMINDED: 'badge-pending', ESCALATED: 'badge-overdue',
  LEGAL: 'badge-defaulted', SETTLED: 'badge-active', WRITTEN_OFF: 'badge-closed',
};
const fmt = (n: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(n);

export default function RecoveryPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    recoveryApi.getAll({ status: status || undefined, limit: 20 })
      .then(r => { setCases(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => {
        setCases([{
          id: '1', caseNumber: 'RC-2024-001', overdueAmount: 163545, overdueDays: 285,
          recoveredAmount: 0, status: 'ESCALATED',
          loan: { loanNumber: 'LN-2023-055', customer: { firstName: 'Kasun', lastName: 'Fernando', phone: '+94 76 567 8901' } },
          actions: [{ actionType: 'LEGAL_NOTICE', createdAt: '2024-09-01' }],
        }]);
        setTotal(1);
      })
      .finally(() => setLoading(false));
  }, [status]);

  const agingColor = (days: number) =>
    days < 30 ? 'text-warning' : days < 90 ? 'text-orange-500' : 'text-danger';

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Recovery Management</h1><p className="page-subtitle">{total} active recovery cases</p></div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open Cases', val: cases.filter(c => c.status === 'OPEN').length, color: 'bg-yellow-500' },
          { label: 'Escalated', val: cases.filter(c => c.status === 'ESCALATED').length, color: 'bg-orange-500' },
          { label: 'Legal', val: cases.filter(c => c.status === 'LEGAL').length, color: 'bg-red-600' },
          { label: 'Total Overdue', val: fmt(cases.reduce((s, c) => s + +c.overdueAmount, 0)), color: 'bg-rose-600' },
        ].map(({ label, val, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-5">
            <div className={`w-2 h-8 ${color} rounded-full mb-3`} />
            <div className="text-2xl font-bold">{val}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-4">
        <select value={status} onChange={e => setStatus(e.target.value)} className="form-input w-48">
          <option value="">All Statuses</option>
          {['OPEN','REMINDED','ESCALATED','LEGAL','SETTLED','WRITTEN_OFF'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border"><tr>
              {['Case #','Loan','Customer','Overdue Amount','Overdue Days','Recovered','Status','Last Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {!loading && cases.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/recovery/${c.id}`)} className="table-row-hover">
                  <td className="px-4 py-3 text-sm font-mono">{c.caseNumber}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.loan?.loanNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium">{c.loan?.customer?.firstName} {c.loan?.customer?.lastName}</td>
                  <td className="px-4 py-3 text-sm font-bold text-danger">{fmt(c.overdueAmount)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-bold ${agingColor(c.overdueDays)}`}>{c.overdueDays}d</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600">{fmt(c.recoveredAmount)}</td>
                  <td className="px-4 py-3"><span className={statusBadge[c.status] || ''}>{c.status}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.actions?.[0]?.actionType?.replace('_',' ')} {c.actions?.[0]?.createdAt ? new Date(c.actions[0].createdAt).toLocaleDateString() : ''}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
