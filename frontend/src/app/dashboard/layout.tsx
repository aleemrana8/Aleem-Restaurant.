'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, GitBranch,
  Users, UserCog, Bike, ChefHat, Package, FileText,
  BarChart3, Bot, LogOut, Menu, X
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
  { label: 'Menu', href: '/dashboard/products', icon: UtensilsCrossed },
  { label: 'Branches', href: '/dashboard/branches', icon: GitBranch },
  { label: 'Customers', href: '/dashboard/customers', icon: Users },
  { label: 'Employees', href: '/dashboard/employees', icon: UserCog },
  { label: 'Riders', href: '/dashboard/riders', icon: Bike },
  { label: 'Kitchen', href: '/dashboard/kitchen', icon: ChefHat },
  { label: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { label: 'AI', href: '/dashboard/ai', icon: Bot },
  { label: 'CMS', href: '/dashboard/cms', icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loadUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (!stored) router.replace('/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-950 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Aleem Restaurant" width={36} height={36} className="rounded-full ring-2 ring-red-500/30" />
            <h2 className="text-lg font-bold text-white">Aleem <span className="text-red-500">Admin</span></h2>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === item.href ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-red-400 hover:bg-red-950/50 hover:text-red-300 transition">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
            <Menu size={24} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-gray-500">Welcome back,</p>
            <p className="text-sm font-bold text-gray-800">{user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-red-500 capitalize font-medium">{user.role.replace('_', ' ')}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-red-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
