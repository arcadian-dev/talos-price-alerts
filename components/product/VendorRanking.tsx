'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface VendorData {
  vendorId: string;
  vendorName: string;
  url: string;
  price: number | null;
  amount: number | null;
  unit: string;
  pricePerUnit: number | null;
  confidence: number | null;
  lastUpdated: string | null;
  isAvailable: boolean | null;
  trend: 'up' | 'down' | 'stable';
  dataPoints: number;
  lastSuccessfulScrape: string | null;
  failureCount: number;
}

interface VendorRankingProps {
  vendors: VendorData[];
  productUnit: string;
  className?: string;
}

const VendorRanking: React.FC<VendorRankingProps> = ({ 
  vendors, 
  productUnit, 
  className = '' 
}) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatPricePerUnit = (price: number, unit: string) => `$${price.toFixed(4)}/${unit}`;

  const getTimeAgo = (dateString: string) => {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 7) return `${Math.floor(days / 7)}w ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-400';
      case 'down': return 'text-green-400';
      default: return 'text-[var(--text-secondary)]';
    }
  };

  const getAvailabilityStatus = (vendor: VendorData) => {
    if (vendor.isAvailable === false) return { text: 'Out of Stock', color: 'text-red-400' };
    if (vendor.pricePerUnit === null) return { text: 'No Data', color: 'text-[var(--text-muted)]' };
    if (vendor.failureCount > 5) return { text: 'Check Failed', color: 'text-yellow-400' };
    return { text: 'In Stock', color: 'text-green-400' };
  };

  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return 'text-[var(--text-muted)]';
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Vendor Price Comparison</span>
          <span className="text-sm font-normal text-[var(--text-secondary)]">
            {vendors.filter(v => v.pricePerUnit !== null).length} of {vendors.length} vendors with data
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {vendors.map((vendor, index) => {
            const availability = getAvailabilityStatus(vendor);
            const isTopChoice = index === 0 && vendor.pricePerUnit !== null;
            
            return (
              <div
                key={vendor.vendorId}
                className={`p-4 rounded-lg border transition-all ${
                  isTopChoice 
                    ? 'border-[var(--accent-malachite)] bg-gradient-to-r from-green-900/20 to-transparent' 
                    : 'border-[var(--border-primary)] bg-[var(--bg-tertiary)]'
                } ${vendor.pricePerUnit === null ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {vendor.vendorName}
                      </h3>
                      {isTopChoice && (
                        <span className="text-xs bg-[var(--accent-malachite)] text-white px-2 py-1 rounded">
                          Best Price
                        </span>
                      )}
                      <span className={`text-xs ${availability.color}`}>
                        {availability.text}
                      </span>
                    </div>
                    
                    {vendor.pricePerUnit !== null ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-[var(--text-secondary)]">Total Price</div>
                          <div className="font-bold text-[var(--text-primary)]">
                            {formatPrice(vendor.price!)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[var(--text-secondary)]">Amount</div>
                          <div className="font-bold text-[var(--text-primary)]">
                            {vendor.amount}{vendor.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-[var(--text-secondary)]">Price per {productUnit}</div>
                          <div className="font-bold text-[var(--accent-bronze)]">
                            {formatPricePerUnit(vendor.pricePerUnit, productUnit)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[var(--text-secondary)]">Trend</div>
                          <div className={`font-bold ${getTrendColor(vendor.trend)}`}>
                            {getTrendIcon(vendor.trend)} {vendor.trend}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[var(--text-muted)]">
                        No pricing data available
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 text-right">
                    <a
                      href={vendor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Button variant="outline" size="sm">
                        Visit Store
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-primary)]">
                  <div className="flex items-center space-x-4">
                    {vendor.lastUpdated && (
                      <span>Updated {getTimeAgo(vendor.lastUpdated)}</span>
                    )}
                    {vendor.confidence !== null && (
                      <span className={getConfidenceColor(vendor.confidence)}>
                        {Math.round(vendor.confidence * 100)}% confidence
                      </span>
                    )}
                    <span>{vendor.dataPoints} data points</span>
                  </div>
                  
                  {vendor.failureCount > 0 && (
                    <span className="text-yellow-400">
                      {vendor.failureCount} recent failures
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {vendors.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No Vendors Available
            </h3>
            <p className="text-[var(--text-secondary)]">
              We're not currently tracking any vendors for this product.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorRanking;
