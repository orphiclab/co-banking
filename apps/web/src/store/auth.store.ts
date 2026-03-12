'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@/lib/api';

type Role = 'ADMIN' | 'BRANCH_MANAGER' | 'LOAN_OFFICER' | 'TELLER' | 'RECOVERY_OFFICER';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  branch?: { id: string; name: string; code: string } | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setHasHydrated: (val: boolean) => void;
  hasRole: (...roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(email, password);
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', data.accessToken);
          }
          set({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        // Try to call backend logout (fire and forget)
        try { authApi.logout().catch(() => {}); } catch {}
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('co-banking-auth');
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      hasRole: (...roles: Role[]) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },
    }),
    {
      name: 'co-banking-auth',
      storage: createJSONStorage(() => localStorage),
      // ONLY persist user data (not isAuthenticated — that's derived from token)
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Derive isAuthenticated from whether we have a valid token in memory.
          // Also cross-check localStorage to guard against stale persist state.
          const rawToken = typeof window !== 'undefined'
            ? localStorage.getItem('access_token')
            : null;
          const hasToken = !!(state.accessToken && rawToken);
          state.isAuthenticated = hasToken;
          if (!hasToken) {
            // Wipe stale data so AppShell doesn't attempt API calls
            state.user = null;
            state.accessToken = null;
          }
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
