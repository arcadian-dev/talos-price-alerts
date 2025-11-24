'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { IVendorProduct, IProduct } from '@/models';

interface VendorFormData {
  productId: string;
  vendorName: string;
  url: string;
  scrapingSelector: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<IVendorProduct[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<IVendorProduct | null>(null);
  const [formData, setFormData] = useState<VendorFormData>({
    productId: '',
    vendorName: '',
    url: '',
    scrapingSelector: '',
  });
  const [selectedProduct, setSelectedProduct] = useState('');

  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, [selectedProduct]);

  const fetchVendors = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedProduct) params.append('productId', selectedProduct);
      
      const response = await fetch(`/api/admin/vendors?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setVendors(data.vendors);
      } else {
        console.error('Failed to fetch vendors:', data.error);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingVendor 
        ? `/api/admin/vendors/${editingVendor._id}`
        : '/api/admin/vendors';
      
      const method = editingVendor ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingVendor(null);
        setFormData({ productId: '', vendorName: '', url: '', scrapingSelector: '' });
        fetchVendors();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save vendor');
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert('Failed to save vendor');
    }
  };

  const handleEdit = (vendor: IVendorProduct) => {
    setEditingVendor(vendor);
    setFormData({
      productId: vendor.productId._id?.toString() || vendor.productId.toString(),
      vendorName: vendor.vendorName,
      url: vendor.url,
      scrapingSelector: vendor.scrapingSelector || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchVendors();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete vendor');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  const toggleVendorStatus = async (vendor: IVendorProduct) => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendor._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !vendor.isActive }),
      });

      if (response.ok) {
        fetchVendors();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update vendor status');
      }
    } catch (error) {
      console.error('Error updating vendor status:', error);
      alert('Failed to update vendor status');
    }
  };

  const openCreateModal = () => {
    setEditingVendor(null);
    setFormData({ productId: '', vendorName: '', url: '', scrapingSelector: '' });
    setIsModalOpen(true);
  };

  const getProductName = (vendor: IVendorProduct) => {
    if (typeof vendor.productId === 'object' && vendor.productId.name) {
      return vendor.productId.name;
    }
    return 'Unknown Product';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-[var(--text-secondary)]">Loading vendors...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Vendors</h1>
            <p className="text-[var(--text-secondary)] mt-2">
              Manage vendor URLs for price scraping
            </p>
          </div>
          <Button variant="bronze" onClick={openCreateModal}>
            Add Vendor
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                className="input-dark"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product._id.toString()} value={product._id.toString()}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Vendors List */}
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <Card key={vendor._id.toString()}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">
                        {vendor.vendorName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        vendor.isActive 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--text-secondary)]">Product:</span>
                        <span className="ml-2 text-[var(--text-primary)]">
                          {getProductName(vendor)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-secondary)]">Last Scraped:</span>
                        <span className="ml-2 text-[var(--text-primary)]">
                          {vendor.lastScrapedAt 
                            ? new Date(vendor.lastScrapedAt).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-[var(--text-secondary)]">URL:</span>
                        <a 
                          href={vendor.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-[var(--accent-bronze)] hover:text-[var(--bronze-600)] transition-colors break-all"
                        >
                          {vendor.url}
                        </a>
                      </div>
                      {vendor.scrapingSelector && (
                        <div className="md:col-span-2">
                          <span className="text-[var(--text-secondary)]">CSS Selector:</span>
                          <code className="ml-2 text-[var(--text-primary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded text-xs">
                            {vendor.scrapingSelector}
                          </code>
                        </div>
                      )}
                      <div>
                        <span className="text-[var(--text-secondary)]">Failure Count:</span>
                        <span className={`ml-2 ${
                          vendor.scrapeFailureCount > 5 
                            ? 'text-red-400' 
                            : vendor.scrapeFailureCount > 0 
                              ? 'text-yellow-400' 
                              : 'text-green-400'
                        }`}>
                          {vendor.scrapeFailureCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => toggleVendorStatus(vendor)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        vendor.isActive
                          ? 'bg-red-900 text-red-300 hover:bg-red-800'
                          : 'bg-green-900 text-green-300 hover:bg-green-800'
                      }`}
                    >
                      {vendor.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="text-[var(--accent-bronze)] hover:text-[var(--bronze-600)] transition-colors p-2"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(vendor._id.toString())}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {vendors.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🏪</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                No Vendors Found
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                {selectedProduct 
                  ? 'No vendors found for the selected product.' 
                  : 'Get started by adding vendor URLs to track prices.'}
              </p>
              <Button variant="bronze" onClick={openCreateModal}>
                Add Your First Vendor
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Vendor Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Product
              </label>
              <select
                className="input-dark w-full"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                required
                disabled={!!editingVendor}
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} ({product.category})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Vendor Name"
              value={formData.vendorName}
              onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              placeholder="e.g., PeptideSciences"
              required
            />

            <Input
              label="Product URL"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/product-page"
              required
            />

            <Input
              label="CSS Selector (Optional)"
              value={formData.scrapingSelector}
              onChange={(e) => setFormData({ ...formData, scrapingSelector: e.target.value })}
              placeholder=".price, #product-price, [data-price]"
              helperText="CSS selector to find the price element on the page"
            />

            <div className="flex space-x-4 pt-4">
              <Button type="submit" variant="bronze" className="flex-1">
                {editingVendor ? 'Update Vendor' : 'Add Vendor'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
