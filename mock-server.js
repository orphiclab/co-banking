/**
 * Co-Banking Mock API Server
 * A lightweight Express server with in-memory data — no database required.
 * Run: node mock-server.js
 * Listens on: http://localhost:3001
 */

const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

// ─── In-Memory Store ──────────────────────────────────────────────────────────

const USERS = [
  { id: 'u1', email: 'admin@cobanking.com', password: 'Admin@123', firstName: 'Admin', lastName: 'User', role: 'ADMIN', branch: { id: 'b1', name: 'Head Office', code: 'HO' } },
  { id: 'u2', email: 'manager@cobanking.com', password: 'Manager@123', firstName: 'Branch', lastName: 'Manager', role: 'BRANCH_MANAGER', branch: { id: 'b1', name: 'Head Office', code: 'HO' } },
  { id: 'u3', email: 'loanoffice@cobanking.com', password: 'Loan@123', firstName: 'Loan', lastName: 'Officer', role: 'LOAN_OFFICER', branch: { id: 'b2', name: 'North Branch', code: 'NORTH' } },
  { id: 'u4', email: 'teller@cobanking.com', password: 'Teller@123', firstName: 'Bank', lastName: 'Teller', role: 'TELLER', branch: { id: 'b1', name: 'Head Office', code: 'HO' } },
  { id: 'u5', email: 'recovery@cobanking.com', password: 'Recovery@123', firstName: 'Recovery', lastName: 'Officer', role: 'RECOVERY_OFFICER', branch: { id: 'b3', name: 'South Branch', code: 'SOUTH' } },
];

const CUSTOMERS = [
  { id: 'c1', customerNumber: 'CUS-2024-001', firstName: 'Rajan', lastName: 'Perera', email: 'rajan@email.com', phone: '+94 77 123 4567', nationalId: '901234567V', kycStatus: 'VERIFIED', riskLevel: 'LOW', riskScore: 78, branch: { name: 'Head Office' }, createdAt: '2024-01-15' },
  { id: 'c2', customerNumber: 'CUS-2024-002', firstName: 'Amara', lastName: 'Silva', email: 'amara@email.com', phone: '+94 71 987 6543', nationalId: '851234567V', kycStatus: 'VERIFIED', riskLevel: 'MEDIUM', riskScore: 62, branch: { name: 'South Branch' }, createdAt: '2024-02-08' },
  { id: 'c3', customerNumber: 'CUS-2024-003', firstName: 'Kasun', lastName: 'Fernando', email: 'kasun@email.com', phone: '+94 76 567 8901', nationalId: '921234567V', kycStatus: 'PENDING', riskLevel: 'HIGH', riskScore: 38, branch: { name: 'North Branch' }, createdAt: '2024-03-22' },
  { id: 'c4', customerNumber: 'CUS-2024-004', firstName: 'Nimal', lastName: 'Dissanayake', email: 'nimal@email.com', phone: '+94 77 456 7890', nationalId: '781234567V', kycStatus: 'VERIFIED', riskLevel: 'LOW', riskScore: 85, branch: { name: 'Head Office' }, createdAt: '2024-04-01' },
  { id: 'c5', customerNumber: 'CUS-2024-005', firstName: 'Sunethra', lastName: 'Rajapaksa', email: 'sunethra@email.com', phone: '+94 70 111 2222', nationalId: '671234567V', kycStatus: 'VERIFIED', riskLevel: 'LOW', riskScore: 91, branch: { name: 'South Branch' }, createdAt: '2024-04-15' },
];

