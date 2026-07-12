import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/rfqs', { params: { limit: 50 } }),
      api.get('/messages/conversations').catch(() => ({ data: { conversations: [] } })),
    ]).then(([r, c]) => {
      setRfqs(r.data.rfqs);
      setConversations(c.data.conversations);
    });
  }, []);

  if (!rfqs) return <Spinner />;

  const suppliersContacted = new Set(rfqs.filter((r) => r.supplier).map((r) => r.supplier.id)).size;
  const unread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.fullName}</h1>
        <div className="flex gap-2">
          <Link to="/dashboard/buyer/rfqs/new" className="btn-primary">
            + Create RFQ
          </Link>
          <Link to="/dashboard/buyer/search" className="btn-secondary">
            Browse Suppliers
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="RFQs sent" value={rfqs.length} />
        <StatCard label="Suppliers contacted" value={suppliersContacted} />
        <StatCard label="Unread messages" value={unread} />
      </div>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent RFQs</h2>
          <Link to="/dashboard/buyer/rfqs" className="text-sm font-medium text-brand-700 underline">
            View all
          </Link>
        </div>
        {rfqs.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No RFQs yet. <Link to="/dashboard/buyer/rfqs/new" className="text-brand-700 underline">Create your first one</Link>.
          </p>
        ) : (
          <div className="divide-y divide-white/40">
            {rfqs.slice(0, 5).map((r) => (
              <Link
                key={r.id}
                to={`/dashboard/buyer/rfqs/${r.id}`}
                className="flex items-center justify-between gap-4 py-3 row-hover"
              >
                <div>
                  <p className="font-medium text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-500">
                    {r.supplier?.companyName || 'Broadcast'} · {r.quantity} {r.unit} ·{' '}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge>{r.status}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
