'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, Eye, X, Clock, MapPin, Phone, User, Package, Truck, ChefHat, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  customer: any;
  items: any[];
  orderType: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  rider?: any;
  preparationStartedAt?: string;
  preparationCompletedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: ChefHat },
  ready: { label: 'Ready', color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: Package },
  rider_assigned: { label: 'Rider Assigned', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', icon: Truck },
  picked_up: { label: 'Picked Up', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', icon: Truck },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-100 border-green-300', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: XCircle },
  refunded: { label: 'Refunded', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: RefreshCw },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({});
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusLogs, setStatusLogs] = useState<any[]>([]);
  const [adminNote, setAdminNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      params.set('page', String(filters.page));
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.orders || []);
      setPagination(data.pagination || {});
    } catch {
      toast.error('Failed to load orders');
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filters]);

  const viewOrder = async (order: Order) => {
    setSelectedOrder(order);
    try {
      const { data } = await api.get(`/orders/${order._id}/status-logs`);
      setStatusLogs(data.data || []);
    } catch {
      setStatusLogs([]);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingStatus(true);
    try {
      await api.put(`/orders/${id}/status`, { status, note: adminNote || undefined });
      toast.success(`Order status updated to ${STATUS_CONFIG[status]?.label || status}`);
      setAdminNote('');
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        const { data } = await api.get(`/orders/${id}`);
        setSelectedOrder(data.data);
        const logsRes = await api.get(`/orders/${id}/status-logs`);
        setStatusLogs(logsRes.data.data || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
    setUpdatingStatus(false);
  };

  const statuses = ['', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

  const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const getTimeSince = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track, manage and update all customer orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
            placeholder="Search by order # or customer..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => {
            const cfg = s ? STATUS_CONFIG[s] : null;
            return (
              <button
                key={s}
                onClick={() => setFilters({ ...filters, status: s, page: 1 })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${filters.status === s ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                {s ? cfg?.label || s : 'All'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">Orders placed by customers will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Order #</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Items</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Time</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-gray-900">{order.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{order.customer?.name || 'Guest'}</p>
                          <p className="text-xs text-gray-500">{order.customer?.phone || ''}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${order.orderType === 'delivery' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                          {order.orderType === 'delivery' ? '🚚 Delivery' : '🛍️ Pickup'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.items?.length || 0} items</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">Rs {order.total?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusCfg.bg} ${statusCfg.color}`}>
                          <StatusIcon size={12} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{getTimeSince(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => viewOrder(order)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="View Details">
                            <Eye size={16} />
                          </button>
                          <select
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-red-500"
                            value=""
                            onChange={(e) => { if (e.target.value) updateStatus(order._id, e.target.value); }}
                          >
                            <option value="">Update...</option>
                            {getNextStatuses(order.status).map(s => (
                              <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
            disabled={filters.page === 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => (
            <button
              key={i}
              onClick={() => setFilters({ ...filters, page: i + 1 })}
              className={`px-3 py-1.5 rounded-lg text-sm ${filters.page === i + 1 ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
            disabled={filters.page === pagination.pages}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white z-50 shadow-2xl overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Order #{selectedOrder.orderNumber}</h2>
                <p className="text-xs text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Actions */}
              <div className={`p-4 rounded-xl border ${STATUS_CONFIG[selectedOrder.status]?.bg || 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => { const Icon = STATUS_CONFIG[selectedOrder.status]?.icon || Clock; return <Icon size={24} className={STATUS_CONFIG[selectedOrder.status]?.color || ''} />; })()}
                    <div>
                      <p className={`font-bold text-lg ${STATUS_CONFIG[selectedOrder.status]?.color || ''}`}>{STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}</p>
                      <p className="text-xs text-gray-500">Last updated: {formatDate(selectedOrder.updatedAt)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedOrder.orderType === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {selectedOrder.orderType === 'delivery' ? '🚚 Delivery' : '🛍️ Pickup'}
                  </span>
                </div>

                {/* Update Status */}
                {getNextStatuses(selectedOrder.status).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200/50">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Update Status:</p>
                    <div className="flex flex-wrap gap-2">
                      {getNextStatuses(selectedOrder.status).map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selectedOrder._id, s)}
                          disabled={updatingStatus}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border disabled:opacity-50 ${s === 'cancelled' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-gray-300 text-gray-700 hover:bg-white'}`}
                        >
                          {STATUS_CONFIG[s]?.label || s}
                        </button>
                      ))}
                    </div>
                    <input
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      placeholder="Add note for status change (optional)"
                      className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><User size={16} /> Customer Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Name</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customer?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1"><Phone size={12} /> {selectedOrder.customer?.phone || 'N/A'}</p>
                  </div>
                  {selectedOrder.deliveryAddress && (
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Delivery Address</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1"><MapPin size={12} /> {selectedOrder.deliveryAddress}</p>
                    </div>
                  )}
                  {selectedOrder.notes && (
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Customer Note</p>
                      <p className="font-medium text-gray-900 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">📝 {selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Package size={16} /> Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-lg">🍗</span>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                          <p className="text-xs text-gray-500">Rs {item.unitPrice} × {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">Rs {item.totalPrice?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 mb-2">Payment Summary</h3>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="text-gray-900">Rs {selectedOrder.subtotal?.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery Fee</span><span className="text-gray-900">Rs {selectedOrder.deliveryFee?.toLocaleString() || '0'}</span></div>
                {(selectedOrder.discount || 0) > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-green-600">-Rs {selectedOrder.discount?.toLocaleString()}</span></div>}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200"><span>Total</span><span className="text-red-600">Rs {selectedOrder.total?.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs pt-2"><span className="text-gray-500">Payment Method</span><span className="uppercase font-medium text-gray-700">{selectedOrder.paymentMethod}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Payment Status</span><span className={`font-medium ${selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{selectedOrder.paymentStatus}</span></div>
              </div>

              {/* Status Timeline */}
              {statusLogs.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Clock size={16} /> Order Timeline</h3>
                  <div className="space-y-0">
                    {statusLogs.map((log: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full border-2 ${idx === statusLogs.length - 1 ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}`} />
                          {idx < statusLogs.length - 1 && <div className="w-0.5 h-8 bg-gray-200" />}
                        </div>
                        <div className="pb-4">
                          <p className="text-sm font-medium text-gray-900">
                            {log.fromStatus ? `${STATUS_CONFIG[log.fromStatus]?.label || log.fromStatus} → ` : ''}{STATUS_CONFIG[log.toStatus]?.label || log.toStatus}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                          {log.note && <p className="text-xs text-gray-600 mt-0.5 italic">{log.note}</p>}
                          {log.changedBy && <p className="text-xs text-gray-400">by {log.changedBy.name || 'System'}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getNextStatuses(current: string): string[] {
  const map: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['rider_assigned', 'delivered'],
    rider_assigned: ['picked_up'],
    picked_up: ['out_for_delivery'],
    out_for_delivery: ['delivered'],
  };
  return map[current] || [];
}