const LOANS = [
  { id: 'l1', loanNumber: 'LN-2024-001', loanType: 'Personal', principalAmount: 500000, outstandingBalance: 282440, interestRate: 0.12, termMonths: 24, emiAmount: 23536, status: 'ACTIVE', customer: { firstName: 'Rajan', lastName: 'Perera', customerNumber: 'CUS-2024-001' }, branch: { name: 'Head Office' }, disbursedAt: '2024-01-15', maturityDate: '2026-01-15', totalPaid: 217560 },
  { id: 'l2', loanNumber: 'LN-2024-002', loanType: 'Business', principalAmount: 2000000, outstandingBalance: 2050177, interestRate: 0.14, termMonths: 36, emiAmount: 68339, status: 'ACTIVE', customer: { firstName: 'Amara', lastName: 'Silva', customerNumber: 'CUS-2024-002' }, branch: { name: 'South Branch' }, disbursedAt: '2024-03-01', maturityDate: '2027-03-01', totalPaid: 204778 },
  { id: 'l3', loanNumber: 'LN-2023-055', loanType: 'Personal', principalAmount: 200000, outstandingBalance: 163545, interestRate: 0.16, termMonths: 12, emiAmount: 18171, status: 'DEFAULTED', customer: { firstName: 'Kasun', lastName: 'Fernando', customerNumber: 'CUS-2024-003' }, branch: { name: 'North Branch' }, disbursedAt: '2023-06-01', maturityDate: '2024-06-01', totalPaid: 36455 },
  { id: 'l4', loanNumber: 'LN-2024-003', loanType: 'Mortgage', principalAmount: 8500000, outstandingBalance: 8320000, interestRate: 0.11, termMonths: 120, emiAmount: 116956, status: 'ACTIVE', customer: { firstName: 'Nimal', lastName: 'Dissanayake', customerNumber: 'CUS-2024-004' }, branch: { name: 'Head Office' }, disbursedAt: '2024-02-01', maturityDate: '2034-02-01', totalPaid: 350000 },
  { id: 'l5', loanNumber: 'LN-2024-004', loanType: 'Personal', principalAmount: 350000, outstandingBalance: 0, interestRate: 0.13, termMonths: 12, emiAmount: 31250, status: 'CLOSED', customer: { firstName: 'Sunethra', lastName: 'Rajapaksa', customerNumber: 'CUS-2024-005' }, branch: { name: 'South Branch' }, disbursedAt: '2024-01-01', maturityDate: '2024-12-31', totalPaid: 385000 },
];

const LEASES = [
  { id: 'le1', leaseNumber: 'LS-2024-001', leaseType: 'Financial', leaseAmount: 8500000, outstandingBalance: 7842318, monthlyInstallment: 178234, status: 'ACTIVE', customer: { firstName: 'Amara', lastName: 'Silva' }, asset: { name: 'Toyota Hilux 2023', category: 'Vehicle' }, startDate: '2024-02-01', endDate: '2028-02-01' },
  { id: 'le2', leaseNumber: 'LS-2024-002', leaseType: 'Operating', leaseAmount: 1200000, outstandingBalance: 980000, monthlyInstallment: 46320, status: 'ACTIVE', customer: { firstName: 'Nimal', lastName: 'Dissanayake' }, asset: { name: 'Office Equipment Set', category: 'Equipment' }, startDate: '2024-05-01', endDate: '2026-05-01' },
];

const FDS = [
  { id: 'fd1', fdNumber: 'FD-2024-001', principalAmount: 1000000, interestRate: 0.10, termMonths: 12, maturityAmount: 1100000, interestAccrued: 54795, status: 'ACTIVE', startDate: '2024-06-01', maturityDate: '2025-06-01', autoRenew: true, customer: { firstName: 'Rajan', lastName: 'Perera' }, branch: { name: 'Head Office' } },
  { id: 'fd2', fdNumber: 'FD-2024-002', principalAmount: 3000000, interestRate: 0.115, termMonths: 24, maturityAmount: 3690000, interestAccrued: 258123, status: 'ACTIVE', startDate: '2024-01-01', maturityDate: '2026-01-01', autoRenew: false, customer: { firstName: 'Amara', lastName: 'Silva' }, branch: { name: 'South Branch' } },
  { id: 'fd3', fdNumber: 'FD-2023-088', principalAmount: 500000, interestRate: 0.09, termMonths: 6, maturityAmount: 522500, interestAccrued: 22500, status: 'MATURED', startDate: '2023-06-01', maturityDate: '2023-12-01', autoRenew: false, customer: { firstName: 'Sunethra', lastName: 'Rajapaksa' }, branch: { name: 'South Branch' } },
];

