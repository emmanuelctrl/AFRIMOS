const STYLES = {
  verified: 'bg-brand-100 text-brand-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-700',
  Sent: 'bg-blue-100 text-blue-800',
  Responded: 'bg-brand-100 text-brand-800',
  Negotiating: 'bg-purple-100 text-purple-800',
  Closed: 'bg-gray-200/80 text-gray-700',
  Draft: 'bg-white/60 text-gray-600 border border-white/50',
  gray: 'bg-white/60 text-gray-700 border border-white/50',
};

export default function Badge({ children, tone }) {
  const style = STYLES[tone] || STYLES[children] || STYLES.gray;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {children}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      Verified Exporter
    </span>
  );
}
