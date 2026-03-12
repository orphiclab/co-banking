'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { reportingApi } from '@/lib/api';
import { BarChart3, FileText, TrendingDown, Building } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const fmt = (n: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(n);

export default function ReportingPage() {
  const [tab, setTab] = useState('portfolio');
  const [portfolioSummary, setPortfolioSummary] = useState<any>(null);
  const [branchData, setBranchData] = useState<any[]>([]);
  const [agingData, setAgingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      reportingApi.getLoanPortfolio(),
      reportingApi.getBranchPerformance(),
      reportingApi.getOverdueAging(),
    ]).then(([p, b, a]) => {
      setPortfolioSummary(p.data.summary);
      setBranchData(b.data || []);
      setAgingData(a.data || []);
    }).catch(() => {
      setPortfolioSummary({ total: 361, totalPrincipal: 14700000, totalOutstanding: 12693722, totalCollected: 2006278,
        byStatus: { ACTIVE: { count: 289, amount: 10450177 }, CLOSED: { count: 45, amount: 0 }, DEFAULTED: { count: 8, amount: 980000 } } });
      setBranchData([
        { name: 'Head Office', activeLoans: 180, totalDisbursed: 6500000, totalCollected: 1200000, outstanding: 5300000, collectionRate: 18.5 },
        { name: 'North Branch', activeLoans: 95, totalDisbursed: 3800000, totalCollected: 580000, outstanding: 3220000, collectionRate: 15.3 },
        { name: 'South Branch', activeLoans: 67, totalDisbursed: 2200000, totalCollected: 420000, outstanding: 1780000, collectionRate: 19.1 },
      ]);
      setAgingData([
        { label: '1-30 days', count: 12, amount: 280000 }, { label: '31-60 days', count: 6, amount: 145000 },
        { label: '61-90 days', count: 3, amount: 89000 }, { label: '91-120 days', count: 2, amount: 65000 },
        { label: '120+ days', count: 8, amount: 285000 },
      ]);
    }).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'portfolio', label: 'Loan Portfolio', icon: FileText },
    { id: 'branch', label: 'Branch Performance', icon: Building },
    { id: 'aging', label: 'Overdue Aging', icon: TrendingDown },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Reports & Analytics</h1><p className="page-subtitle">Operational, financial, and regulatory reports</p></div>
      </div>

      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {tab === 'portfolio' && portfolioSummary && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Loans', val: portfolioSummary.total },
                  { label: 'Total Disbursed', val: fmt(portfolioSummary.totalPrincipal) },
                  { label: 'Outstanding', val: fmt(portfolioSummary.totalOutstanding) },
                  { label: 'Total Collected', val: fmt(portfolioSummary.totalCollected) },
                ].map(({ label, val }) => (
                  <div key={label} className="glass-card p-5">
                    <div className="text-2xl font-bold">{val}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Portfolio by Status</h3>
                <div className="space-y-3">
                  {portfolioSummary.byStatus && Object.entries(portfolioSummary.byStatus).map(([status, data]: [string, any]) => (
                    <div key={status} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-muted-foreground">{status}</div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="h-2 bg-primary rounded-full" style={{ width: `${(data.count / portfolioSummary.total) * 100}%` }} />
                      </div>
                      <div className="text-sm font-medium w-8">{data.count}</div>
                      <div className="text-sm text-muted-foreground w-28 text-right">{fmt(data.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'branch' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Branch Portfolio Comparison</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={branchData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(v: any) => fmt(+v)} />
                    <Legend />
                    <Bar dataKey="totalDisbursed" name="Disbursed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outstanding" name="Outstanding" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalCollected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50"><tr>
                    {['Branch','Active Loans','Disbursed','Collected','Outstanding','Collection Rate'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {branchData.map(b => (
                      <tr key={b.name} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm font-medium">{b.name}</td>
                        <td className="px-4 py-3 text-sm">{b.activeLoans}</td>
                        <td className="px-4 py-3 text-sm">{fmt(b.totalDisbursed)}</td>
                        <td className="px-4 py-3 text-sm text-green-600">{fmt(b.totalCollected)}</td>
                        <td className="px-4 py-3 text-sm text-primary">{fmt(b.outstanding)}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-1.5 w-16">
                              <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${Math.min(100, b.collectionRate * 4)}%` }} />
                            </div>
                            <span>{b.collectionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'aging' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Overdue Aging Analysis</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={agingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="count" name="Cases" fill="#ef4444" radius={[4,4,0,0]} />
                    <Bar yAxisId="right" dataKey="amount" name="Amount (LKR)" fill="#f97316" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50"><tr>
                    {['Aging Bucket','Count','Overdue Amount','% of Total'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {agingData.map((b, i) => {
                      const totalAmt = agingData.reduce((s, x) => s + x.amount, 0);
                      return (
                        <tr key={b.label} className="hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm font-medium">{b.label}</td>
                          <td className="px-4 py-3 text-sm">{b.count}</td>
                          <td className="px-4 py-3 text-sm font-medium text-danger">{fmt(b.amount)}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-1.5 w-20">
                                <div className="h-1.5 rounded-full bg-danger" style={{ width: `${totalAmt ? (b.amount / totalAmt) * 100 : 0}%` }} />
                              </div>
                              <span>{totalAmt ? ((b.amount / totalAmt) * 100).toFixed(1) : 0}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
