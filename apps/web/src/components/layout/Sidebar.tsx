'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import {
  LayoutDashboard, Users, CreditCard, Briefcase, PiggyBank,
  BookOpen, AlertTriangle, Bell, BarChart3, Settings,
  Building2, ChevronRight, LogOut, X
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [] },
  { href: '/customers', label: 'Customers', icon: Users, roles: [] },
  { href: '/loans', label: 'Loans', icon: CreditCard, roles: [] },
  { href: '/leases', label: 'Leases', icon: Briefcase, roles: [] },
  { href: '/fixed-deposits', label: 'Fixed Deposits', icon: PiggyBank, roles: [] },
  { href: '/gl', label: 'General Ledger', icon: BookOpen, roles: ['ADMIN', 'BRANCH_MANAGER'] },
  { href: '/recovery', label: 'Recovery', icon: AlertTriangle, roles: ['ADMIN', 'BRANCH_MANAGER', 'RECOVERY_OFFICER'] },
  { href: '/notifications', label: 'Notifications', icon: Bell, roles: [] },
  { href: '/reporting', label: 'Reports', icon: BarChart3, roles: [] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuthStore();

  const visibleItems = navItems.filter(item =>
    item.roles.length === 0 || hasRole(...(item.roles as any))
  );

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    BRANCH_MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    LOAN_OFFICER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    TELLER: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    RECOVERY_OFFICER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-glow">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground leading-none">Co-Banking</div>
            <div className="text-xs text-muted-foreground">Core Banking System</div>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-accent">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className={`text-xs px-1.5 py-0.5 rounded-md inline-block ${roleColors[user?.role || ''] || ''}`}>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground
                     hover:text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-[260px] bg-card border-r border-border z-50 lg:hidden shadow-2xl"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] h-screen bg-card border-r border-border fixed left-0 top-0 z-30">
        {sidebarContent}
      </aside>
    </>
  );
}
