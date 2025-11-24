'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="art-deco-border pb-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Welcome to Talos Admin Panel
          </h2>
          <p className="text-[var(--text-secondary)]">
            Manage products, vendors, and price scraping operations from this dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[var(--accent-bronze)] rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">📦</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    0
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[var(--accent-malachite)] rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🏪</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Active Vendors
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    0
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[var(--accent-bronze)] rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">📧</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Subscriptions
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    0
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[var(--accent-malachite)] rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🤖</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Last Scrape
                  </p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    Never
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg">
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Add New Product</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Create a new product to track</p>
                  </div>
                  <span className="text-2xl">➕</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg">
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Run Scraper</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Manually trigger price scraping</p>
                  </div>
                  <span className="text-2xl">🔄</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-[var(--text-muted)]">No recent activity</p>
                <p className="text-sm text-[var(--text-muted)] mt-2">
                  Activity will appear here once you start adding products and vendors
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