const RECOVERY = [
  { id: 'r1', caseNumber: 'RC-2024-001', overdueAmount: 163545, overdueDays: 285, recoveredAmount: 0, status: 'ESCALATED', loan: { loanNumber: 'LN-2023-055', customer: { firstName: 'Kasun', lastName: 'Fernando', phone: '+94 76 567 8901' } }, actions: [{ actionType: 'LEGAL_NOTICE', createdAt: '2024-09-01' }] },
  { id: 'r2', caseNumber: 'RC-2024-002', overdueAmount: 45000, overdueDays: 62, recoveredAmount: 15000, status: 'REMINDED', loan: { loanNumber: 'LN-2024-X01', customer: { firstName: 'Demo', lastName: 'Customer', phone: '+94 77 000 0001' } }, actions: [{ actionType: 'REMINDER', createdAt: '2024-11-01' }] },
];

const NOTIFICATIONS = [
  { id: 'n1', type: 'EMAIL', trigger: 'LOAN_DUE', status: 'SENT', recipient: 'rajan@email.com', subject: 'Loan EMI Due Reminder', message: 'Your EMI of LKR 23,536 is due on March 15.', createdAt: new Date().toISOString() },
  { id: 'n2', type: 'SMS', trigger: 'OVERDUE_ALERT', status: 'SENT', recipient: '+94 76 567 8901', subject: null, message: 'URGENT: Your loan instalment is 285 days overdue. Please contact us immediately.', createdAt: new Date().toISOString() },
  { id: 'n3', type: 'IN_APP', trigger: 'FD_MATURITY', status: 'PENDING', recipient: 'system', subject: 'FD Maturity Alert', message: 'Fixed Deposit FD-2024-001 matures in 30 days.', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n4', type: 'EMAIL', trigger: 'LOAN_DUE', status: 'SENT', recipient: 'amara@email.com', subject: 'Monthly Installment Reminder', message: 'Your lease installment of LKR 178,234 is due on March 20.', createdAt: new Date(Date.now() - 7200000).toISOString() },
];

const GL_ACCOUNTS = [
  { code: '1001', name: 'Cash and Cash Equivalents', type: 'ASSET', normalBalance: 'DEBIT', isActive: true, debitTotal: 5500000, creditTotal: 1000000, balance: 4500000 },
  { code: '1100', name: 'Loans Receivable', type: 'ASSET', normalBalance: 'DEBIT', isActive: true, debitTotal: 12500000, creditTotal: 0, balance: 12500000 },
  { code: '1200', name: 'Leases Receivable', type: 'ASSET', normalBalance: 'DEBIT', isActive: true, debitTotal: 9700000, creditTotal: 0, balance: 9700000 },
  { code: '1300', name: 'Fixed Assets', type: 'ASSET', normalBalance: 'DEBIT', isActive: true, debitTotal: 2000000, creditTotal: 0, balance: 2000000 },
  { code: '2001', name: 'Fixed Deposits Payable', type: 'LIABILITY', normalBalance: 'CREDIT', isActive: true, debitTotal: 0, creditTotal: 4522500, balance: 4522500 },
  { code: '2100', name: 'Customer Savings', type: 'LIABILITY', normalBalance: 'CREDIT', isActive: true, debitTotal: 0, creditTotal: 2100000, balance: 2100000 },
  { code: '3001', name: 'Share Capital', type: 'EQUITY', normalBalance: 'CREDIT', isActive: true, debitTotal: 0, creditTotal: 18000000, balance: 18000000 },
  { code: '4001', name: 'Loan Interest Income', type: 'INCOME', normalBalance: 'CREDIT', isActive: true, debitTotal: 0, creditTotal: 850000, balance: 850000 },
  { code: '4002', name: 'Lease Income', type: 'INCOME', normalBalance: 'CREDIT', isActive: true, debitTotal: 0, creditTotal: 280000, balance: 280000 },
  { code: '5001', name: 'FD Interest Expense', type: 'EXPENSE', normalBalance: 'DEBIT', isActive: true, debitTotal: 335000, creditTotal: 0, balance: 335000 },
  { code: '5002', name: 'Operating Expenses', type: 'EXPENSE', normalBalance: 'DEBIT', isActive: true, debitTotal: 180000, creditTotal: 0, balance: 180000 },
];

// ─── Token Management (simple in-memory) ─────────────────────────────────────
const ACTIVE_TOKENS = new Map();
let tokenCounter = 1;

function generateToken(userId) {
  const token = `mock-jwt-token-${userId}-${tokenCounter++}-${Date.now()}`;
  ACTIVE_TOKENS.set(token, userId);
  return token;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  const userId = ACTIVE_TOKENS.get(token);
  if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });
  const user = USERS.find(u => u.id === userId);
  if (!user) return res.status(401).json({ message: 'User not found' });
  req.user = user;
  next();
}

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = generateToken(user.id);
  const { password: _, ...safeUser } = user;
  res.json({ accessToken: token, user: safeUser });
});

