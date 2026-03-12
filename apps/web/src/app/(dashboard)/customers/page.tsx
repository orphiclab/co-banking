'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { customersApi } from '@/lib/api';
import { Plus, Search, Filter, ChevronRight } from 'lucide-react';

const kycBadge: Record<string, string> = {
  VERIFIED: 'badge-active', PENDING: 'badge-pending', REJECTED: 'badge-overdue',
};
const riskBadge: Record<string, string> = {
  LOW: 'badge-active', MEDIUM: 'badge-pending', HIGH: 'badge-overdue', VERY_HIGH: 'badge-defaulted',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [kycFilter, setKycFilter] = useState('');
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await customersApi.getAll({ search, page, limit: 20, kycStatus: kycFilter || undefined });
      setCustomers(data.data || []);
      setTotal(data.total || 0);
    } catch {
      // Demo data fallback
      setCustomers([
        { id: '1', customerNumber: 'CUS-2024-001', firstName: 'Rajan', lastName: 'Perera', email: 'rajan@email.com', phone: '+94 77 123 4567', kycStatus: 'VERIFIED', riskLevel: 'LOW', riskScore: 78, branch: { name: 'Head Office' } },
        { id: '2', customerNumber: 'CUS-2024-002', firstName: 'Amara', lastName: 'Silva', email: 'amara@email.com', phone: '+94 71 987 6543', kycStatus: 'VERIFIED', riskLevel: 'MEDIUM', riskScore: 62, branch: { name: 'South Branch' } },
        { id: '3', customerNumber: 'CUS-2024-003', firstName: 'Kasun', lastName: 'Fernando', email: 'kasun@email.com', phone: '+94 76 567 8901', kycStatus: 'PENDING', riskLevel: 'HIGH', riskScore: 38, branch: { name: 'North Branch' } },
      ]);
      setTotal(3);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, page, kycFilter]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Customers</h1><p className="page-subtitle">{total} customers registered</p></div>
        <button onClick={() => router.push('/customers/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Customer
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, NID..." className="form-input pl-10" />
        </div>
        <select value={kycFilter} onChange={e => { setKycFilter(e.target.value); setPage(1); }}
          className="form-input sm:w-44">
          <option value="">All KYC Status</option>
          <option value="VERIFIED">Verified</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {['Customer #', 'Name', 'Phone', 'Branch', 'KYC Status', 'Risk', 'Risk Score', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                </td></tr>
              ) : customers.map((c, idx) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => router.push(`/customers/${c.id}`)}
                  className="table-row-hover">
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{c.customerNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {c.firstName?.[0]}{c.lastName?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{c.firstName} {c.lastName}</div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{c.phone}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.branch?.name}</td>
                  <td className="px-4 py-3"><span className={kycBadge[c.kycStatus] || ''}>{c.kycStatus}</span></td>
                  <td className="px-4 py-3"><span className={riskBadge[c.riskLevel] || ''}>{c.riskLevel}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-1.5 w-16">
                        <div className="h-1.5 rounded-full" style={{
                          width: `${c.riskScore}%`,
                          background: c.riskScore >= 70 ? '#10b981' : c.riskScore >= 50 ? '#f59e0b' : '#ef4444'
                        }} />
                      </div>
                      <span className="text-xs font-medium">{c.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {customers.length} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-ghost px-3 py-1 text-xs disabled:opacity-50">Prev</button>
            <span className="px-3 py-1 rounded bg-muted text-xs">{page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={customers.length < 20}
              className="btn-ghost px-3 py-1 text-xs disabled:opacity-50">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
