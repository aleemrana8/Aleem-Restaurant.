'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '', lat: '', lng: '', deliveryFee: '150', minimumOrder: '500' });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/branches');
      setBranches(data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, lat: Number(form.lat), lng: Number(form.lng), deliveryFee: Number(form.deliveryFee), minimumOrder: Number(form.minimumOrder) };
      if (editing) {
        await api.put(`/branches/${editing._id}`, payload);
        toast.success('Branch updated');
      } else {
        await api.post('/branches', payload);
        toast.success('Branch created');
      }
      setShowForm(false);
      setEditing(null);
      fetchBranches();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const toggleOpen = async (id: string) => {
    await api.patch(`/branches/${id}/toggle-open`);
    fetchBranches();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Branches</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', address: '', city: '', phone: '', lat: '', lng: '', deliveryFee: '150', minimumOrder: '500' }); }} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          <Plus size={18} /> Add Branch
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border rounded-lg" required />
            <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="px-3 py-2 border rounded-lg" required />
            <input placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="px-3 py-2 border rounded-lg md:col-span-2" required />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 border rounded-lg" required />
            <input placeholder="Latitude" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} className="px-3 py-2 border rounded-lg" required />
            <input placeholder="Longitude" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} className="px-3 py-2 border rounded-lg" required />
            <input placeholder="Delivery Fee" type="number" value={form.deliveryFee} onChange={e => setForm({ ...form, deliveryFee: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <input placeholder="Minimum Order" type="number" value={form.minimumOrder} onChange={e => setForm({ ...form, minimumOrder: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(branch => (
          <div key={branch._id} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{branch.name}</h3>
                <p className="text-sm text-gray-500">{branch.address}</p>
                <p className="text-sm text-gray-500">{branch.city} | {branch.phone}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${branch.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {branch.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => toggleOpen(branch._id)} className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50">
                {branch.isOpen ? 'Close' : 'Open'}
              </button>
              <button onClick={() => { setEditing(branch); setForm({ name: branch.name, address: branch.address, city: branch.city, phone: branch.phone, lat: String(branch.lat), lng: String(branch.lng), deliveryFee: String(branch.deliveryFee), minimumOrder: String(branch.minimumOrder) }); setShowForm(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                <Pencil size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
