'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { glApi } from '@/lib/api';
import { BookOpen, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(n);

type TabType = 'trial-balance' | 'pnl' | 'balance-sheet' | 'accounts';

export default function GlPage() {
  const [tab, setTab] = useState<TabType>('trial-balance');
  const [trialBalance, setTrialBalance] = useState<any[]>([]);
  const [pnl, setPnl] = useState<any>(null);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tb, p, bs, acc] = await Promise.all([
          glApi.getTrialBalance(), glApi.getProfitAndLoss(), glApi.getBalanceSheet(), glApi.getAccounts()
        ]);
        setTrialBalance(tb.data || []);
        setPnl(p.data);
        setBalanceSheet(bs.data);
        setAccounts(acc.data || []);
      } catch {
        setTrialBalance([
          { code: '1001', name: 'Cash and Cash Equivalents', type: 'ASSET', debitTotal: 5500000, creditTotal: 1000000, balance: 4500000 },
          { code: '1100', name: 'Loans Receivable', type: 'ASSET', debitTotal: 12500000, creditTotal: 0, balance: 12500000 },
          { code: '2001', name: 'Fixed Deposits Payable', type: 'LIABILITY', debitTotal: 0, creditTotal: 4000000, balance: 4000000 },
          { code: '4001', name: 'Loan Interest Income', type: 'INCOME', debitTotal: 0, creditTotal: 850000, balance: 850000 },
          { code: '5001', name: 'FD Interest Expense', type: 'EXPENSE', debitTotal: 210000, creditTotal: 0, balance: 210000 },
        ]);
        setPnl({ totalIncome: 850000, totalExpenses: 210000, netProfit: 640000,
          income: [{ name: 'Loan Interest Income', amount: 850000 }],
          expenses: [{ name: 'FD Interest Expense', amount: 210000 }] });
        setBalanceSheet({ totalAssets: 17000000, totalLiabilities: 4000000, totalEquity: 13000000,
          assets: [{ code: '1001', name: 'Cash', balance: 4500000 }, { code: '1100', name: 'Loans Receivable', balance: 12500000 }],
          liabilities: [{ code: '2001', name: 'FD Payable', balance: 4000000 }],
          equity: [{ code: '3001', name: 'Share Capital', balance: 13000000 }] });
        setAccounts([
          { code: '1001', name: 'Cash and Cash Equivalents', type: 'ASSET', normalBalance: 'DEBIT', isActive: true },
          { code: '1100', name: 'Loans Receivable', type: 'ASSET', normalBalance: 'DEBIT', isActive: true },
          { code: '2001', name: 'Fixed Deposits Payable', type: 'LIABILITY', normalBalance: 'CREDIT', isActive: true },
          { code: '4001', name: 'Loan Interest Income', type: 'INCOME', normalBalance: 'CREDIT', isActive: true },
        ]);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const tabs = [
    { id: 'trial-balance', label: 'Trial Balance', icon: BookOpen },
    { id: 'pnl', label: 'P&L Statement', icon: TrendingUp },
    { id: 'balance-sheet', label: 'Balance Sheet', icon: BarChart2 },
    { id: 'accounts', label: 'Chart of Accounts', icon: BookOpen },
  ];

  const typeColors: Record<string, string> = {
    ASSET: 'text-blue-600', LIABILITY: 'text-red-600', EQUITY: 'text-purple-600',
    INCOME: 'text-green-600', EXPENSE: 'text-orange-600',
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">General Ledger</h1><p className="page-subtitle">Double-entry accounting and financial statements</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
          {tab === 'trial-balance' && (
            <>
              <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold">Trial Balance</h3>
                <div className="text-sm text-muted-foreground">As of {new Date().toLocaleDateString()}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50"><tr>
                    {['Code','Account Name','Type','Debit','Credit','Balance'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {trialBalance.map(a => (
                      <tr key={a.code} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm font-mono">{a.code}</td>
                        <td className="px-4 py-3 text-sm font-medium">{a.name}</td>
                        <td className="px-4 py-3 text-xs"><span className={`font-medium ${typeColors[a.type]}`}>{a.type}</span></td>
                        <td className="px-4 py-3 text-sm text-right">{a.debitTotal > 0 ? fmt(a.debitTotal) : '—'}</td>
                        <td className="px-4 py-3 text-sm text-right">{a.creditTotal > 0 ? fmt(a.creditTotal) : '—'}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">{fmt(a.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/50 border-t-2 border-border font-bold">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm">Total</td>
                      <td className="px-4 py-3 text-sm text-right">{fmt(trialBalance.reduce((s,a) => s + a.debitTotal, 0))}</td>
                      <td className="px-4 py-3 text-sm text-right">{fmt(trialBalance.reduce((s,a) => s + a.creditTotal, 0))}</td>
                      <td className="px-4 py-3 text-sm text-right">{fmt(trialBalance.reduce((s,a) => s + a.balance, 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}

          {tab === 'pnl' && pnl && (
            <div className="p-6 space-y-6">
              <h3 className="font-semibold text-lg">Profit & Loss Statement</h3>
              <div>
                <h4 className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">Income</h4>
                {pnl.income?.map((i: any) => (
                  <div key={i.name} className="flex justify-between py-2 border-b border-border text-sm">
                    <span>{i.name}</span><span className="font-medium text-green-600">{fmt(i.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 text-sm font-bold border-t-2 border-border mt-1">
                  <span>Total Income</span><span className="text-green-600">{fmt(pnl.totalIncome)}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3">Expenses</h4>
                {pnl.expenses?.map((e: any) => (
                  <div key={e.name} className="flex justify-between py-2 border-b border-border text-sm">
                    <span>{e.name}</span><span className="font-medium text-red-600">{fmt(e.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 text-sm font-bold border-t-2 border-border mt-1">
                  <span>Total Expenses</span><span className="text-red-600">{fmt(pnl.totalExpenses)}</span>
                </div>
              </div>
              <div className={`flex justify-between py-4 px-6 rounded-xl text-lg font-bold ${pnl.netProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                <span>Net {pnl.netProfit >= 0 ? 'Profit' : 'Loss'}</span>
                <span>{fmt(Math.abs(pnl.netProfit))}</span>
              </div>
            </div>
          )}

          {tab === 'balance-sheet' && balanceSheet && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Assets</h4>
                {balanceSheet.assets?.map((a: any) => (
                  <div key={a.code} className="flex justify-between py-2 border-b border-border text-sm">
                    <span>{a.name}</span><span className="font-medium">{fmt(a.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 font-bold border-t-2 border-border text-blue-600">
                  <span>Total Assets</span><span>{fmt(balanceSheet.totalAssets)}</span>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3">Liabilities</h4>
                  {balanceSheet.liabilities?.map((l: any) => (
                    <div key={l.code} className="flex justify-between py-2 border-b border-border text-sm">
                      <span>{l.name}</span><span className="font-medium">{fmt(l.balance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-3 font-bold border-t-2 border-border text-red-600">
                    <span>Total Liabilities</span><span>{fmt(balanceSheet.totalLiabilities)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-3">Equity</h4>
                  {balanceSheet.equity?.map((e: any) => (
                    <div key={e.code} className="flex justify-between py-2 border-b border-border text-sm">
                      <span>{e.name}</span><span className="font-medium">{fmt(e.balance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-3 font-bold border-t-2 border-border text-purple-600">
                    <span>Total Equity</span><span>{fmt(balanceSheet.totalEquity)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'accounts' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50"><tr>
                  {['Code','Account Name','Type','Normal Balance','Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {accounts.map(a => (
                    <tr key={a.code} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-mono font-bold">{a.code}</td>
                      <td className="px-4 py-3 text-sm font-medium">{a.name}</td>
                      <td className="px-4 py-3 text-xs"><span className={`font-semibold ${typeColors[a.type]}`}>{a.type}</span></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.normalBalance}</td>
                      <td className="px-4 py-3"><span className={a.isActive ? 'badge-active' : 'badge-closed'}>{a.isActive ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
