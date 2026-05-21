'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Image from 'next/image';
import { ShoppingCart, MapPin, Clock, Phone, ChevronRight, Star } from 'lucide-react';

export default function Home() {
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ]);
        const products = prodRes.data.data || prodRes.data.products || [];
        setBestSellers(products.filter((p: any) => p.isBestSeller).slice(0, 6));
        setCategories(catRes.data.data || []);
      } catch {}
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Aleem Restaurant" width={40} height={40} className="rounded-full" />
            <span className="text-xl font-bold text-red-500">Aleem Restaurant</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/menu" className="text-gray-300 hover:text-white transition">Menu</Link>
            <a href="#deals" className="text-gray-300 hover:text-white transition">Deals</a>
            <a href="#about" className="text-gray-300 hover:text-white transition">About</a>
            <a href="#contact" className="text-gray-300 hover:text-white transition">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/menu" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition">
              <ShoppingCart size={16} /> Order Now
            </Link>
            <Link href="/login" className="text-xs text-gray-500 hover:text-gray-300 transition border border-gray-700 px-3 py-2 rounded-lg">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent z-10" />
        <div className="absolute inset-0" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-20 max-w-7xl mx-auto px-4 py-24 md:py-36">
          <div className="max-w-xl">
            <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">🔥 FREE DELIVERY ON ORDERS ABOVE RS 2000</span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">Taste the <span className="text-red-500">Crunch</span> of Perfection</h1>
            <p className="text-gray-300 text-lg mb-8">Hand-breaded, crispy fried chicken made fresh to order. Burgers, wings, family deals & more delivered hot to your door.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/menu" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition shadow-lg shadow-red-600/30">
                Order Now
              </Link>
              <a href="#menu-categories" className="border border-gray-600 hover:border-white text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition">
                Explore Menu
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Info Bar */}
      <section className="bg-red-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-8 text-sm font-medium">
          <div className="flex items-center gap-2"><Clock size={16} /> Open 10 AM - 2 AM</div>
          <div className="flex items-center gap-2"><MapPin size={16} /> Delivering in Lahore</div>
          <div className="flex items-center gap-2"><Phone size={16} /> 042-3578-1234</div>
          <div className="flex items-center gap-2"><Star size={16} /> 4.8★ Rating</div>
        </div>
      </section>

      {/* Menu Categories */}
      <section id="menu-categories" className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Explore Menu</h2>
          <Link href="/menu" className="text-red-400 text-sm font-medium flex items-center gap-1 hover:text-red-300">View All <ChevronRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.slice(0, 10).map(cat => (
            <Link key={cat._id} href={`/menu?category=${cat._id}`} className="group bg-gray-900 border border-gray-800 rounded-xl p-4 text-center hover:border-red-500/50 hover:bg-gray-800 transition">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gray-800">
                {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" /> : <span className="text-3xl leading-[64px]">🍔</span>}
              </div>
              <p className="text-sm font-medium text-gray-200 group-hover:text-white">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Best Sellers</h2>
            <Link href="/menu" className="text-red-400 text-sm font-medium flex items-center gap-1 hover:text-red-300">View All <ChevronRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {bestSellers.map(product => (
              <div key={product._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition group">
                <div className="h-48 bg-gradient-to-br from-red-900/20 to-gray-800 overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex items-center justify-center h-full"><span className="text-5xl">🍗</span></div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-400">Rs {product.price}</span>
                    <Link href="/menu" className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition">Add to Cart</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section id="deals" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Top Deals</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-900 to-red-700 p-8 flex items-center">
            <div className="flex-1">
              <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded mb-3 inline-block">SAVE 20%</span>
              <h3 className="text-2xl font-bold mb-2">Family Festival</h3>
              <p className="text-red-100 text-sm mb-4">4 Burgers + 4 Chicken + Rolls + 1.5L Drink</p>
              <Link href="/menu" className="bg-white text-red-600 px-5 py-2.5 rounded-lg font-semibold text-sm inline-block hover:bg-gray-100 transition">Order Now</Link>
            </div>
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300" alt="Deal" className="w-36 h-36 object-cover rounded-xl hidden sm:block" />
          </div>
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-800 to-gray-700 p-8 flex items-center">
            <div className="flex-1">
              <span className="bg-green-400 text-black text-xs font-bold px-2 py-1 rounded mb-3 inline-block">MIDNIGHT</span>
              <h3 className="text-2xl font-bold mb-2">Late Night Cravings</h3>
              <p className="text-gray-300 text-sm mb-4">Special deals starting at 12 AM</p>
              <Link href="/menu" className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm inline-block hover:bg-red-700 transition">View Deals</Link>
            </div>
            <img src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=300" alt="Midnight" className="w-36 h-36 object-cover rounded-xl hidden sm:block" />
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">About Aleem Restaurant</h2>
            <p className="text-gray-400 mb-4">We serve the crispiest, most flavorful fried chicken in Lahore. Every piece is hand-breaded with our secret recipe of herbs and spices, made fresh to order.</p>
            <p className="text-gray-400 mb-6">With multiple branches across the city and a commitment to quality, we deliver happiness to your doorstep - hot, fresh, and fast.</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center"><p className="text-2xl font-bold text-red-400">2+</p><p className="text-xs text-gray-500">Branches</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-red-400">40+</p><p className="text-xs text-gray-500">Menu Items</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-red-400">10K+</p><p className="text-xs text-gray-500">Happy Customers</p></div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600" alt="Restaurant" className="w-full h-72 object-cover" />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Our Branches</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">Gulberg III Branch</h3>
            <p className="text-gray-400 text-sm mb-1"><MapPin size={14} className="inline mr-1" />Main Boulevard, Gulberg III, Lahore</p>
            <p className="text-gray-400 text-sm mb-1"><Phone size={14} className="inline mr-1" />042-3578-1234</p>
            <p className="text-gray-400 text-sm"><Clock size={14} className="inline mr-1" />10:00 AM - 2:00 AM</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">DHA Phase 3 Branch</h3>
            <p className="text-gray-400 text-sm mb-1"><MapPin size={14} className="inline mr-1" />Y Block, Phase 3, DHA, Lahore</p>
            <p className="text-gray-400 text-sm mb-1"><Phone size={14} className="inline mr-1" />042-3578-5678</p>
            <p className="text-gray-400 text-sm"><Clock size={14} className="inline mr-1" />10:00 AM - 2:00 AM</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3"><Image src="/logo.png" alt="Aleem Restaurant" width={32} height={32} className="rounded-full" /><h3 className="text-lg font-bold text-red-500">Aleem Restaurant</h3></div>
            <p className="text-gray-500 text-sm">Premium fried chicken & burgers delivered fresh to your door.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="/menu" className="block hover:text-white">Menu</Link>
              <a href="#deals" className="block hover:text-white">Deals</a>
              <a href="#about" className="block hover:text-white">About Us</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <a href="#contact" className="block hover:text-white">Contact Us</a>
              <p>Track Order</p>
              <p>FAQ</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Order Now</h4>
            <p className="text-gray-400 text-sm mb-3">Download our app or order directly from the website.</p>
            <Link href="/menu" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium inline-block hover:bg-red-700">Start Ordering</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-gray-800 flex flex-wrap items-center justify-between text-xs text-gray-600">
          <p>© 2026 Aleem Restaurant. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-gray-400">Admin Panel</Link>
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
