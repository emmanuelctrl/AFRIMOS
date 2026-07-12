import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import SupplierCard from '../components/SupplierCard';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';

export const CATEGORIES = ['Coffee', 'Pulses', 'Oilseeds', 'Sesame', 'Spices', 'Fruits'];
export const CERTIFICATIONS = ['ISO', 'Organic', 'Fair Trade', 'HACCP', 'Rainforest Alliance'];
const TERMS = ['FOB', 'CIF', 'DDP'];

export default function SuppliersDirectory() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ suppliers: [], total: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get('search') || '');

  const page = parseInt(params.get('page')) || 1;

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/suppliers', { params: Object.fromEntries(params) })
      .then(({ data }) => !cancelled && setData(data))
      .catch(() => !cancelled && setData({ suppliers: [], total: 0, limit: 20 }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params]);

  const Select = ({ label, param, options }) => (
    <div>
      <label className="label">{label}</label>
      <select
        className="input"
        value={params.get(param) || ''}
        onChange={(e) => setParam(param, e.target.value)}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Supplier directory</h1>
      <p className="mt-1 text-gray-600">
        {data.total} verified Ethiopian exporter{data.total === 1 ? '' : 's'}
      </p>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="card space-y-4 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setParam('search', search);
              }}
            >
              <label className="label">Search</label>
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="Company or product…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn-primary shrink-0">Go</button>
              </div>
            </form>
            <Select label="Product category" param="category" options={CATEGORIES} />
            <Select label="Certification" param="certification" options={CERTIFICATIONS} />
            <Select label="Shipping terms" param="shippingTerms" options={TERMS} />
            <div>
              <label className="label">Sort by</label>
              <select
                className="input"
                value={params.get('sort') || ''}
                onChange={(e) => setParam('sort', e.target.value)}
              >
                <option value="">Rating</option>
                <option value="newest">Newest</option>
                <option value="inquiries">Most inquiries</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <Spinner />
          ) : data.suppliers.length === 0 ? (
            <div className="card py-16 text-center text-gray-500">
              No suppliers match your filters yet. Try clearing some filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.suppliers.map((s) => (
                <SupplierCard key={s.id} supplier={s} />
              ))}
            </div>
          )}
          <Pagination
            page={page}
            total={data.total}
            limit={data.limit}
            onPage={(p) => setParam('page', String(p))}
          />
        </div>
      </div>
    </div>
  );
}
