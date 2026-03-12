'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { CreditCard, Users, PiggyBank, Briefcase, TrendingUp, AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { dashboardApi } from '@/lib/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const fmt = (v: number) => v >= 1000000 ? `LKR ${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `LKR ${(v / 1000).toFixed(0)}K` : `LKR ${v}`;

function KpiCard({ title, value, subtitle, icon: Icon, color, delay }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }} className="stat-card">
      <div className={`p-3 rounded-xl ${color} w-fit`}><Icon className="w-5 h-5 text-white" /></div>
      <div className="mt-4">
        <div className="text-2xl font-bold">{value ?? '—'}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</div>}
      </div>
    </motion.div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="glass-card p-6 border border-destructive/20 text-center">
      <p className="text-sm text-destructive font-medium">{message}</p>
      <p className="text-xs text-muted-foreground mt-1">Ensure the API server is running on port 3001</p>
    </div>
  );
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [aging, setAging] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [k, c, p, b, a] = await Promise.all([
          dashboardApi.getKpis(),
          dashboardApi.getMonthlyCollections(),
          dashboardApi.getLoanPortfolio(),
          dashboardApi.getBranchPerformance(),
          dashboardApi.getOverdueAging(),
        ]);
        setKpis(k.data);
        setCollections(Array.isArray(c.data) ? c.data : []);
        setPortfolio(Array.isArray(p.data) ? p.data : []);
        setBranches(Array.isArray(b.data) ? b.data : []);
        setAging(Array.isArray(a.data) ? a.data : []);
      } catch {
        setError('Unable to load dashboard data. Please check the API server.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return <ErrorBox message={error} />;

  const kpiCards = [
    { title: 'Total Customers', value: kpis?.totalCustomers?.toLocaleString(), icon: Users, color: 'bg-blue-500', delay: 0 },
    { title: 'Active Loans', value: kpis?.totalActiveLoans?.toLocaleString(), subtitle: fmt(kpis?.loanPortfolioValue || 0), icon: CreditCard, color: 'bg-violet-500', delay: 0.06 },
    { title: 'Active Leases', value: kpis?.totalActiveLeases?.toLocaleString(), icon: Briefcase, color: 'bg-emerald-500', delay: 0.12 },
    { title: 'Active FDs', value: kpis?.totalActiveFDs?.toLocaleString(), subtitle: fmt(kpis?.fdTotalValue || 0), icon: PiggyBank, color: 'bg-amber-500', delay: 0.18 },
    { title: 'Monthly Collections', value: fmt(kpis?.monthlyCollections || 0), icon: TrendingUp, color: 'bg-green-500', delay: 0.24 },
    { title: 'Overdue Installments', value: kpis?.overdueInstallments?.toLocaleString(), icon: AlertTriangle, color: 'bg-red-500', delay: 0.30 },
    { title: 'Defaulted Loans', value: kpis?.defaultedLoans?.toLocaleString(), icon: Activity, color: 'bg-rose-600', delay: 0.36 },
    { title: 'Recovery Cases', value: kpis?.openRecoveryCases?.toLocaleString(), icon: DollarSign, color: 'bg-orange-500', delay: 0.42 },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Executive Dashboard</h1><p className="page-subtitle">Real-time banking portfolio overview</p></div>
        <div className="text-sm text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map(c => <KpiCard key={c.title} {...c} />)}
      </div>

      {collections.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 lg:col-span-2">
            <h3 className="font-semibold mb-4">Monthly Collections Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={collections}>
                <defs>
                  <linearGradient id="collGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: any) => [fmt(+v), 'Collections']} />
                <Area type="monotone" dataKey="collections" stroke="#3b82f6" strokeWidth={2} fill="url(#collGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {portfolio.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }} className="glass-card p-6">
              <h3 className="font-semibold mb-4">Loan Portfolio by Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={portfolio} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="count" nameKey="status">
                    {portfolio.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {portfolio.slice(0, 4).map((item, i) => (
                  <div key={item.status} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i] }} /><span className="text-muted-foreground">{item.status}</span></span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {(branches.length > 0 || aging.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {branches.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
              <h3 className="font-semibold mb-4">Branch Portfolio Comparison</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={branches} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip formatter={(v: any) => [fmt(+v)]} />
                  <Legend />
                  <Bar dataKey="loanPortfolio" name="Loans" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="fdPortfolio" name="FDs" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
          {aging.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="glass-card p-6">
              <h3 className="font-semibold mb-4">Overdue Aging Buckets</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={aging}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Cases" radius={[4, 4, 0, 0]}>
                    {aging.map((_, i) => <Cell key={i} fill={i < 2 ? '#f59e0b' : i < 3 ? '#f97316' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {aging.map(b => (
                  <div key={b.label} className="flex justify-between text-xs bg-muted/50 rounded-lg px-2 py-1">
                    <span className="text-muted-foreground">{b.label}</span>
                    <span className="font-medium">{b.count} ({fmt(b.amount)})</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
