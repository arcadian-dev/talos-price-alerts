import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <>
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="art-deco-border pb-8 mb-12">
              <h1 className="text-5xl lg:text-6xl font-bold text-[var(--text-primary)] mb-6">
                Track Peptide & Longevity Product Prices
              </h1>
              <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
                Monitor prices across multiple vendors, get instant alerts when prices drop, 
                and make informed purchasing decisions with comprehensive price analytics.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button variant="bronze" size="lg">
                  Browse Products
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="lg">
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 geometric-bg">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
                Why Choose Talos?
              </h2>
              <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                Advanced price tracking technology meets elegant design for the longevity community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-bronze)] to-[var(--accent-malachite)] rounded-lg flex items-center justify-center mx-auto mb-6">
                    <span className="text-white text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                    Price Analytics
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    Interactive candlestick charts show price trends and help you identify the best buying opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-bronze)] to-[var(--accent-malachite)] rounded-lg flex items-center justify-center mx-auto mb-6">
                    <span className="text-white text-2xl">🔔</span>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                    Smart Alerts
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    Get notified instantly when prices drop below your threshold or when new vendors are added.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-bronze)] to-[var(--accent-malachite)] rounded-lg flex items-center justify-center mx-auto mb-6">
                    <span className="text-white text-2xl">🏪</span>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                    Multi-Vendor Tracking
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    Compare prices across multiple vendors with cost-per-unit calculations for informed decisions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-12">
              <CardHeader>
                <CardTitle className="text-3xl mb-4">
                  Ready to Start Tracking?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-[var(--text-secondary)] mb-8">
                  Join the community of informed buyers who never overpay for peptides and longevity products.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/products">
                    <Button variant="bronze" size="lg">
                      Explore Products
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="malachite" size="lg">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
