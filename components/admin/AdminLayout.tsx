'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Products', href: '/admin/products', icon: '📦' },
    { name: 'Vendors', href: '/admin/vendors', icon: '🏪' },
    { name: 'Scraper', href: '/admin/scraper', icon: '🤖' },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: '📧' },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)]">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-[var(--border-primary)]">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-bronze)] to-[var(--accent-malachite)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="ml-3 text-lg font-bold text-[var(--text-primary)]">
              Admin Panel
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--accent-bronze)] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-[var(--border-primary)]">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {navigation.find(item => item.href === pathname)?.name || 'Admin Panel'}
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-[var(--text-secondary)] hover:text-[var(--accent-bronze)] transition-colors"
              >
                View Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