app.post('/api/auth/logout', (req, res) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) ACTIVE_TOKENS.delete(auth.slice(7));
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/profile', authMiddleware, (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json(safeUser);
});

// ─── Dashboard Routes ─────────────────────────────────────────────────────────
app.get('/api/dashboard/kpis', authMiddleware, (req, res) => {
  res.json({
    totalCustomers: CUSTOMERS.length,
    totalActiveLoans: LOANS.filter(l => l.status === 'ACTIVE').length,
    totalActiveFDs: FDS.filter(f => f.status === 'ACTIVE').length,
    totalActiveLeases: LEASES.filter(l => l.status === 'ACTIVE').length,
    loanPortfolioValue: LOANS.filter(l => l.status === 'ACTIVE').reduce((s, l) => s + l.outstandingBalance, 0),
    fdTotalValue: FDS.filter(f => f.status === 'ACTIVE').reduce((s, f) => s + f.principalAmount, 0),
    monthlyCollections: 1250000,
    overdueInstallments: 23,
    defaultedLoans: LOANS.filter(l => l.status === 'DEFAULTED').length,
    openRecoveryCases: RECOVERY.filter(r => !['SETTLED', 'WRITTEN_OFF'].includes(r.status)).length,
  });
});

app.get('/api/dashboard/monthly-collections', authMiddleware, (req, res) => {
  const months = ['Mar 25','Apr 25','May 25','Jun 25','Jul 25','Aug 25','Sep 25','Oct 25','Nov 25','Dec 25','Jan 26','Feb 26'];
  const collections = [980000, 1100000, 950000, 1300000, 1150000, 1400000, 1250000, 1350000, 1500000, 1200000, 1600000, 1250000];
  res.json(months.map((month, i) => ({ month, collections: collections[i] })));
});

app.get('/api/dashboard/loan-portfolio', authMiddleware, (req, res) => {
  const byStatus = {};
  LOANS.forEach(l => {
    if (!byStatus[l.status]) byStatus[l.status] = { status: l.status, count: 0, value: 0 };
    byStatus[l.status].count++;
    byStatus[l.status].value += l.outstandingBalance;
  });
  res.json(Object.values(byStatus));
});

app.get('/api/dashboard/branch-performance', authMiddleware, (req, res) => {
  res.json([
    { name: 'Head Office', code: 'HO', activeLoans: 180, loanPortfolio: 6500000, fdPortfolio: 4200000, totalCollected: 1200000 },
    { name: 'North Branch', code: 'NORTH', activeLoans: 95, loanPortfolio: 3800000, fdPortfolio: 2900000, totalCollected: 580000 },
    { name: 'South Branch', code: 'SOUTH', activeLoans: 67, loanPortfolio: 2200000, fdPortfolio: 1800000, totalCollected: 420000 },
  ]);
});

app.get('/api/dashboard/overdue-aging', authMiddleware, (req, res) => {
  res.json([
    { label: '1-30 days', count: 12, amount: 280000 },
    { label: '31-60 days', count: 6, amount: 145000 },
    { label: '61-90 days', count: 3, amount: 89000 },
    { label: '91-120 days', count: 2, amount: 65000 },
    { label: '120+ days', count: 8, amount: 285000 },
  ]);
});

