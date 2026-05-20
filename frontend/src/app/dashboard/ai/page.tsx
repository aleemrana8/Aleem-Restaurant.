'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Bot, TrendingUp, Lightbulb, MessageSquare, Zap } from 'lucide-react';

type AiTab = 'recommendations' | 'forecast' | 'demand' | 'chat';

export default function AiPage() {
  const [activeTab, setActiveTab] = useState<AiTab>('recommendations');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const tabs: { key: AiTab; label: string; icon: any }[] = [
    { key: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { key: 'forecast', label: 'Sales Forecast', icon: TrendingUp },
    { key: 'demand', label: 'Demand Forecast', icon: Zap },
    { key: 'chat', label: 'AI Chat', icon: MessageSquare },
  ];

  const fetchData = async (tab: AiTab) => {
    if (tab === 'chat') return;
    setLoading(true);
    try {
      let res;
      switch (tab) {
        case 'recommendations':
          res = await api.get('/ai/recommendations?type=combo');
          break;
        case 'forecast':
          res = await api.get('/ai/forecast/sales?days=7');
          break;
        case 'demand':
          res = await api.get('/ai/forecast/demand');
          break;
      }
      setData(res?.data?.data || null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load AI data');
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(activeTab); }, [activeTab]);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.data.message }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process your request.' }]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="text-primary-500" size={28} />
        <h1 className="text-2xl font-bold text-white">AI & Automation</h1>
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
        {activeTab === 'chat' ? (
          <ChatInterface messages={chatMessages} input={chatInput} setInput={setChatInput} onSend={sendChat} />
        ) : loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" /></div>
        ) : !data ? (
          <p className="text-gray-400 text-center py-12">No AI data available. More order history is needed for accurate predictions.</p>
        ) : (
          <AiContent type={activeTab} data={data} />
        )}
      </div>
    </div>
  );
}

function AiContent({ type, data }: { type: AiTab; data: any }) {
  switch (type) {
    case 'recommendations':
      return <Recommendations data={Array.isArray(data) ? data : []} />;
    case 'forecast':
      return <SalesForecast data={data} />;
    case 'demand':
      return <DemandForecast data={Array.isArray(data) ? data : []} />;
    default:
      return null;
  }
}

function Recommendations({ data }: { data: any[] }) {
  if (!data.length) return <p className="text-gray-400 text-center py-8">No recommendations yet. Need more order history.</p>;
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Suggested Combos</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((combo, i) => (
          <div key={i} className="bg-dark-700 rounded-lg p-4 border border-dark-600">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-medium">Combo #{i + 1}</h4>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Save Rs {combo.savings}</span>
            </div>
            <ul className="space-y-1 mb-3">
              {combo.items?.map((item: any, j: number) => (
                <li key={j} className="text-gray-300 text-sm">• {item.name} (Rs {item.price})</li>
              ))}
            </ul>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Suggested Price:</span>
              <span className="text-primary-400 font-bold">Rs {combo.suggestedPrice}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Confidence: {Math.round((combo.confidence || 0) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalesForecast({ data }: { data: any }) {
  const forecast = data?.forecast || [];
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-2">7-Day Sales Forecast</h3>
      <p className="text-gray-400 text-sm mb-4">Based on {data?.basedOnDays || 0} days of historical data. Avg daily revenue: Rs {(data?.avgDailyRevenue || 0).toLocaleString()}</p>
      <div className="space-y-2">
        {forecast.map((day: any, i: number) => (
          <div key={i} className="flex items-center gap-4 bg-dark-700 rounded-lg p-3">
            <div className="w-24 text-sm text-gray-300">{day.dayOfWeek} {day.date?.slice(5)}</div>
            <div className="flex-1">
              <div className="h-4 bg-dark-600 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (day.predictedRevenue / Math.max(data.avgDailyRevenue * 2, 1)) * 100)}%` }} />
              </div>
            </div>
            <div className="w-28 text-right text-sm text-white font-medium">Rs {(day.predictedRevenue || 0).toLocaleString()}</div>
            <div className="w-16 text-right text-xs text-gray-500">{Math.round((day.confidence || 0) * 100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemandForecast({ data }: { data: any[] }) {
  if (!data.length) return <p className="text-gray-400 text-center py-8">Insufficient data for demand forecast.</p>;
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Product Demand Trends</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-600 text-gray-400">
            <th className="text-left py-2">Product</th>
            <th className="text-right py-2">Orders (14d)</th>
            <th className="text-right py-2">Revenue</th>
            <th className="text-right py-2">Growth</th>
            <th className="text-right py-2">Trend</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item: any, i: number) => (
            <tr key={i} className="border-b border-dark-700 text-gray-300">
              <td className="py-2">{item.name || 'Unknown'}</td>
              <td className="text-right">{item.totalOrdered || 0}</td>
              <td className="text-right">Rs {(item.revenue || 0).toLocaleString()}</td>
              <td className={`text-right ${(item.growth || 0) > 0 ? 'text-green-400' : (item.growth || 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {(item.growth || 0) > 0 ? '+' : ''}{item.growth || 0}%
              </td>
              <td className="text-right">
                <span className={`px-2 py-0.5 rounded text-xs ${item.trend === 'rising' ? 'bg-green-500/20 text-green-400' : item.trend === 'falling' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {item.trend || 'stable'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChatInterface({ messages, input, setInput, onSend }: { messages: any[]; input: string; setInput: (v: string) => void; onSend: () => void }) {
  return (
    <div className="flex flex-col h-[500px]">
      <h3 className="text-lg font-semibold text-white mb-4">AI Assistant</h3>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-3 bg-dark-700 rounded-lg">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center py-8">Ask me about orders, delivery, menu, payments, or anything else!</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-dark-600 text-gray-200'}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSend()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-lg bg-dark-700 border border-dark-600 text-white text-sm focus:outline-none focus:border-primary-500"
        />
        <button onClick={onSend} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Send</button>
      </div>
    </div>
  );
}
