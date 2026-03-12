import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 (skip redirect for auth endpoints + /login page to avoid loops)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    const onLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
    if (error.response?.status === 401 && !isAuthEndpoint && !onLoginPage && typeof window !== 'undefined') {
      // Clear both the raw token AND Zustand's persist store so stale isAuthenticated is gone
      localStorage.removeItem('access_token');
      localStorage.removeItem('co-banking-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ====== Auth ======
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// ====== Dashboard ======
export const dashboardApi = {
  getKpis: () => api.get('/dashboard/kpis'),
  getMonthlyCollections: () => api.get('/dashboard/monthly-collections'),
  getLoanPortfolio: () => api.get('/dashboard/loan-portfolio'),
  getBranchPerformance: () => api.get('/dashboard/branch-performance'),
  getOverdueAging: () => api.get('/dashboard/overdue-aging'),
  getRecoveryPerformance: () => api.get('/dashboard/recovery-performance'),
};

// ====== Customers ======
export const customersApi = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getOne: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.patch(`/customers/${id}`, data),
  updateKyc: (id: string, kycStatus: string) => api.patch(`/customers/${id}/kyc`, { kycStatus }),
  updateRiskScore: (id: string, score: number) => api.patch(`/customers/${id}/risk-score`, { score }),
  getStats: () => api.get('/customers/stats'),
};

// ====== Loans ======
export const loansApi = {
  getAll: (params?: any) => api.get('/loans', { params }),
  getOne: (id: string) => api.get(`/loans/${id}`),
  create: (data: any) => api.post('/loans', data),
  approve: (id: string) => api.patch(`/loans/${id}/approve`),
  disburse: (id: string) => api.patch(`/loans/${id}/disburse`),
  repayment: (id: string, amount: number, paymentMethod?: string) =>
    api.post(`/loans/${id}/repayment`, { amount, paymentMethod }),
  getStats: () => api.get('/loans/stats'),
};

// ====== Leases ======
export const leasesApi = {
  getAll: (params?: any) => api.get('/leases', { params }),
  getOne: (id: string) => api.get(`/leases/${id}`),
  create: (data: any) => api.post('/leases', data),
  activate: (id: string) => api.patch(`/leases/${id}/activate`),
  payment: (id: string, amount: number) => api.post(`/leases/${id}/payment`, { amount }),
  getStats: () => api.get('/leases/stats'),
};

// ====== Fixed Deposits ======
export const fdApi = {
  getAll: (params?: any) => api.get('/fixed-deposits', { params }),
  getOne: (id: string) => api.get(`/fixed-deposits/${id}`),
  create: (data: any) => api.post('/fixed-deposits', data),
  mature: (id: string) => api.patch(`/fixed-deposits/${id}/mature`),
  renew: (id: string) => api.patch(`/fixed-deposits/${id}/renew`),
  withdraw: (id: string) => api.patch(`/fixed-deposits/${id}/withdraw`),
  getStats: () => api.get('/fixed-deposits/stats'),
};

// ====== General Ledger ======
export const glApi = {
  getAccounts: (params?: any) => api.get('/gl/accounts', { params }),
  getAccountsTree: () => api.get('/gl/accounts/tree'),
  createAccount: (data: any) => api.post('/gl/accounts', data),
  getJournalEntries: (params?: any) => api.get('/gl/journal-entries', { params }),
  createJournalEntry: (data: any) => api.post('/gl/journal-entries', data),
  getTrialBalance: () => api.get('/gl/trial-balance'),
  getProfitAndLoss: (params?: any) => api.get('/gl/profit-and-loss', { params }),
  getBalanceSheet: () => api.get('/gl/balance-sheet'),
};

// ====== Recovery ======
export const recoveryApi = {
  getAll: (params?: any) => api.get('/recovery', { params }),
  getOne: (id: string) => api.get(`/recovery/${id}`),
  addAction: (id: string, data: any) => api.post(`/recovery/${id}/action`, data),
  settle: (id: string, settlementAmount: number) => api.patch(`/recovery/${id}/settle`, { settlementAmount }),
  writeOff: (id: string) => api.patch(`/recovery/${id}/write-off`),
  getStats: () => api.get('/recovery/stats'),
};

// ====== Notifications ======
export const notificationsApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getUnread: () => api.get('/notifications/unread'),
  send: (data: any) => api.post('/notifications', data),
  getStats: () => api.get('/notifications/stats'),
};

// ====== Reporting ======
export const reportingApi = {
  getLoanPortfolio: (params?: any) => api.get('/reporting/loan-portfolio', { params }),
  getOverdueAging: () => api.get('/reporting/overdue-aging'),
  getBranchPerformance: () => api.get('/reporting/branch-performance'),
  getRecovery: () => api.get('/reporting/recovery'),
};

// ====== Users ======
export const usersApi = {
  getAll: (params?: any) => api.get('/users', { params }),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
};
