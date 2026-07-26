import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { apiError } from '../../api/client';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';

const ROLE_LABEL = { supplier: 'Exporter', buyer: 'Buyer' };

function ReviewModal({ account, onClose, onDecided }) {
  const [notes, setNotes] = useState(account.verificationNotes || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const p = account.supplierProfile;
  const isSupplier = account.role === 'supplier';

  const decide = async (verificationStatus) => {
    setBusy(true);
    setError('');
    try {
      await api.put(`/admin/accounts/${account.id}/verify`, { verificationStatus, notes });
      onDecided();
    } catch (err) {
      setError(apiError(err, 'Could not update this account'));
      setBusy(false);
    }
  };

  // A buyer has no company profile to inspect, so the rows differ by role —
  // showing a supplier's empty registration fields for a buyer would read as
  // missing data rather than data that never applied.
  const rows = isSupplier
    ? [
        ['Company', p?.companyName],
        ['Contact', account.fullName],
        ['Email', account.email],
        ['Email verified', account.emailVerified ? 'Yes' : 'No'],
        ['Registration #', p?.registrationNumber || '—'],
        ['Location', [p?.address, p?.city, p?.country].filter(Boolean).join(', ') || '—'],
        ['Phone', p?.phone || '—'],
        ['Website', p?.website || '—'],
        ['Certifications', p?.certifications?.join(', ') || '—'],
        ['Products listed', p?._count?.products ?? 0],
        ['Applied', new Date(account.createdAt).toLocaleDateString()],
      ]
    : [
        ['Name', account.fullName],
        ['Email', account.email],
        ['Email verified', account.emailVerified ? 'Yes' : 'No'],
        ['Account type', account.userType === 'company' ? 'Company' : 'Individual'],
        ['RFQs sent', account._count?.rfqsSent ?? 0],
        ['Applied', new Date(account.createdAt).toLocaleDateString()],
      ];

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-base-800/95 p-6 shadow-glass-lg backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Review {ROLE_LABEL[account.role]?.toLowerCase() || 'account'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200" aria-label="Close">
            ✕
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <dl className="space-y-2 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-gray-400">{k}</dt>
              <dd className="text-right font-medium text-white">{v}</dd>
            </div>
          ))}
        </dl>

        {isSupplier && p?.description && (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-gray-200">
            {p.description}
          </p>
        )}

        {!isSupplier && (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-gray-300">
            Approving this buyer lets them see exporter contact details, pricing and terms.
          </p>
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

/**
 * One review queue for every account that needs approving. Suppliers and buyers
 * are filters over the same list rather than separate screens, because the
 * decision — and its consequence, reaching real marketplace data — is the same.
 */
export default function AdminAccounts() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);

  const page = parseInt(params.get('page')) || 1;
  const status = params.get('status') || '';
  const role = params.get('role') || '';

  const load = useCallback(() => {
    api
      .get('/admin/accounts', {
        params: { page, ...(status ? { status } : {}), ...(role ? { role } : {}) },
      })
      .then(({ data }) => setData(data));
  }, [page, status, role]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  if (!data) return <Spinner />;

  const filterButton = (key, value, label, active) => (
    <button
      key={`${key}-${value || 'all'}`}
      onClick={() => setFilter(key, value)}
      className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
        active
          ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20'
          : 'border border-white/10 bg-white/5 text-gray-200 backdrop-blur-sm hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Account verification</h1>

      <div className="flex flex-wrap gap-2">
        {[
          ['', 'All accounts'],
          ['supplier', 'Exporters'],
          ['buyer', 'Buyers'],
        ].map(([value, label]) => filterButton('role', value, label, role === value))}
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'pending', 'verified', 'rejected'].map((s) =>
          filterButton('status', s, s || 'All', status === s)
        )}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="thead-glass">
            <tr>
              <th className="px-6 py-3">Account</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Applied</th>
              <th className="px-6 py-3">Activity</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {data.accounts.map((a) => (
              <tr key={a.id} className="row-hover">
                <td className="px-6 py-3 font-medium text-white">
                  {a.role === 'supplier' ? a.supplierProfile?.companyName || a.fullName : a.fullName}
                  <p className="text-xs font-normal text-gray-400">{a.email}</p>
                </td>
                <td className="px-6 py-3 text-gray-300">{ROLE_LABEL[a.role] || a.role}</td>
                <td className="px-6 py-3 text-gray-400">
                  {new Date(a.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3 text-gray-300">
                  {a.role === 'supplier'
                    ? `${a.supplierProfile?._count?.products ?? 0} products`
                    : `${a._count?.rfqsSent ?? 0} RFQs`}
                </td>
                <td className="px-6 py-3">
                  <Badge tone={a.verificationStatus}>{a.verificationStatus}</Badge>
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    className="text-sm font-medium text-brand-400 hover:underline"
                    onClick={() => setSelected(a)}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {data.accounts.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                  No accounts match these filters.
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
          account={selected}
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
