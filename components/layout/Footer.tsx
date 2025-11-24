import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-bronze)] to-[var(--accent-malachite)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">
                Talos Price Alerts
              </span>
            </div>
            <p className="text-[var(--text-secondary)] max-w-md">
              Track peptide and longevity product prices across multiple vendors. 
              Get alerts when prices drop and make informed purchasing decisions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-[var(--text-secondary)] hover:text-[var(--accent-bronze)] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-[var(--text-secondary)] hover:text-[var(--accent-bronze)] transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[var(--text-secondary)] hover:text-[var(--accent-bronze)] transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-[var(--text-secondary)] hover:text-[var(--accent-bronze)] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--accent-bronze)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[var(--text-secondary)] hover:text-[var(--accent-bronze)] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="art-deco-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[var(--text-muted)] text-sm">
              © 2024 Talos Price Alerts. All rights reserved.
            </p>
            <p className="text-[var(--text-muted)] text-sm mt-2 md:mt-0">
              Built with Next.js and MongoDB
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
