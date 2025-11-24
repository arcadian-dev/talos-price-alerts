'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ProductPricing {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  minPricePerUnit: number;
  maxPricePerUnit: number;
  avgPricePerUnit: number;
  lastUpdated: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  unit: string;
  pricing: ProductPricing | null;
  vendorCount: number;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  categories: string[];
  filters: {
    search: string;
    category: string;
    sortBy: string;
  };
}

export default function ProductsPage() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, sortBy, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
        sortBy,
      });

      const response = await fetch(`/api/products?${params}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        console.error('Failed to fetch products:', result.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatPricePerUnit = (price: number, unit: string) => `$${price.toFixed(4)}/${unit}`;

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <>
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="art-deco-border pb-8 mb-8">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              Product Catalog
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-3xl">
              Browse our comprehensive catalog of peptides and longevity products. 
              Compare prices across vendors and track price history.
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                
                <select
                  className="input-dark"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {data?.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  className="input-dark"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="updated">Sort by Updated</option>
                </select>

                <Button type="submit" variant="bronze">
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-[var(--text-secondary)]">Loading products...</div>
            </div>
          )}

          {/* Products Grid */}
          {!loading && data && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {data.products.map((product) => (
                  <Card key={product._id} className="group">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <Link 
                          href={`/products/${product.slug}`}
                          className="text-[var(--text-primary)] hover:text-[var(--accent-bronze)] transition-colors"
                        >
                          {product.name}
                        </Link>
                        <span className="text-xs bg-[var(--bg-tertiary)] px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      {product.pricing ? (
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-[var(--text-secondary)]">Price Range</span>
                              <span className="text-xs text-[var(--text-muted)]">
                                {product.vendorCount} vendor{product.vendorCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="price-display">
                              {formatPrice(product.pricing.minPrice)} - {formatPrice(product.pricing.maxPrice)}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-[var(--text-secondary)] mb-1">Best Price per {product.unit}</div>
                            <div className="text-lg font-bold text-[var(--accent-malachite)]">
                              {formatPricePerUnit(product.pricing.minPricePerUnit, product.unit)}
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
                            <span>Updated {getTimeAgo(product.pricing.lastUpdated)}</span>
                            <Link 
                              href={`/products/${product.slug}`}
                              className="text-[var(--accent-bronze)] hover:text-[var(--bronze-600)] transition-colors"
                            >
                              View Details →
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="text-[var(--text-muted)] mb-2">No pricing data available</div>
                          <Link 
                            href={`/products/${product.slug}`}
                            className="text-[var(--accent-bronze)] hover:text-[var(--bronze-600)] transition-colors text-sm"
                          >
                            View Product →
                          </Link>
                        </div>
                      )}

                      {product.description && (
                        <p className="text-sm text-[var(--text-secondary)] mt-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {data.pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-[var(--text-secondary)]">
                    Page {data.pagination.page} of {data.pagination.pages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* No Results */}
              {data.products.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                      No Products Found
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-6">
                      Try adjusting your search criteria or browse all categories.
                    </p>
                    <Button 
                      variant="bronze" 
                      onClick={() => {
                        setSearch('');
                        setSelectedCategory('');
                        setPage(1);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
