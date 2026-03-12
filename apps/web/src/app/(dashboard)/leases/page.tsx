'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { leasesApi } from '@/lib/api';
import { Plus, Search, Briefcase } from 'lucide-react';

const statusBadge: Record<string, string> = {
  ACTIVE: 'badge-active', CLOSED: 'badge-closed', DEFAULTED: 'badge-defaulted', DRAFT: 'badge-pending',
};
const fmt = (n: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(n);

export default function LeasesPage() {
  const [leases, setLeases] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    leasesApi.getAll({ search, status: status || undefined, limit: 20 })
      .then(r => { setLeases(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => {
        setLeases([
          { id: '1', leaseNumber: 'LS-2024-001', leaseType: 'Financial', leaseAmount: 8500000,
            outstandingBalance: 7842318, monthlyInstallment: 178234, status: 'ACTIVE',
            customer: { firstName: 'Amara', lastName: 'Silva' },
            asset: { name: 'Toyota Hilux 2023', category: 'Vehicle' },
            startDate: '2024-02-01', endDate: '2028-02-01' },
        ]);
        setTotal(1);
      })
      .finally(() => setLoading(false));
  }, [search, status]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Lease Management</h1><p className="page-subtitle">{total} leases</p></div>
        <button onClick={() => router.push('/leases/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Lease
        </button>
      </div>
      <div className="glass-card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leases..." className="form-input pl-10" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="form-input w-44">
          <option value="">All Statuses</option>
          {['DRAFT','ACTIVE','CLOSED','DEFAULTED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Lease #','Customer','Asset','Type','Lease Amount','Outstanding','Monthly','Status','End Date'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!loading && leases.map((l, i) => (
                <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/leases/${l.id}`)} className="table-row-hover">
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{l.leaseNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium">{l.customer?.firstName} {l.customer?.lastName}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{l.asset?.name}</div>
                    <div className="text-xs text-muted-foreground">{l.asset?.category}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{l.leaseType}</td>
                  <td className="px-4 py-3 text-sm font-medium">{fmt(l.leaseAmount)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-primary">{fmt(l.outstandingBalance)}</td>
                  <td className="px-4 py-3 text-sm">{fmt(l.monthlyInstallment)}/mo</td>
                  <td className="px-4 py-3"><span className={statusBadge[l.status] || ''}>{l.status}</span></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{l.endDate ? new Date(l.endDate).toLocaleDateString() : '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
