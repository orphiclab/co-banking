'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { loansApi } from '@/lib/api';
import { Plus, Search, CreditCard } from 'lucide-react';

const statusBadge: Record<string, string> = {
  ACTIVE: 'badge-active', CLOSED: 'badge-closed', DEFAULTED: 'badge-defaulted',
  SUBMITTED: 'badge-pending', APPROVED: 'badge-approved', DISBURSED: 'badge-active',
  UNDER_REVIEW: 'badge-pending', REJECTED: 'badge-overdue', DRAFT: 'badge-closed', WRITTEN_OFF: 'badge-defaulted',
};

function formatLKR(n: number) {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(n);
}

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    loansApi.getAll({ search, page, limit: 20, status: status || undefined })
      .then(r => { setLoans(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => {
        setLoans([
          { id: '1', loanNumber: 'LN-2024-001', loanType: 'Personal', principalAmount: 500000, outstandingBalance: 282440,
            interestRate: 0.12, termMonths: 24, emiAmount: 23536, status: 'ACTIVE',
            customer: { firstName: 'Rajan', lastName: 'Perera', customerNumber: 'CUS-2024-001' },
            branch: { name: 'Head Office' }, disbursedAt: '2024-01-15', maturityDate: '2026-01-15' },
          { id: '2', loanNumber: 'LN-2024-002', loanType: 'Business', principalAmount: 2000000, outstandingBalance: 2050177,
            interestRate: 0.14, termMonths: 36, emiAmount: 68339, status: 'ACTIVE',
            customer: { firstName: 'Amara', lastName: 'Silva', customerNumber: 'CUS-2024-002' },
            branch: { name: 'South Branch' }, disbursedAt: '2024-03-01', maturityDate: '2027-03-01' },
          { id: '3', loanNumber: 'LN-2023-055', loanType: 'Personal', principalAmount: 200000, outstandingBalance: 163545,
            interestRate: 0.16, termMonths: 12, emiAmount: 18171, status: 'DEFAULTED',
            customer: { firstName: 'Kasun', lastName: 'Fernando', customerNumber: 'CUS-2024-003' },
            branch: { name: 'North Branch' }, disbursedAt: '2023-06-01', maturityDate: '2024-06-01' },
        ]);
        setTotal(3);
      })
      .finally(() => setLoading(false));
  }, [search, page, status]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Loan Management</h1><p className="page-subtitle">{total} loans in portfolio</p></div>
        <button onClick={() => router.push('/loans/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Loan Application
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by loan number, customer..." className="form-input pl-10" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="form-input sm:w-44">
          <option value="">All Statuses</option>
          {['DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','ACTIVE','DEFAULTED','CLOSED','WRITTEN_OFF'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {['Loan #', 'Customer', 'Type', 'Principal', 'Outstanding', 'Rate', 'EMI', 'Status', 'Maturity', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={10} className="py-12 text-center">
                  <div className="flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                </td></tr>
              ) : loans.map((loan, idx) => (
                <motion.tr key={loan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => router.push(`/loans/${loan.id}`)}
                  className="table-row-hover">
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{loan.loanNumber}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium">{loan.customer?.firstName} {loan.customer?.lastName}</div>
                    <div className="text-xs text-muted-foreground">{loan.customer?.customerNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{loan.loanType}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatLKR(loan.principalAmount)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-primary">{formatLKR(loan.outstandingBalance)}</td>
                  <td className="px-4 py-3 text-sm">{(loan.interestRate * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-sm">{formatLKR(loan.emiAmount)}/mo</td>
                  <td className="px-4 py-3"><span className={statusBadge[loan.status] || 'badge-closed'}>{loan.status}</span></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {loan.maturityDate ? new Date(loan.maturityDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CreditCard className="w-4 h-4 text-muted-foreground inline" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex justify-between text-sm text-muted-foreground">
          <span>Showing {loans.length} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-ghost px-3 py-1 text-xs disabled:opacity-50">Prev</button>
            <span className="px-3 py-1 rounded bg-muted text-xs">{page}</span>
            <button onClick={() => setPage(p => p+1)} disabled={loans.length < 20} className="btn-ghost px-3 py-1 text-xs disabled:opacity-50">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
