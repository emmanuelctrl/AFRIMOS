import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { apiError } from '../../api/client';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';

function ReviewModal({ supplier, onClose, onDecided }) {
  const [notes, setNotes] = useState(supplier.verificationNotes || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const p = supplier.supplierProfile;

  const decide = async (verificationStatus) => {
    setBusy(true);
    setError('');
    try {
      await api.put(`/admin/suppliers/${supplier.id}/verify`, { verificationStatus, notes });
      onDecided();
    } catch (err) {
      setError(apiError(err, 'Could not update supplier'));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/50 bg-white/80 p-6 shadow-glass-lg backdrop-blur-md sm:backdrop-blur-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Review supplier</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">
            ✕
          </button>
        </div>
        {error && <p className="mb-3 rounded-lg border border-red-200/60 bg-red-50/80 px-4 py-2 text-sm text-red-700">{error}</p>}
        <dl className="space-y-2 text-sm">
          {[
            ['Company', p?.companyName],
            ['Contact', supplier.fullName],
            ['Email', supplier.email],
            ['Email verified', supplier.emailVerified ? 'Yes' : 'No'],
            ['Registration #', p?.registrationNumber || '—'],
            ['Location', [p?.address, p?.city, p?.country].filter(Boolean).join(', ') || '—'],
            ['Phone', p?.phone || '—'],
            ['Website', p?.website || '—'],
            ['Certifications', p?.certifications?.join(', ') || '—'],
            ['Products listed', p?._count?.products ?? 0],
            ['Applied', new Date(supplier.createdAt).toLocaleDateString()],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-gray-500">{k}</dt>
              <dd className="text-right font-medium text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
        {p?.description && (
          <p className="mt-4 rounded-xl border border-white/40 bg-white/40 p-3 text-sm text-gray-700">{p.description}</p>
        )}
        <div className="mt-4">
          <label className="label">Verification notes</label>
          <textarea className="input" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button className="btn-danger" disabled={busy} onClick={() => decide('rejected')}>
            Reject
          </button>
          <button className="btn-primary" disabled={busy} onClick={() => decide('verified')}>
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSuppliers() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);

  const page = parseInt(params.get('page')) || 1;
  const status = params.get('status') || '';

  const load = useCallback(() => {
    api
      .get('/admin/suppliers', { params: { page, ...(status ? { status } : {}) } })
      .then(({ data }) => setData(data));
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Supplier verification</h1>

      <div className="flex gap-2">
        {['', 'pending', 'verified', 'rejected'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => {
              const next = new URLSearchParams(params);
              if (s) next.set('status', s);
              else next.delete('status');
              next.delete('page');
              setParams(next);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
              status === s ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20' : 'border border-white/50 bg-white/50 text-gray-700 backdrop-blur-sm hover:bg-white/70'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="thead-glass">
            <tr>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Applied</th>
              <th className="px-6 py-3">Products</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40">
            {data.suppliers.map((s) => (
              <tr key={s.id} className="row-hover">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {s.supplierProfile?.companyName || '—'}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {s.fullName}
                  <p className="text-xs text-gray-400">{s.email}</p>
                </td>
                <td className="px-6 py-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-gray-600">{s.supplierProfile?._count?.products ?? 0}</td>
                <td className="px-6 py-3">
                  <Badge tone={s.verificationStatus}>{s.verificationStatus}</Badge>
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    className="text-sm font-medium text-brand-700 hover:underline"
                    onClick={() => setSelected(s)}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {data.suppliers.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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

      {selected && (
        <ReviewModal
          supplier={selected}
          onClose={() => setSelected(null)}
          onDecided={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}
