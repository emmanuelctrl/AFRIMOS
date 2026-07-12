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
      <h1 className="text-2xl font-bold text-gray-900">Platform overview</h1>

      {data.pendingVerifications > 0 && (
        <Link
          to="/admin/suppliers?status=pending"
          className="block rounded-xl bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-800 hover:bg-yellow-100"
        >
          ⚠ {data.pendingVerifications} supplier{data.pendingVerifications === 1 ? '' : 's'} awaiting
          verification - review now
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total suppliers" value={data.totalSuppliers} />
        <StatCard label="Total buyers" value={data.totalBuyers} />
        <StatCard label="RFQs sent" value={data.totalRFQs} hint={`${data.closedRfqs} closed`} />
        <StatCard label="Messages exchanged" value={data.totalMessages} />
      </div>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Growth - last 12 weeks</h2>
        <div className="h-80">
          <ResponsiveContainer>
            <BarChart data={data.growth} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(d) => d.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="suppliers" name="New suppliers" fill="#356d51" radius={[3, 3, 0, 0]} />
              <Bar dataKey="buyers" name="New buyers" fill="#68a584" radius={[3, 3, 0, 0]} />
              <Bar dataKey="rfqs" name="RFQs" fill="#de911d" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="flex gap-3">
        <Link to="/admin/suppliers" className="btn-primary">
          Supplier verification
        </Link>
        <Link to="/admin/users" className="btn-secondary">
          User management
        </Link>
      </div>
    </div>
  );
}