app.get('/api/dashboard/recovery-performance', authMiddleware, (req, res) => {
  res.json({ totalCases: RECOVERY.length, totalOverdueAmount: RECOVERY.reduce((s,r)=>s+r.overdueAmount,0), totalRecovered: RECOVERY.reduce((s,r)=>s+r.recoveredAmount,0), recoveryRate: 7.94 });
});

// ─── Customers Routes ─────────────────────────────────────────────────────────
app.get('/api/customers', authMiddleware, (req, res) => {
  const { search = '', page = 1, limit = 20, kycStatus } = req.query;
  let data = [...CUSTOMERS];
  if (search) data = data.filter(c => `${c.firstName} ${c.lastName} ${c.email} ${c.nationalId}`.toLowerCase().includes(search.toLowerCase()));
  if (kycStatus) data = data.filter(c => c.kycStatus === kycStatus);
  const total = data.length;
  const start = (page - 1) * limit;
  data = data.slice(start, start + +limit);
  res.json({ data, total, page: +page, limit: +limit });
});

app.get('/api/customers/stats', authMiddleware, (req, res) => {
  res.json({ total: CUSTOMERS.length, verified: CUSTOMERS.filter(c => c.kycStatus === 'VERIFIED').length, pending: CUSTOMERS.filter(c => c.kycStatus === 'PENDING').length });
});

app.get('/api/customers/:id', authMiddleware, (req, res) => {
  const c = CUSTOMERS.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ message: 'Customer not found' });
  res.json(c);
});

app.post('/api/customers', authMiddleware, (req, res) => {
  const c = { id: `c${Date.now()}`, customerNumber: `CUS-${Date.now()}`, kycStatus: 'PENDING', riskLevel: 'MEDIUM', riskScore: 50, ...req.body, branch: { name: 'Head Office' }, createdAt: new Date().toISOString() };
  CUSTOMERS.push(c);
  res.status(201).json(c);
});

