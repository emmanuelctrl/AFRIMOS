import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

const STATUSES = ['Sent', 'Responded', 'Negotiating', 'Closed'];

export default function RfqList({ base }) {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ rfqs: [], total: 0, limit: 20 });
  const [loading, setLoading] = useState(true);

  const page = parseInt(params.get('page')) || 1;
  const status = params.get('status') || '';

  useEffect(() => {
    setLoading(true);
    api
      .get('/rfqs', { params: { page, ...(status ? { status } : {}) } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [page, status]);

  const isSupplier = user.role === 'supplier';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {isSupplier ? 'Incoming inquiries' : 'My RFQs'}
        </h1>
        {!isSupplier && (
          <Link to="/dashboard/buyer/rfqs/new" className="btn-primary">
            + Create RFQ
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {['', ...STATUSES].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => {
              const next = new URLSearchParams(params);
              if (s) next.set('status', s);
              else next.delete('status');
              next.delete('page');
              setParams(next);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              status === s ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20' : 'border border-white/50 bg-white/50 text-gray-700 backdrop-blur-sm hover:bg-white/70'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : data.rfqs.length === 0 ? (
        <div className="card py-16 text-center text-gray-500">
          {isSupplier
            ? 'No inquiries yet. Complete your profile and add products to attract buyers.'
            : 'No RFQs yet. Create one to start sourcing.'}
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="thead-glass">
              <tr>
                <th className="px-6 py-3">{isSupplier ? 'Buyer' : 'Supplier'}</th>
                <th className="px-6 py-3">Request</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Messages</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {data.rfqs.map((r) => (
                <tr key={r.id} className="row-hover">
                  <td className="px-6 py-3 text-gray-700">
                    {isSupplier ? r.buyer.fullName : r.supplier?.companyName || 'Broadcast'}
                  </td>
                  <td className="px-6 py-3">
                    <Link to={`${base}/${r.id}`} className="font-medium text-brand-700 hover:underline">
                      {r.title}
                    </Link>
                    <p className="text-xs text-gray-500">{r.productCategory}</p>
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {r.quantity} {r.unit}
                  </td>
                  <td className="px-6 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-gray-700">{r._count.messages}</td>
                  <td className="px-6 py-3">
                    <Badge>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        page={page}
        total={data.total}
        limit={data.limit}
        onPage={(p) => {
          const next = new URLSearchParams(params);
          next.set('page', String(p));
          setParams(next);
        }}
      />
    </div>
  );
}
