'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: '', unit: 'kg', currentStock: '', minimumStock: '10', costPerUnit: '', branch: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, alertsRes] = await Promise.all([api.get('/inventory'), api.get('/inventory/low-stock')]);
      setItems(itemsRes.data.items);
      setLowStock(alertsRes.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdjust = async (id: string, type: string) => {
    const quantity = prompt(`Enter quantity for ${type}:`);
    if (!quantity) return;
    const reason = prompt('Reason:') || type;
    try {
      await api.post(`/inventory/${id}/adjust`, { type, quantity: Number(quantity), reason });
      toast.success('Stock adjusted');
      fetchData();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          <Plus size={18} /> Add Item
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={18} className="text-yellow-600" /><span className="font-semibold text-yellow-800">Low Stock Alerts ({lowStock.length})</span></div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(item => (
              <span key={item._id} className="px-2 py-1 bg-yellow-100 rounded text-xs text-yellow-800">{item.name}: {item.currentStock} {item.unit}</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        {loading ? (
          <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Item</th>
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3">Min</th>
                <th className="text-left px-4 py-3">Unit</th>
                <th className="text-left px-4 py-3">Cost/Unit</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item._id} className={`hover:bg-gray-50 ${item.currentStock <= item.minimumStock ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.sku}</td>
                  <td className="px-4 py-3 font-bold">{item.currentStock}</td>
                  <td className="px-4 py-3">{item.minimumStock}</td>
                  <td className="px-4 py-3">{item.unit}</td>
                  <td className="px-4 py-3">Rs {item.costPerUnit}</td>
                  <td className="px-4 py-3 flex gap-1">
                    <button onClick={() => handleAdjust(item._id, 'purchase')} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">+Stock</button>
                    <button onClick={() => handleAdjust(item._id, 'consumption')} className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">-Use</button>
                    <button onClick={() => handleAdjust(item._id, 'waste')} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Waste</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