app.patch('/api/customers/:id', authMiddleware, (req, res) => {
  const idx = CUSTOMERS.findIndex(c => c.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  CUSTOMERS[idx] = { ...CUSTOMERS[idx], ...req.body };
  res.json(CUSTOMERS[idx]);
});

app.patch('/api/customers/:id/kyc', authMiddleware, (req, res) => {
  const c = CUSTOMERS.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  c.kycStatus = req.body.kycStatus;
  res.json(c);
});

app.patch('/api/customers/:id/risk-score', authMiddleware, (req, res) => {
  const c = CUSTOMERS.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  c.riskScore = req.body.score;
  res.json(c);
});

// ─── Loans Routes ─────────────────────────────────────────────────────────────
app.get('/api/loans', authMiddleware, (req, res) => {
  const { search = '', page = 1, limit = 20, status } = req.query;
  let data = [...LOANS];
  if (status) data = data.filter(l => l.status === status);
  if (search) data = data.filter(l => `${l.loanNumber} ${l.customer?.firstName} ${l.customer?.lastName}`.toLowerCase().includes(search.toLowerCase()));
  const total = data.length;
  data = data.slice((page - 1) * limit, page * limit);
  res.json({ data, total, page: +page, limit: +limit });
});

app.get('/api/loans/stats', authMiddleware, (req, res) => {
  res.json({ total: LOANS.length, active: LOANS.filter(l=>l.status==='ACTIVE').length, defaulted: LOANS.filter(l=>l.status==='DEFAULTED').length, totalPortfolio: LOANS.reduce((s,l)=>s+l.outstandingBalance,0) });
});

app.get('/api/loans/:id', authMiddleware, (req, res) => {
  const l = LOANS.find(l => l.id === req.params.id);
  if (!l) return res.status(404).json({ message: 'Loan not found' });
  res.json(l);
});

app.post('/api/loans', authMiddleware, (req, res) => {
  const loan = { id: `l${Date.now()}`, loanNumber: `LN-${Date.now()}`, status: 'SUBMITTED', totalPaid: 0, customer: CUSTOMERS[0], branch: { name: 'Head Office' }, ...req.body };
  LOANS.push(loan);
  res.status(201).json(loan);
});

app.patch('/api/loans/:id/approve', authMiddleware, (req, res) => {
  const l = LOANS.find(l => l.id === req.params.id);
  if (!l) return res.status(404).json({ message: 'Not found' });
  l.status = 'APPROVED'; l.approvedAt = new Date().toISOString();
  res.json(l);
});

app.patch('/api/loans/:id/disburse', authMiddleware, (req, res) => {
  const l = LOANS.find(l => l.id === req.params.id);
  if (!l) return res.status(404).json({ message: 'Not found' });
  l.status = 'ACTIVE'; l.disbursedAt = new Date().toISOString();
  res.json(l);
});

app.post('/api/loans/:id/repayment', authMiddleware, (req, res) => {
  const l = LOANS.find(l => l.id === req.params.id);
  if (!l) return res.status(404).json({ message: 'Not found' });
  const amt = +req.body.amount;
  l.outstandingBalance = Math.max(0, l.outstandingBalance - amt);
  l.totalPaid = (l.totalPaid || 0) + amt;
  if (l.outstandingBalance === 0) l.status = 'CLOSED';
  res.json({ loan: l, repayment: { amount: amt, createdAt: new Date().toISOString() } });
});

// ─── Leases Routes ────────────────────────────────────────────────────────────
app.get('/api/leases', authMiddleware, (req, res) => {
  const { status } = req.query;
  let data = status ? LEASES.filter(l => l.status === status) : [...LEASES];
  res.json({ data, total: data.length });
});
app.get('/api/leases/stats', authMiddleware, (req, res) => res.json({ total: LEASES.length, active: LEASES.filter(l=>l.status==='ACTIVE').length }));
app.get('/api/leases/:id', authMiddleware, (req, res) => res.json(LEASES.find(l=>l.id===req.params.id) || { message: 'Not found' }));
app.post('/api/leases', authMiddleware, (req, res) => { const l = { id: `le${Date.now()}`, leaseNumber: `LS-${Date.now()}`, status: 'DRAFT', ...req.body }; LEASES.push(l); res.status(201).json(l); });
app.patch('/api/leases/:id/activate', authMiddleware, (req, res) => { const l = LEASES.find(l=>l.id===req.params.id); if(l) l.status='ACTIVE'; res.json(l); });
app.post('/api/leases/:id/payment', authMiddleware, (req, res) => { const l = LEASES.find(l=>l.id===req.params.id); if(l) { l.outstandingBalance=Math.max(0,l.outstandingBalance-(+req.body.amount)); } res.json(l); });

// ─── Fixed Deposits Routes ────────────────────────────────────────────────────
app.get('/api/fixed-deposits', authMiddleware, (req, res) => {
  const { status } = req.query;
  let data = status ? FDS.filter(f => f.status === status) : [...FDS];
  res.json({ data, total: data.length });
});
app.get('/api/fixed-deposits/stats', authMiddleware, (req, res) => res.json({ total: FDS.length, active: FDS.filter(f=>f.status==='ACTIVE').length, totalValue: FDS.filter(f=>f.status==='ACTIVE').reduce((s,f)=>s+f.principalAmount,0) }));
app.get('/api/fixed-deposits/:id', authMiddleware, (req, res) => res.json(FDS.find(f=>f.id===req.params.id) || {}));
app.post('/api/fixed-deposits', authMiddleware, (req, res) => { const fd = { id: `fd${Date.now()}`, fdNumber:`FD-${Date.now()}`, status:'ACTIVE', interestAccrued:0, ...req.body }; FDS.push(fd); res.status(201).json(fd); });
app.patch('/api/fixed-deposits/:id/mature', authMiddleware, (req, res) => { const f=FDS.find(f=>f.id===req.params.id); if(f) f.status='MATURED'; res.json(f); });
app.patch('/api/fixed-deposits/:id/renew', authMiddleware, (req, res) => { const f=FDS.find(f=>f.id===req.params.id); if(f) f.status='RENEWED'; res.json(f); });
app.patch('/api/fixed-deposits/:id/withdraw', authMiddleware, (req, res) => { const f=FDS.find(f=>f.id===req.params.id); if(f) f.status='WITHDRAWN'; res.json(f); });

// ─── GL Routes ────────────────────────────────────────────────────────────────
app.get('/api/gl/accounts', authMiddleware, (req, res) => res.json({ data: GL_ACCOUNTS, total: GL_ACCOUNTS.length }));
app.get('/api/gl/accounts/tree', authMiddleware, (req, res) => res.json(GL_ACCOUNTS));
app.get('/api/gl/journal-entries', authMiddleware, (req, res) => res.json({ data: [], total: 0 }));
app.post('/api/gl/accounts', authMiddleware, (req, res) => { const a={id:`ac${Date.now()}`,...req.body}; GL_ACCOUNTS.push(a); res.status(201).json(a); });
app.post('/api/gl/journal-entries', authMiddleware, (req, res) => res.status(201).json({ id:`je${Date.now()}`, ...req.body, createdAt:new Date().toISOString() }));
app.get('/api/gl/trial-balance', authMiddleware, (req, res) => res.json(GL_ACCOUNTS));
app.get('/api/gl/profit-and-loss', authMiddleware, (req, res) => {
  const income = GL_ACCOUNTS.filter(a=>a.type==='INCOME');
  const expenses = GL_ACCOUNTS.filter(a=>a.type==='EXPENSE');
  const totalIncome = income.reduce((s,a)=>s+a.balance,0);
  const totalExpenses = expenses.reduce((s,a)=>s+a.balance,0);
  res.json({ income, expenses, totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses });
});
app.get('/api/gl/balance-sheet', authMiddleware, (req, res) => {
  const assets = GL_ACCOUNTS.filter(a=>a.type==='ASSET');
  const liabilities = GL_ACCOUNTS.filter(a=>a.type==='LIABILITY');
  const equity = GL_ACCOUNTS.filter(a=>a.type==='EQUITY');
  res.json({ assets, liabilities, equity, totalAssets: assets.reduce((s,a)=>s+a.balance,0), totalLiabilities: liabilities.reduce((s,a)=>s+a.balance,0), totalEquity: equity.reduce((s,a)=>s+a.balance,0) });
});

// ─── Recovery Routes ──────────────────────────────────────────────────────────
app.get('/api/recovery', authMiddleware, (req, res) => {
  const { status } = req.query;
  let data = status ? RECOVERY.filter(r => r.status === status) : [...RECOVERY];
  res.json({ data, total: data.length });
});
app.get('/api/recovery/stats', authMiddleware, (req, res) => res.json({ totalCases: RECOVERY.length, open: RECOVERY.filter(r=>r.status==='OPEN').length, escalated: RECOVERY.filter(r=>r.status==='ESCALATED').length }));
app.get('/api/recovery/:id', authMiddleware, (req, res) => res.json(RECOVERY.find(r=>r.id===req.params.id) || {}));
app.post('/api/recovery/:id/action', authMiddleware, (req, res) => { const r=RECOVERY.find(r=>r.id===req.params.id); if(r) r.actions.push({...req.body, createdAt:new Date().toISOString()}); res.json(r); });
app.patch('/api/recovery/:id/settle', authMiddleware, (req, res) => { const r=RECOVERY.find(r=>r.id===req.params.id); if(r){r.status='SETTLED';r.recoveredAmount=req.body.settlementAmount;} res.json(r); });
app.patch('/api/recovery/:id/write-off', authMiddleware, (req, res) => { const r=RECOVERY.find(r=>r.id===req.params.id); if(r) r.status='WRITTEN_OFF'; res.json(r); });

// ─── Notifications Routes ─────────────────────────────────────────────────────
app.get('/api/notifications', authMiddleware, (req, res) => {
  const { type, status } = req.query;
  let data = [...NOTIFICATIONS];
  if (type) data = data.filter(n => n.type === type);
  if (status) data = data.filter(n => n.status === status);
  res.json({ data, total: data.length });
});
app.get('/api/notifications/unread', authMiddleware, (req, res) => res.json(NOTIFICATIONS.filter(n=>n.status==='PENDING').slice(0,10)));
app.get('/api/notifications/stats', authMiddleware, (req, res) => res.json({ total: NOTIFICATIONS.length, sent: NOTIFICATIONS.filter(n=>n.status==='SENT').length, pending: NOTIFICATIONS.filter(n=>n.status==='PENDING').length, failed: 0 }));
app.post('/api/notifications', authMiddleware, (req, res) => { const n={id:`n${Date.now()}`, status:'SENT', createdAt:new Date().toISOString(),...req.body}; NOTIFICATIONS.push(n); res.status(201).json(n); });

// ─── Reporting Routes ─────────────────────────────────────────────────────────
app.get('/api/reporting/loan-portfolio', authMiddleware, (req, res) => {
  const byStatus = {};
  LOANS.forEach(l => { if (!byStatus[l.status]) byStatus[l.status] = { count: 0, amount: 0 }; byStatus[l.status].count++; byStatus[l.status].amount += l.outstandingBalance; });
  res.json({ summary: { total: LOANS.length, totalPrincipal: LOANS.reduce((s,l)=>s+l.principalAmount,0), totalOutstanding: LOANS.reduce((s,l)=>s+l.outstandingBalance,0), totalCollected: LOANS.reduce((s,l)=>s+(l.totalPaid||0),0), byStatus }, data: LOANS });
});
app.get('/api/reporting/overdue-aging', authMiddleware, (req, res) => res.json([
  { label: '1-30 days', count: 12, overdueDays: 15, amount: 280000 },
  { label: '31-60 days', count: 6, overdueDays: 45, amount: 145000 },
  { label: '61-90 days', count: 3, overdueDays: 75, amount: 89000 },
  { label: '91-120 days', count: 2, overdueDays: 105, amount: 65000 },
  { label: '120+ days', count: 8, overdueDays: 285, amount: 285000 },
]));
app.get('/api/reporting/branch-performance', authMiddleware, (req, res) => res.json([
  { name: 'Head Office', code: 'HO', activeLoans: 180, totalDisbursed: 6500000, totalCollected: 1200000, outstanding: 5300000, collectionRate: 18.5, fdPortfolio: 4200000, totalCustomers: 3, kycVerified: 2 },
  { name: 'North Branch', code: 'NORTH', activeLoans: 95, totalDisbursed: 3800000, totalCollected: 580000, outstanding: 3220000, collectionRate: 15.3, fdPortfolio: 2900000, totalCustomers: 1, kycVerified: 0 },
  { name: 'South Branch', code: 'SOUTH', activeLoans: 67, totalDisbursed: 2200000, totalCollected: 420000, outstanding: 1780000, collectionRate: 19.1, fdPortfolio: 1800000, totalCustomers: 2, kycVerified: 2 },
]));
app.get('/api/reporting/recovery', authMiddleware, (req, res) => res.json({ summary: { totalCases: RECOVERY.length, totalOverdueAmount: 208545, totalRecovered: 15000, recoveryRate: 7.19 }, data: RECOVERY }));

// ─── Users Routes ─────────────────────────────────────────────────────────────
app.get('/api/users', authMiddleware, (req, res) => {
  const data = USERS.map(({password:_, ...u}) => u);
  res.json({ data, total: data.length });
});
app.post('/api/users', authMiddleware, (req, res) => {
  const u = { id: `u${Date.now()}`, ...req.body, branch: { name: 'Head Office' } };
  USERS.push(u);
  const { password: _, ...safe } = u;
  res.status(201).json(safe);
});
app.patch('/api/users/:id', authMiddleware, (req, res) => {
  const idx = USERS.findIndex(u => u.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  USERS[idx] = { ...USERS[idx], ...req.body };
  const { password: _, ...safe } = USERS[idx];
  res.json(safe);
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0', time: new Date() }));
app.get('/', (req, res) => res.json({ message: 'Co-Banking Mock API', docs: '/api/health' }));

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🏦 Co-Banking Mock API running at http://localhost:${PORT}`);
  console.log(`📖 Health: http://localhost:${PORT}/api/health\n`);
  console.log('Demo accounts:');
  console.log('  admin@cobanking.com    / Admin@123');
  console.log('  manager@cobanking.com  / Manager@123');
  console.log('  loanoffice@cobanking.com / Loan@123\n');
});
