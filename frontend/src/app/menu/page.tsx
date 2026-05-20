'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { ShoppingCart, ArrowLeft, Search, Plus, Minus, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
        ]);
        setCategories(catRes.data.data || []);
        setProducts(prodRes.data.data || prodRes.data.products || []);
      } catch (err) {
        console.error('Failed to load menu');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category?._id === activeCategory || p.category === activeCategory;
    const matchesSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    toast.success(`${product.name} added!`, { icon: '🛒' });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i._id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i._id !== id));

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const getCartQty = (id: string) => cart.find(i => i._id === id)?.qty || 0;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition"><ArrowLeft size={20} /></Link>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🍗</span>
              <span className="text-lg font-bold text-red-500 hidden sm:inline">Aleem Restaurant</span>
            </Link>
          </div>
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search burgers, chicken, deals..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>
          <button onClick={() => setShowCart(true)} className="relative bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition">
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Categories - Horizontal scrollable */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide -mx-4 px-4">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition ${activeCategory === 'all' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
          >All Items</button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === cat._id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >{cat.name}</button>
          ))}
        </div>

        {/* Category Header */}
        {activeCategory !== 'all' && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">{categories.find(c => c._id === activeCategory)?.name || 'Menu'}</h1>
            <p className="text-gray-500 text-sm mt-1">{categories.find(c => c._id === activeCategory)?.description || ''}</p>
          </div>
        )}
        {activeCategory === 'all' && <h1 className="text-2xl font-bold text-white mb-6">Full Menu</h1>}

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-gray-400 text-lg">No items found</p>
            <p className="text-gray-600 text-sm mt-1">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(product => {
              const inCartQty = getCartQty(product._id);
              return (
                <div key={product._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition group flex flex-col">
                  <div className="relative h-44 bg-gradient-to-br from-red-900/20 to-gray-800 overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex items-center justify-center h-full"><span className="text-5xl">🍗</span></div>
                    )}
                    {product.isBestSeller && (
                      <span className="absolute top-3 left-3 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">BEST SELLER</span>
                    )}
                    {product.isDeal && (
                      <span className="absolute top-3 left-3 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">DEAL</span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-white font-semibold mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-xs mb-4 line-clamp-2 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-red-400">Rs {product.price}</span>
                      {inCartQty > 0 ? (
                        <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-1">
                          <button onClick={() => updateQty(product._id, -1)} className="p-1.5 text-gray-400 hover:text-white"><Minus size={14} /></button>
                          <span className="text-white text-sm font-medium w-5 text-center">{inCartQty}</span>
                          <button onClick={() => updateQty(product._id, 1)} className="p-1.5 text-gray-400 hover:text-white"><Plus size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(product)} className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition flex items-center gap-1">
                          <Plus size={14} /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Bottom Bar */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 p-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <span className="text-white font-medium">{cartCount} item{cartCount > 1 ? 's' : ''}</span>
              <span className="text-gray-500 mx-2">|</span>
              <span className="text-red-400 font-bold text-lg">Rs {cartTotal.toLocaleString()}</span>
            </div>
            <button onClick={() => setShowCart(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-red-600/30">
              View Cart →
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowCart(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Your Cart ({cartCount})</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🛒</p>
                  <p className="text-gray-400">Your cart is empty</p>
                </div>
              ) : cart.map(item => (
                <div key={item._id} className="bg-gray-800 rounded-xl p-3 flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
                    {item.images?.[0] ? <img src={item.images[0]} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl flex items-center justify-center h-full">🍗</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium truncate">{item.name}</h4>
                    <p className="text-red-400 font-semibold text-sm">Rs {item.price * item.qty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => updateQty(item._id, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded text-gray-300 hover:text-white"><Minus size={12} /></button>
                      <span className="text-white text-sm w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item._id, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded text-gray-300 hover:text-white"><Plus size={12} /></button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="text-gray-500 hover:text-red-400 self-start"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-800">
                <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Subtotal</span><span className="text-white">Rs {cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Delivery Fee</span><span className="text-white">Rs 100</span></div>
                <div className="flex justify-between mb-4 text-lg font-bold"><span className="text-white">Total</span><span className="text-red-400">Rs {(cartTotal + 100).toLocaleString()}</span></div>
                <button onClick={() => { toast.success('Order placed! 🎉'); setCart([]); setShowCart(false); }} className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-semibold transition shadow-lg shadow-red-600/30">
                  Place Order - Rs {(cartTotal + 100).toLocaleString()}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
