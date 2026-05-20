'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BarChart3, TrendingUp, Users, Truck, ChefHat, Package } from 'lucide-react';

type ReportType = 'daily' | 'monthly' | 'customer' | 'order' | 'rider' | 'kitchen' | 'branch' | 'inventory';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('daily');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ from: getDefaultFrom(), to: new Date().toISOString().split('T')[0] });

  function getDefaultFrom() {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }

  const tabs: { key: ReportType; label: string; icon: any }[] = [
    { key: 'daily', label: 'Daily Sales', icon: BarChart3 },
    { key: 'monthly', label: 'Monthly Sales', icon: TrendingUp },
    { key: 'order', label: 'Orders', icon: BarChart3 },
    { key: 'customer', label: 'Customers', icon: Users },
    { key: 'rider', label: 'Riders', icon: Truck },
    { key: 'kitchen', label: 'Kitchen', icon: ChefHat },
    { key: 'inventory', label: 'Inventory', icon: Package },
  ];

  const fetchReport = async (type: ReportType) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from: dateRange.from, to: dateRange.to });
      const res = await api.get(`/reports/${type}?${params}`);
      setData(res.data.data || res.data);
    } catch (err: any) {
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReport(activeTab); }, [activeTab, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <div className="flex gap-2">
          <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-white text-sm" />
          <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-white text-sm" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" /></div>
        ) : !data ? (
          <p className="text-gray-400 text-center py-12">No data available for the selected period.</p>
        ) : (
          <ReportContent type={activeTab} data={data} />
        )}
      </div>
    </div>
  );
}

function ReportContent({ type, data }: { type: ReportType; data: any }) {
  if (Array.isArray(data) && data.length === 0) return <p className="text-gray-400 text-center py-8">No records found.</p>;

  switch (type) {
    case 'daily':
    case 'monthly':
      return <SalesTable data={Array.isArray(data) ? data : []} type={type} />;
    case 'order':
      return <OrderReport data={data} />;
    case 'customer':
      return <CustomerReport data={Array.isArray(data) ? data : []} />;
    case 'rider':
      return <RiderReport data={Array.isArray(data) ? data : []} />;
    case 'kitchen':
      return <KitchenReport data={data} />;
    case 'inventory':
      return <InventoryReport data={Array.isArray(data) ? data : []} />;
    default:
      return <pre className="text-gray-300 text-sm overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
  }
}

