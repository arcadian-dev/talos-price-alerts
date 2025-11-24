'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { objectIdToString } from '@/utils/admin';
import { IProduct, IVendorProduct } from '@/models';

interface ScrapingResult {
  success: boolean;
  vendorProductId: string;
  data?: any;
  error?: string;
}

interface ScrapingReport {
  totalVendors: number;
  successfulScrapes: number;
  failedScrapes: number;
  results: ScrapingResult[];
  savedPrices?: number;
  duration?: number;
}

interface ConfigStatus {
  grokApi: {
    configured: boolean;
    keyLength: number;
    model: string;
  };
  mongodb: {
    configured: boolean;
  };
  nextAuth: {
    configured: boolean;
  };
  adminPassword: {
    configured: boolean;
  };
}

export default function ScraperPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [vendors, setVendors] = useState<IVendorProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [lastReport, setLastReport] = useState<ScrapingReport | null>(null);
  const [testingVendor, setTestingVendor] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchVendors();
    fetchConfigStatus();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchVendors();
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products?limit=100');
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedProduct) params.append('productId', selectedProduct);
      
      const response = await fetch(`/api/admin/vendors?${params}&limit=100`);
      const data = await response.json();
      if (response.ok) {
        setVendors(data.vendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchConfigStatus = async () => {
    try {
      const response = await fetch('/api/admin/config/status');
      const data = await response.json();
      if (response.ok) {
        setConfigStatus(data);
      }
    } catch (error) {
      console.error('Error fetching config status:', error);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const runScraper = async () => {
    setIsRunning(true);
    setLastReport(null);
    addLog('Starting scraper run...');

    try {
      const response = await fetch('/api/admin/scraper/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct || undefined,
          limit: 20, // Limit concurrent scrapes
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setLastReport(result.report);
        addLog(`Scraper completed: ${result.message}`);
        fetchVendors(); // Refresh vendor data
      } else {
        addLog(`Scraper failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error running scraper:', error);
      addLog(`Scraper error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testVendor = async (vendorId: string) => {
    setTestingVendor(vendorId);
    addLog(`Testing vendor ${vendorId}...`);

    try {
      const response = await fetch('/api/admin/scraper/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendorId }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success) {
          addLog(`Test successful: Found ${result.data.amount}${result.data.unit} for $${result.data.price} ($${result.data.pricePerUnit.toFixed(4)}/${result.data.unit})`);
        } else {
          addLog(`Test failed: ${result.error}`);
        }
        fetchVendors(); // Refresh vendor data
      } else {
        addLog(`Test error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing vendor:', error);
      addLog(`Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestingVendor(null);
    }
  };

  const getVendorStatusColor = (vendor: IVendorProduct) => {
    if (!vendor.isActive) return 'text-gray-500';
    if (vendor.scrapeFailureCount > 5) return 'text-red-400';
    if (vendor.scrapeFailureCount > 0) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Scraper Dashboard</h1>
            <p className="text-[var(--text-secondary)] mt-2">
              Monitor and control price scraping operations
            </p>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="malachite"
              onClick={runScraper}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Scraper'}
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Scraper Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Filter by Product
                </label>
                <select
                  className="input-dark w-full"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <option value="">All Products</option>
                  {products.map((product) => (
                    <option key={objectIdToString(product._id)} value={objectIdToString(product._id)}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="bronze"
                  onClick={() => fetchVendors()}
                  className="w-full"
                >
                  Refresh Vendors
                </Button>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setLogs([])}
                  className="w-full"
                >
                  Clear Logs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Report */}
        {lastReport && (
          <Card>
            <CardHeader>
              <CardTitle>Last Scraping Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {lastReport.totalVendors}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Total Vendors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {lastReport.successfulScrapes}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Successful</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">
                    {lastReport.failedScrapes}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--accent-bronze)]">
                    {lastReport.savedPrices || 0}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Prices Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {lastReport.duration ? formatDuration(lastReport.duration) : 'N/A'}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendors List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Active Vendors ({vendors.filter(v => v.isActive).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {vendors.filter(v => v.isActive).map((vendor) => (
                  <div
                    key={objectIdToString(vendor._id)}
                    className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${getVendorStatusColor(vendor)}`} />
                        <span className="font-medium text-[var(--text-primary)] truncate">
                          {vendor.vendorName}
                        </span>
                      </div>
                      <div className="text-sm text-[var(--text-secondary)] truncate">
                        {(vendor.productId as any)?.name || 'Unknown Product'}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        Failures: {vendor.scrapeFailureCount} | 
                        Last: {vendor.lastScrapedAt 
                          ? new Date(vendor.lastScrapedAt).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testVendor(objectIdToString(vendor._id))}
                      disabled={testingVendor === objectIdToString(vendor._id)}
                    >
                      {testingVendor === objectIdToString(vendor._id) ? '...' : 'Test'}
                    </Button>
                  </div>
                ))}
                
                {vendors.filter(v => v.isActive).length === 0 && (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    No active vendors found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {log}
                  </div>
                ))}
                
                {logs.length === 0 && (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    No activity logs yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  configStatus?.grokApi.configured ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-[var(--text-primary)]">
                  Grok API: {configStatus?.grokApi.configured ? 'Configured' : 'Not Configured'}
                  {configStatus?.grokApi.configured && (
                    <div className="text-xs text-[var(--text-muted)]">
                      Model: {configStatus.grokApi.model}
                    </div>
                  )}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  configStatus?.mongodb.configured ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-[var(--text-primary)]">
                  MongoDB: {configStatus?.mongodb.configured ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-[var(--text-primary)]">
                  Puppeteer: Ready
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  vendors.filter(v => v.isActive).length > 0 ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="text-[var(--text-primary)]">
                  Active Vendors: {vendors.filter(v => v.isActive).length}
                </span>
              </div>
            </div>
            
            {!configStatus && (
              <div className="text-center py-4 text-[var(--text-muted)]">
                Loading configuration status...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
