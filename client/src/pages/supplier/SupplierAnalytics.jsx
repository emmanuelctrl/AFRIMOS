import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';

export default function SupplierAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/suppliers/me/analytics')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-gray-400">Analytics unavailable.</p>;

  const exportCsv = () => {
    const rows = [['date', 'inquiries'], ...data.inquiriesByDay.map((d) => [d.date, d.count])];
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'afrimos-inquiries.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <button className="btn-secondary" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total inquiries" value={data.totalInquiries} />
        <StatCard label="Response rate" value={`${data.responseRate}%`} />
        <StatCard label="Messages exchanged" value={data.totalMessages} />
        <StatCard label="Completed transactions" value={data.totalTransactions} />
      </div>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold text-white">Inquiries - last 30 days</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={data.inquiriesByDay} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="inq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d3a" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#e11d3a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                tickFormatter={(d) => d.slice(5)}
                interval={4}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#101012', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#e5e7eb' }}
                labelStyle={{ color: '#e5e7eb' }}
                cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
              />
              <Area type="monotone" dataKey="count" name="Inquiries" stroke="#e11d3a" strokeWidth={2} fill="url(#inq)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
