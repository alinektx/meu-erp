'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Search, Trash2, Plus, Minus, CreditCard, Tag, X, ShoppingCart } from 'lucide-react';
import { Product, SaleItem } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';

export default function PDVPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.filter((p: Product) => p.active)));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!search) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.sellingPrice,
        total: product.sellingPrice
      }];
    });
    setSearch('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax - discount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          subtotal,
          tax,
          discount,
          total
        })
      });
      if (res.ok) {
        setCart([]);
        setDiscount(0);
        alert('Venda realizada com sucesso!');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex-1 max-w-2xl relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-lg"
            placeholder="Search by name or scan barcode (Ctrl + K)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          {/* Search Results Dropdown */}
          <AnimatePresence>
            {search && filteredProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-y-auto"
              >
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-none"
                  >
                    <Image src={product.image || ''} alt={product.name} width={48} height={48} className="rounded-lg object-cover" referrerPolicy="no-referrer" />
                    <div className="text-left">
                      <p className="font-bold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">SKU: {product.sku} • Stock: {product.stock}</p>
                    </div>
                    <div className="ml-auto font-bold text-blue-600">
                      ${product.sellingPrice.toFixed(2)}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-6 ml-8">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction ID</p>
            <p className="font-mono font-medium">#TX-2023-0852</p>
          </div>
          <div className="h-10 w-px bg-slate-200"></div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</p>
            <p className="font-medium">{new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Cart List */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Current Sale</h2>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
              {cart.reduce((acc, item) => acc + item.quantity, 0)} Items
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <ShoppingCart className="w-16 h-16 opacity-20" />
                <p className="text-lg font-medium">Your cart is empty</p>
              </div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-slate-400 text-sm uppercase tracking-wider">
                    <th className="pb-2 font-semibold">Product</th>
                    <th className="pb-2 font-semibold text-center">Qty</th>
                    <th className="pb-2 font-semibold text-right">Price</th>
                    <th className="pb-2 font-semibold text-right">Total</th>
                    <th className="pb-2 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={item.productId}
                      className="bg-slate-50 rounded-2xl overflow-hidden hover:bg-slate-100 transition-colors"
                    >
                      <td className="p-4 rounded-l-2xl">
                        <div className="flex items-center gap-4">
                          <Image
                            src={products.find(p => p.id === item.productId)?.image || ''}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-500">SKU: {products.find(p => p.id === item.productId)?.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium">${item.price.toFixed(2)}</td>
                      <td className="p-4 text-right font-bold">${item.total.toFixed(2)}</td>
                      <td className="p-4 text-right rounded-r-2xl">
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-rose-500 hover:text-rose-700 p-2 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="w-96 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col gap-6">
            <h3 className="text-xl font-bold text-slate-800">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (8%)</span>
                <span className="font-semibold text-slate-800">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">Discount</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-bold">
                  -${discount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-4 p-6 bg-slate-900 rounded-2xl text-white">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1">Total Amount Due</p>
              <p className="text-4xl font-extrabold">${total.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckout}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl font-bold text-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3"
            >
              <CreditCard className="w-6 h-6" />
              {isProcessing ? 'Processing...' : 'Checkout (F10)'}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDiscount(prev => prev === 0 ? 5 : 0)}
                className="py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Tag className="w-5 h-5 text-emerald-500" />
                Discount
              </button>
              <button
                onClick={() => setCart([])}
                className="py-4 bg-white border border-slate-200 text-rose-600 rounded-2xl font-bold hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>

          <div className="mt-auto p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <p className="text-xs text-blue-600 font-semibold mb-2 uppercase">Keyboard Shortcuts</p>
            <div className="grid grid-cols-2 gap-y-1 text-xs text-blue-800">
              <span>F1: Search</span>
              <span className="text-right font-mono">CTRL + K</span>
              <span>F10: Pay</span>
              <span className="text-right font-mono">ENTER</span>
              <span>Esc: Cancel</span>
              <span className="text-right font-mono">ESC</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
