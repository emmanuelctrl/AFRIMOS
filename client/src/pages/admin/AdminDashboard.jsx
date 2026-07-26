import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => setData(data));
  }, []);

  if (!data) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Platform overview</h1>

      {/* Split by role: one combined number hid pending buyers behind a link
          that only ever showed suppliers. */}
      {[
        ['supplier', data.pendingSuppliers, 'exporter'],
        ['buyer', data.pendingBuyers, 'buyer'],
      ]
        .filter(([, count]) => count > 0)
        .map(([role, count, noun]) => (
          <Link
            key={role}
            to={`/admin/accounts?role=${role}&status=pending`}
            className="block rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 backdrop-blur-sm text-sm font-medium text-amber-300 hover:bg-amber-500/20"
          >
            ⚠ {count} {noun}
            {count === 1 ? '' : 's'} awaiting approval - review now
          </Link>
        ))}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total suppliers" value={data.totalSuppliers} />
        <StatCard label="Total buyers" value={data.totalBuyers} />
        <StatCard label="RFQs sent" value={data.totalRFQs} hint={`${data.closedRfqs} closed`} />
        <StatCard label="Messages exchanged" value={data.totalMessages} />
      </div>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold text-white">Growth - last 12 weeks</h2>
        <div className="h-80">
          <ResponsiveContainer>
            <BarChart data={data.growth} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                tickFormatter={(d) => d.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#101012', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#e5e7eb' }}
                labelStyle={{ color: '#e5e7eb' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Legend />
              <Bar dataKey="suppliers" name="New suppliers" fill="#e11d3a" radius={[3, 3, 0, 0]} />
              <Bar dataKey="buyers" name="New buyers" fill="#f65f6f" radius={[3, 3, 0, 0]} />
              <Bar dataKey="rfqs" name="RFQs" fill="#f0b429" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="flex gap-3">
        <Link to="/admin/accounts" className="btn-primary">
          Account verification
        </Link>
        <Link to="/admin/users" className="btn-secondary">
          User management
        </Link>
      </div>
    </div>
  );
}