function SalesTable({ data, type }: { data: any[]; type: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">{type === 'daily' ? 'Daily' : 'Monthly'} Sales Summary</h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Revenue" value={`Rs ${data.reduce((s, d) => s + (d.revenue || d.total || 0), 0).toLocaleString()}`} />
        <StatCard label="Total Orders" value={data.reduce((s, d) => s + (d.orders || d.count || 0), 0).toString()} />
        <StatCard label="Avg Order Value" value={`Rs ${data.length ? Math.round(data.reduce((s, d) => s + (d.revenue || d.total || 0), 0) / Math.max(data.reduce((s, d) => s + (d.orders || d.count || 0), 0), 1)) : 0}`} />
      </div>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-dark-600 text-gray-400"><th className="text-left py-2">Date</th><th className="text-right py-2">Orders</th><th className="text-right py-2">Revenue</th></tr></thead>
        <tbody>
          {data.slice(0, 30).map((row, i) => (
            <tr key={i} className="border-b border-dark-700 text-gray-300">
              <td className="py-2">{row._id || row.date || `Day ${i + 1}`}</td>
              <td className="text-right">{row.orders || row.count || 0}</td>
              <td className="text-right">Rs {(row.revenue || row.total || 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderReport({ data }: { data: any }) {
  const items = Array.isArray(data) ? data : data?.statusBreakdown || [];
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Order Report</h3>
      {data?.summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Orders" value={data.summary.totalOrders?.toString() || '0'} />
          <StatCard label="Completed" value={data.summary.completed?.toString() || '0'} />
          <StatCard label="Cancelled" value={data.summary.cancelled?.toString() || '0'} />
          <StatCard label="Revenue" value={`Rs ${(data.summary.revenue || 0).toLocaleString()}`} />
        </div>
      )}
      <table className="w-full text-sm">
        <thead><tr className="border-b border-dark-600 text-gray-400"><th className="text-left py-2">Status</th><th className="text-right py-2">Count</th><th className="text-right py-2">Revenue</th></tr></thead>
        <tbody>
          {items.map((row: any, i: number) => (
            <tr key={i} className="border-b border-dark-700 text-gray-300">
              <td className="py-2 capitalize">{row._id || row.status}</td>
              <td className="text-right">{row.count || 0}</td>
              <td className="text-right">Rs {(row.revenue || row.total || 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerReport({ data }: { data: any[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Top Customers</h3>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-dark-600 text-gray-400"><th className="text-left py-2">Customer</th><th className="text-right py-2">Orders</th><th className="text-right py-2">Spent</th></tr></thead>
        <tbody>
          {data.slice(0, 20).map((c: any, i: number) => (
            <tr key={i} className="border-b border-dark-700 text-gray-300">
              <td className="py-2">{c.name || c.email || 'Unknown'}</td>
              <td className="text-right">{c.totalOrders || c.orders || 0}</td>
              <td className="text-right">Rs {(c.totalSpent || c.spent || 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiderReport({ data }: { data: any[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Rider Performance</h3>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-dark-600 text-gray-400"><th className="text-left py-2">Rider</th><th className="text-right py-2">Deliveries</th><th className="text-right py-2">Avg Time</th><th className="text-right py-2">Rating</th></tr></thead>
        <tbody>
          {data.slice(0, 20).map((r: any, i: number) => (
            <tr key={i} className="border-b border-dark-700 text-gray-300">
              <td className="py-2">{r.name || 'Rider'}</td>
              <td className="text-right">{r.deliveries || r.totalDeliveries || 0}</td>
              <td className="text-right">{r.avgTime || r.avgDeliveryTime || '-'} min</td>
              <td className="text-right">{r.rating || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KitchenReport({ data }: { data: any }) {
  const items = Array.isArray(data) ? data : data?.items || [];
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Kitchen Performance</h3>
      {data?.summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Avg Prep Time" value={`${data.summary.avgPrepTime || 0} min`} />
          <StatCard label="Items Prepared" value={data.summary.totalItems?.toString() || '0'} />
          <StatCard label="On-time Rate" value={`${data.summary.onTimeRate || 0}%`} />
        </div>
      )}
      <table className="w-full text-sm">
        <thead><tr className="border-b border-dark-600 text-gray-400"><th className="text-left py-2">Item/Staff</th><th className="text-right py-2">Prepared</th><th className="text-right py-2">Avg Time</th></tr></thead>
        <tbody>
          {items.slice(0, 20).map((r: any, i: number) => (
            <tr key={i} className="border-b border-dark-700 text-gray-300">
              <td className="py-2">{r.name || r._id || '-'}</td>
              <td className="text-right">{r.count || r.prepared || 0}</td>
              <td className="text-right">{r.avgTime || '-'} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InventoryReport({ data }: { data: any[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Inventory Report</h3>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-dark-600 text-gray-400"><th className="text-left py-2">Item</th><th className="text-right py-2">Stock</th><th className="text-right py-2">Min</th><th className="text-right py-2">Status</th></tr></thead>
        <tbody>
          {data.slice(0, 30).map((r: any, i: number) => (
            <tr key={i} className="border-b border-dark-700 text-gray-300">
              <td className="py-2">{r.name || r.item || '-'}</td>
              <td className="text-right">{r.currentStock || r.stock || 0}</td>
              <td className="text-right">{r.minimumStock || r.min || 0}</td>
              <td className="text-right"><span className={`px-2 py-0.5 rounded text-xs ${(r.currentStock || 0) <= (r.minimumStock || 0) ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{(r.currentStock || 0) <= (r.minimumStock || 0) ? 'Low' : 'OK'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-dark-700 rounded-lg p-4">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
