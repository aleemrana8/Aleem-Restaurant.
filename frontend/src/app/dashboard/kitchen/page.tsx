'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function KitchenPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [queueRes, statsRes] = await Promise.all([
        api.get('/kitchen/queue'),
        api.get('/kitchen/stats'),
      ]);
      setQueue(queueRes.data.data);
      setStats(statsRes.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/kitchen/${id}/status`, { status });
      toast.success('Status updated');
      fetchData();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Kitchen Display</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-yellow-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-yellow-600">{stats.queued}</p><p className="text-xs text-yellow-700">Queued</p></div>
          <div className="bg-orange-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p><p className="text-xs text-orange-700">In Progress</p></div>
          <div className="bg-green-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-green-600">{stats.completedToday}</p><p className="text-xs text-green-700">Completed Today</p></div>
          <div className="bg-red-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-red-600">{stats.delayed}</p><p className="text-xs text-red-700">Delayed</p></div>
          <div className="bg-blue-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-blue-600">{stats.avgPreparationTime}m</p><p className="text-xs text-blue-700">Avg Prep Time</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queue.map(item => (
          <div key={item._id} className={`bg-white rounded-xl shadow-sm border-l-4 p-4 ${item.status === 'queued' ? 'border-l-yellow-400' : item.status === 'in_progress' ? 'border-l-orange-400' : item.status === 'delayed' ? 'border-l-red-400' : 'border-l-green-400'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold">#{item.order?.orderNumber}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'queued' ? 'bg-yellow-100 text-yellow-800' : item.status === 'in_progress' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                {item.status}
              </span>
            </div>
            <div className="space-y-1 mb-3">
              {item.items?.map((i: any, idx: number) => (
                <p key={idx} className="text-sm">{i.quantity}x {i.productName} {i.size ? `(${i.size})` : ''}</p>
              ))}
            </div>
            <div className="flex gap-2">
              {item.status === 'queued' && <button onClick={() => updateStatus(item._id, 'in_progress')} className="px-3 py-1 text-xs bg-orange-500 text-white rounded-lg">Start</button>}
              {item.status === 'in_progress' && <button onClick={() => updateStatus(item._id, 'completed')} className="px-3 py-1 text-xs bg-green-500 text-white rounded-lg">Complete</button>}
              {item.status !== 'delayed' && item.status !== 'completed' && <button onClick={() => updateStatus(item._id, 'delayed')} className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg">Delay</button>}
            </div>
          </div>
        ))}
        {queue.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">Kitchen queue is empty</p>}
      </div>
    </div>
  );
}
