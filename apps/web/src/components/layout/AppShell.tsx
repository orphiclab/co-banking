'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from './Sidebar';
import { notificationsApi } from '@/lib/api';

const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard', customers: 'Customers', loans: 'Loans',
  leases: 'Leases', 'fixed-deposits': 'Fixed Deposits',
  gl: 'General Ledger', recovery: 'Recovery',
  notifications: 'Notifications', reporting: 'Reports', settings: 'Settings',
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const didRedirect = useRef(false);

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumb = segments.map(s => breadcrumbMap[s] || s).join(' / ');

  // Wait for Zustand to rehydrate from localStorage before deciding to redirect
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated && !didRedirect.current) {
      didRedirect.current = true;
      router.replace('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) return;
    notificationsApi.getUnread()
      .then(r => setUnreadCount(Array.isArray(r.data) ? r.data.length : 0))
      .catch(() => {});
  }, [isAuthenticated]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  // Show spinner while Zustand hydrates from localStorage (prevents flash to /login)
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:pl-[260px] min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20 flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{breadcrumb || 'Dashboard'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
              title="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => router.push('/notifications')}
              className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-6 min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
