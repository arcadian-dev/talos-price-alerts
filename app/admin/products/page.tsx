'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { IProduct } from '@/models';

interface ProductFormData {
  name: string;
  category: string;
  description: string;
  unit: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    description: '',
    unit: 'mg',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const units = ['mg', 'ml', 'g', 'capsules', 'tablets', 'iu', 'mcg'];
  const categories = ['Peptides', 'Supplements', 'Nootropics', 'Hormones', 'Other'];

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products);
      } else {
        console.error('Failed to fetch products:', data.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting form data:', formData);
    
    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct._id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      console.log(`Making ${method} request to ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({ name: '', category: '', description: '', unit: 'mg' });
        fetchProducts();
      } else {
        console.log('Error response status:', response.status);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Error response data:', data);
          alert(data.error || 'Failed to save product');
        } else {
          // Response is not JSON (probably HTML error page)
          const text = await response.text();
          console.log('Non-JSON response:', text.substring(0, 500));
          alert(`Server error (${response.status}): Check console for details`);
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (product: IProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || '',
      unit: product.unit,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: '', description: '', unit: 'mg' });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-[var(--text-secondary)]">Loading products...</div>
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
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Products</h1>
            <p className="text-[var(--text-secondary)] mt-2">
              Manage peptides and longevity products for price tracking
            </p>
          </div>
          <Button variant="bronze" onClick={openCreateModal}>
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="input-dark"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product._id} className="relative">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{product.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-[var(--accent-bronze)] hover:text-[var(--bronze-600)] transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Category:</span>
                    <span className="text-[var(--text-primary)]">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Unit:</span>
                    <span className="text-[var(--text-primary)]">{product.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Status:</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      product.isActive 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {product.description && (
                    <div className="mt-3">
                      <p className="text-[var(--text-secondary)] text-sm">
                        {product.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                No Products Found
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                {searchTerm || selectedCategory 
                  ? 'No products match your current filters.' 
                  : 'Get started by adding your first product to track.'}
              </p>
              <Button variant="bronze" onClick={openCreateModal}>
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Product Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., BPC-157"
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Category
              </label>
              <select
                className="input-dark w-full"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Unit
              </label>
              <select
                className="input-dark w-full"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the product..."
            />

            <div className="flex space-x-4 pt-4">
              <Button type="submit" variant="bronze" className="flex-1">
                {editingProduct ? 'Update Product' : 'Create Product'}
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
