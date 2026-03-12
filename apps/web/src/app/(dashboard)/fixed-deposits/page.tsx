'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fdApi } from '@/lib/api';
import { Plus, Search, PiggyBank } from 'lucide-react';
import { differenceInDays } from 'date-fns';

const statusBadge: Record<string, string> = {
  ACTIVE: 'badge-active', MATURED: 'badge-approved', RENEWED: 'badge-pending',
  WITHDRAWN: 'badge-closed', CLOSED: 'badge-closed',
};
const fmt = (n: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(n);

export default function FixedDepositsPage() {
  const [fds, setFds] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fdApi.getAll({ search, status: status || undefined, limit: 20 })
      .then(r => { setFds(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => {
        setFds([
          { id: '1', fdNumber: 'FD-2024-001', principalAmount: 1000000, interestRate: 0.10,
            termMonths: 12, maturityAmount: 1100000, interestAccrued: 54795, status: 'ACTIVE',
            startDate: '2024-06-01', maturityDate: '2025-06-01', autoRenew: true,
            customer: { firstName: 'Rajan', lastName: 'Perera' }, branch: { name: 'Head Office' } },
          { id: '2', fdNumber: 'FD-2024-002', principalAmount: 3000000, interestRate: 0.115,
            termMonths: 24, maturityAmount: 3690000, interestAccrued: 258123, status: 'ACTIVE',
            startDate: '2024-01-01', maturityDate: '2026-01-01', autoRenew: false,
            customer: { firstName: 'Amara', lastName: 'Silva' }, branch: { name: 'South Branch' } },
        ]);
        setTotal(2);
      })
      .finally(() => setLoading(false));
  }, [search, status]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Fixed Deposits</h1><p className="page-subtitle">{total} active deposits</p></div>
        <button onClick={() => router.push('/fixed-deposits/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Fixed Deposit
        </button>
      </div>
      <div className="glass-card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search FDs..." className="form-input pl-10" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="form-input w-44">
          <option value="">All Statuses</option>
          {['ACTIVE','MATURED','RENEWED','WITHDRAWN','CLOSED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['FD #','Customer','Principal','Rate','Term','Interest Accrued','Maturity Value','Status','Matures In','Auto-Renew'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!loading && fds.map((fd, i) => {
                const daysLeft = fd.maturityDate ? differenceInDays(new Date(fd.maturityDate), new Date()) : 0;
                return (
                  <motion.tr key={fd.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    onClick={() => router.push(`/fixed-deposits/${fd.id}`)} className="table-row-hover">
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{fd.fdNumber}</td>
                    <td className="px-4 py-3 text-sm font-medium">{fd.customer?.firstName} {fd.customer?.lastName}</td>
                    <td className="px-4 py-3 text-sm font-medium">{fmt(fd.principalAmount)}</td>
                    <td className="px-4 py-3 text-sm">{(fd.interestRate * 100).toFixed(1)}% p.a.</td>
                    <td className="px-4 py-3 text-sm">{fd.termMonths} mo</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">{fmt(fd.interestAccrued)}</td>
                    <td className="px-4 py-3 text-sm font-bold">{fmt(fd.maturityAmount)}</td>
                    <td className="px-4 py-3"><span className={statusBadge[fd.status] || ''}>{fd.status}</span></td>
                    <td className="px-4 py-3 text-sm">
                      {daysLeft > 0 ? <span className={daysLeft < 30 ? 'text-warning font-medium' : 'text-muted-foreground'}>{daysLeft}d</span>
                        : <span className="text-danger">Matured</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {fd.autoRenew ? <span className="badge-active">Yes</span> : <span className="badge-closed">No</span>}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
