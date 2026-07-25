import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/suppliers/me/analytics').catch(() => ({ data: null })),
      api.get('/rfqs', { params: { limit: 5 } }).catch(() => ({ data: { rfqs: [] } })),
    ])
      .then(([a, r]) => {
        setAnalytics(a.data);
        setRfqs(r.data.rfqs);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome, {user.fullName}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-300">
            Verification status: <Badge tone={user.verificationStatus}>{user.verificationStatus}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/supplier/products" className="btn-primary">
            + Add Product
          </Link>
          <Link to="/dashboard/supplier/profile" className="btn-secondary">
            Edit Profile
          </Link>
        </div>
      </div>

      {user.verificationStatus === 'pending' && (
        <p className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 backdrop-blur-sm text-sm text-amber-300">
          Your profile is under review. You'll appear in the public directory and receive
          inquiries once our team verifies your company.
        </p>
      )}
      {user.verificationStatus === 'rejected' && (
        <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 backdrop-blur-sm text-sm text-red-300">
          Your profile was rejected. Contact admin@afrimos.et for details.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total inquiries" value={analytics?.totalInquiries ?? 0} />
        <StatCard label="Response rate" value={`${analytics?.responseRate ?? 0}%`} />
        <StatCard label="Products listed" value={analytics?.productCount ?? 0} />
        <StatCard
          label="Profile completeness"
          value={`${analytics?.completeness ?? 0}%`}
          hint={analytics?.completeness < 100 ? 'Complete your profile to rank higher' : 'Great job!'}
        />
      </div>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent inquiries</h2>
          <Link to="/dashboard/supplier/rfqs" className="text-sm font-medium text-brand-400 underline">
            View all
          </Link>
        </div>
        {rfqs.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            No inquiries yet. Make sure your profile is complete and products are listed.
          </p>
        ) : (
          <div className="divide-y divide-white/10">
            {rfqs.map((r) => (
              <Link
                key={r.id}
                to={`/dashboard/supplier/rfqs/${r.id}`}
                className="flex items-center justify-between gap-4 py-3 row-hover"
              >
                <div>
                  <p className="font-medium text-white">{r.title}</p>
                  <p className="text-xs text-gray-400">
                    {r.buyer.fullName} · {r.quantity} {r.unit} · {new Date(r.createdAt).toLocaleDateString()}
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
