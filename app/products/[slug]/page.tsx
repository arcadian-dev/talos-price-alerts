'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PriceChart from '@/components/charts/PriceChart';
import VendorRanking from '@/components/product/VendorRanking';
import SubscriptionForm from '@/components/forms/SubscriptionForm';

interface ProductData {
  product: {
    id: string;
    name: string;
    slug: string;
    category: string;
    description?: string;
    unit: string;
    createdAt: string;
    updatedAt: string;
  };
  vendors: any[];
  stats: {
    bestPrice: number;
    worstPrice: number;
    avgPrice: number;
    vendorCount: number;
    availableVendors: number;
    lastUpdated: number;
  } | null;
}

interface PriceHistoryData {
  data: Array<{
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
  }>;
  stats: any;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProductData();
      fetchPriceHistory();
    }
  }, [slug, timeframe]);

  const fetchProductData = async () => {
    try {
      console.log(`Fetching product data for slug: ${slug}`);
      const response = await fetch(`/api/products/${slug}`);
      const data = await response.json();
      
      console.log('Product API response:', { status: response.status, data });
      
      if (response.ok) {
        setProductData(data);
      } else {
        console.error('Failed to fetch product:', data.error);
        // Set empty product data to show "not found" state
        setProductData(null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProductData(null);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      console.log(`Fetching price history for slug: ${slug}, timeframe: ${timeframe}`);
      const response = await fetch(`/api/products/${slug}/price-history?timeframe=${timeframe}`);
      const data = await response.json();
      
      console.log('Price history API response:', { status: response.status, data });
      
      if (response.ok) {
        setPriceHistory(data);
      } else {
        console.error('Failed to fetch price history:', data.error);
        // Set empty price history - this is OK, product might exist without price data
        setPriceHistory({ data: [], stats: null });
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
      setPriceHistory({ data: [], stats: null });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(4)}`;
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-[var(--text-secondary)]">Loading product details...</div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!productData) {
    return (
      <>
        <Header />
        <main className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  Product Not Found
                </h1>
                <p className="text-[var(--text-secondary)] mb-6">
                  The product you're looking for doesn't exist or has been removed.
                </p>
                <Button variant="bronze" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Product Header */}
          <div className="art-deco-border pb-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-4xl font-bold text-[var(--text-primary)]">
                    {productData.product.name}
                  </h1>
                  <span className="bg-[var(--bg-tertiary)] px-3 py-1 rounded text-sm">
                    {productData.product.category}
                  </span>
                </div>
                {productData.product.description && (
                  <p className="text-lg text-[var(--text-secondary)] max-w-3xl">
                    {productData.product.description}
                  </p>
                )}
              </div>
              
              <div className="mt-4 md:mt-0">
                <Button 
                  variant="malachite" 
                  onClick={() => setShowSubscriptionForm(true)}
                >
                  🔔 Get Price Alerts
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          {productData.stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--accent-malachite)]">
                    {formatPrice(productData.stats.bestPrice)}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Best Price/{productData.product.unit}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {formatPrice(productData.stats.avgPrice)}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Avg Price/{productData.product.unit}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {productData.stats.availableVendors}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Available Vendors</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {Math.round(((productData.stats.worstPrice - productData.stats.bestPrice) / productData.stats.bestPrice) * 100)}%
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Price Spread</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    {getTimeAgo(productData.stats.lastUpdated)}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Last Updated</div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Price Chart */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Price History</CardTitle>
                    <div className="flex space-x-2">
                      {(['7d', '30d', '90d', '1y'] as const).map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setTimeframe(tf)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            timeframe === tf
                              ? 'bg-[var(--accent-bronze)] text-white'
                              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {priceHistory && priceHistory.data.length > 0 ? (
                    <PriceChart
                      productId={productData.product.id}
                      data={priceHistory.data}
                      timeframe={timeframe}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                          No Price History
                        </h3>
                        <p className="text-[var(--text-secondary)]">
                          Price history will appear here once we collect more data.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Category:</span>
                      <span className="text-[var(--text-primary)]">{productData.product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Unit:</span>
                      <span className="text-[var(--text-primary)]">{productData.product.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Vendors:</span>
                      <span className="text-[var(--text-primary)]">{productData.vendors.length}</span>
                    </div>
                    {productData.stats && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Price Range:</span>
                          <span className="text-[var(--text-primary)]">
                            {formatPrice(productData.stats.bestPrice)} - {formatPrice(productData.stats.worstPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Savings:</span>
                          <span className="text-green-400">
                            {formatPrice(productData.stats.worstPrice - productData.stats.bestPrice)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Vendor Rankings */}
          <div className="mt-8">
            <VendorRanking 
              vendors={productData.vendors}
              productUnit={productData.product.unit}
            />
          </div>
        </div>
      </main>

      {/* Subscription Form Modal */}
      <SubscriptionForm
        productId={productData.product.id}
        productName={productData.product.name}
        productUnit={productData.product.unit}
        isOpen={showSubscriptionForm}
        onClose={() => setShowSubscriptionForm(false)}
      />

      <Footer />
    </>
  );
}
