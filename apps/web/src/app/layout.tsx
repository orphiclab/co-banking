import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Co-Banking – Integrated Core Banking System',
  description: 'Enterprise Core Banking System for Loans, Leases, Fixed Deposits, General Ledger, and Recovery Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
