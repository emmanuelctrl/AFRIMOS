import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';

export default function AdminUsers() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState(params.get('search') || '');

  const page = parseInt(params.get('page')) || 1;
  const role = params.get('role') || '';

  useEffect(() => {
    api
      .get('/admin/users', {
        params: { page, ...(role ? { role } : {}), ...(params.get('search') ? { search: params.get('search') } : {}) },
      })
      .then(({ data }) => setData(data));
  }, [page, role, params]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  if (!data) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>

      <div className="flex flex-wrap items-center gap-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setParam('search', search);
          }}
        >
          <input
            className="input w-64"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-secondary">Search</button>
        </form>
        <select className="input w-40" value={role} onChange={(e) => setParam('role', e.target.value)}>
          <option value="">All roles</option>
          <option value="supplier">Suppliers</option>
          <option value="buyer">Buyers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">{u.fullName}</td>
                <td className="px-6 py-3 text-gray-600">{u.email}</td>
                <td className="px-6 py-3 capitalize text-gray-600">{u.role}</td>
                <td className="px-6 py-3 text-gray-600">{u.supplierProfile?.companyName || '—'}</td>
                <td className="px-6 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-3">
                  {u.role === 'supplier' ? (
                    <Badge tone={u.verificationStatus}>{u.verificationStatus}</Badge>
                  ) : (
                    <Badge tone={u.emailVerified ? 'verified' : 'pending'}>
                      {u.emailVerified ? 'email verified' : 'unverified'}
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={data.total} limit={data.limit} onPage={(p) => setParam('page', String(p))} />
    </div>
  );
}
