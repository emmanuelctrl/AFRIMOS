import { Link } from 'react-router-dom';
import { VerifiedBadge } from './Badge';

export default function SupplierCard({ supplier }) {
  return (
    <Link
      to={`/suppliers/${supplier.id}`}
      className="card card-hover flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {supplier.logoBanner ? (
            <img
              src={supplier.logoBanner}
              alt=""
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-brand-500/15 text-lg font-bold text-brand-400">
              {supplier.companyName?.[0] || '?'}
            </div>
          )}
          <div>
            <p className="font-semibold text-white">{supplier.companyName}</p>
            <p className="text-sm text-gray-400">
              {[supplier.city, supplier.country].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>
        {supplier.rating > 0 && (
          <span className="flex items-center gap-1 text-sm font-medium text-amber-300">
            ★ {supplier.rating.toFixed(1)}
          </span>
        )}
      </div>
      {supplier.description && (
        <p className="line-clamp-2 text-sm text-gray-300">{supplier.description}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {(supplier.products || []).slice(0, 4).map((p) => (
          <span key={p.id} className="chip">
            {p.name}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between pt-1">
        <VerifiedBadge />
        {supplier.shippingTerms && (
          <span className="text-xs font-medium text-gray-400">{supplier.shippingTerms}</span>
        )}
      </div>
    </Link>
  );
}
