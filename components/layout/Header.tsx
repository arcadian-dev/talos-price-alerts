import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-bronze)] to-[var(--accent-malachite)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">
              Talos Price Alerts
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/products" 
              className="text-[var(--text-secondary)] hover:text-[var(--accent-bronze)] transition-colors"
            >
              Products
            </Link>
            <Link 
              href="/categories" 
              className="text-[var(--text-secondary)] hover:text-[var(--accent-bronze)] transition-colors"
            >
              Categories
            </Link>
            <Link 
              href="/about" 
              className="text-[var(--text-secondary)] hover:text-[var(--accent-bronze)] transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
