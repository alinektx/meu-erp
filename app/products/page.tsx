'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Search, Edit2, Trash2, Package, ArrowLeft, Upload, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct?.id ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        fetchProducts();
        setIsModalOpen(false);
        setEditingProduct(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openAddModal = () => {
    setEditingProduct({
      name: '',
      sku: '',
      category: '',
      description: '',
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      active: true,
      trackInventory: true,
      image: 'https://picsum.photos/seed/' + Math.random() + '/200'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-semibold">
            {products.length} Products
          </span>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </header>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">SKU</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold text-right">Stock</th>
                <th className="px-6 py-4 font-bold text-right">Price</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Image src={product.image || ''} alt={product.name} width={40} height={40} className="rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-slate-800">{product.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{product.sku}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "font-bold",
                        product.stock <= 5 ? "text-rose-600" : "text-slate-800"
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      ${product.sellingPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold",
                        product.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal (Drawer style) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-slate-50 h-full shadow-2xl flex flex-col"
            >
              <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <h2 className="text-xl font-bold text-slate-800">
                    {editingProduct?.id ? 'Edit Product' : 'New Product Registration'}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    form="product-form"
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-100"
                  >
                    Save Product
                  </button>
                </div>
              </header>

              <form id="product-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Basic Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-600 mb-2">Product Name *</label>
                          <input
                            required
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Wireless Ergonomic Mouse"
                            value={editingProduct?.name || ''}
                            onChange={e => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">SKU / Barcode</label>
                            <input
                              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                              placeholder="UPC-123456789"
                              value={editingProduct?.sku || ''}
                              onChange={e => setEditingProduct(prev => ({ ...prev, sku: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Category</label>
                            <select
                              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                              value={editingProduct?.category || ''}
                              onChange={e => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                            >
                              <option value="">Select a category</option>
                              <option value="Coffee">Coffee</option>
                              <option value="Dairy">Dairy</option>
                              <option value="Electronics">Electronics</option>
                              <option value="Office">Office Supplies</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-600 mb-2">Description</label>
                          <textarea
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                            placeholder="Provide detailed technical specifications..."
                            value={editingProduct?.description || ''}
                            onChange={e => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Pricing & Inventory */}
                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Pricing & Inventory</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-600 mb-2">Cost Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                            value={editingProduct?.costPrice || 0}
                            onChange={e => setEditingProduct(prev => ({ ...prev, costPrice: parseFloat(e.target.value) }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-600 mb-2">Selling Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                            value={editingProduct?.sellingPrice || 0}
                            onChange={e => setEditingProduct(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-600 mb-2">Stock Quantity</label>
                          <input
                            type="number"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                            value={editingProduct?.stock || 0}
                            onChange={e => setEditingProduct(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                          />
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    {/* Image Upload */}
                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Product Image</h3>
                      <div className="aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 group hover:border-blue-400 transition-colors cursor-pointer overflow-hidden relative">
                        {editingProduct?.image ? (
                          <Image src={editingProduct.image} alt="Preview" fill className="object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            <p className="text-xs text-slate-400 text-center px-4">
                              <span className="text-blue-600 font-bold">Upload a file</span> or drag and drop
                            </p>
                          </>
                        )}
                      </div>
                    </section>

                    {/* Status */}
                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Status & Visibility</h3>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                            editingProduct?.active ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"
                          )}>
                            {editingProduct?.active && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={editingProduct?.active}
                            onChange={e => setEditingProduct(prev => ({ ...prev, active: e.target.checked }))}
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-700">Active</p>
                            <p className="text-xs text-slate-400">Visible in POS and Store</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                            editingProduct?.trackInventory ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"
                          )}>
                            {editingProduct?.trackInventory && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={editingProduct?.trackInventory}
                            onChange={e => setEditingProduct(prev => ({ ...prev, trackInventory: e.target.checked }))}
                          />
                          <p className="text-sm font-bold text-slate-700">Track Inventory</p>
                        </label>
                      </div>
                    </section>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
