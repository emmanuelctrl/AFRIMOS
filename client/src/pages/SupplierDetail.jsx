import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import Spinner from '../components/Spinner';
import { VerifiedBadge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';

export default function SupplierDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/suppliers/${id}`)
      .then(({ data }) => setSupplier(data.supplier))
      .catch(() => setError('Supplier not found'));
  }, [id]);

  if (error) return <div className="py-20 text-center text-gray-400">{error}</div>;
  if (!supplier) return <Spinner />;

  const sendInquiry = () => {
    if (!user) return navigate('/login', { state: { from: `/suppliers/${id}` } });
    navigate(`/dashboard/buyer/rfqs/new?supplierId=${supplier.id}&supplierName=${encodeURIComponent(supplier.companyName)}`);
  };

  const avgRating = supplier.reviews.length
    ? supplier.reviews.reduce((s, r) => s + r.rating, 0) / supplier.reviews.length
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {supplier.logoBanner ? (
            <img src={supplier.logoBanner} alt="" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-500/20 text-2xl font-bold text-brand-400">
              {supplier.companyName[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{supplier.companyName}</h1>
            <p className="text-sm text-gray-400">
              {[supplier.city, supplier.country].filter(Boolean).join(', ')}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {supplier.user.verificationStatus === 'verified' && <VerifiedBadge />}
              {supplier.certifications.map((c) => (
                <span key={c} className="chip">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
        {(!user || user.role === 'buyer') && (
          <button className="btn-primary px-6 py-3" onClick={sendInquiry}>
            Send Inquiry
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* About */}
          <section className="card">
            <h2 className="mb-3 text-lg font-semibold text-white">About</h2>
            <p className="whitespace-pre-line text-sm text-gray-200">
              {supplier.description || 'No description provided yet.'}
            </p>
          </section>

          {/* Products */}
          <section className="card">
            <h2 className="mb-3 text-lg font-semibold text-white">
              Products ({supplier.products.length})
            </h2>
            {supplier.products.length === 0 ? (
              <p className="text-sm text-gray-400">No products listed yet.</p>
            ) : (
              <div className="divide-y divide-white/10">
                {supplier.products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-medium text-white">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.category} · {p.quality} · MOQ {p.minimumOrderQuantity} {p.unit}
                        {p.origin ? ` · Origin: ${p.origin}` : ''}
                      </p>
                    </div>
                    <p className="whitespace-nowrap font-semibold text-brand-400">
                      ${p.pricePerUnit.toLocaleString()} / {p.unit}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Reviews */}
          <section className="card">
            <h2 className="mb-3 text-lg font-semibold text-white">
              Reviews {supplier.reviews.length > 0 && `· ★ ${avgRating.toFixed(1)}`}
            </h2>
            {supplier.reviews.length === 0 ? (
              <p className="text-sm text-gray-400">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {supplier.reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-medium text-amber-300">{'★'.repeat(r.rating)}</p>
                    {r.comment && <p className="mt-1 text-sm text-gray-200">{r.comment}</p>}
                    <p className="mt-2 text-xs text-gray-400">
                      {r.fromUser.fullName} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar facts */}
        <aside className="space-y-6">
          <div className="card text-sm">
            <h2 className="mb-3 text-lg font-semibold text-white">Trade details</h2>
            <dl className="space-y-2">
              {[
                ['Shipping terms', supplier.shippingTerms],
                ['Lead time', supplier.leadTime ? `${supplier.leadTime} days` : null],
                ['Min. order', supplier.minimumOrderQuantity],
                ['Phone', supplier.phone],
                [
                  'Website',
                  supplier.website && (
                    <a href={supplier.website} className="text-brand-400 underline" target="_blank" rel="noreferrer">
                      {supplier.website.replace(/^https?:\/\//, '')}
                    </a>
                  ),
                ],
                ['Member since', new Date(supplier.user.createdAt).toLocaleDateString()],
                ['Inquiries received', supplier.totalInquiries],
              ]
                .filter(([, v]) => v !== null && v !== undefined && v !== '')
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-gray-400">{k}</dt>
                    <dd className="text-right font-medium text-white">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
          <Link to="/suppliers" className="btn-secondary w-full">
            ← Back to directory
          </Link>
        </aside>
      </div>
    </div>
  );
}
