/**
 * Skeleton shown while a lazily-loaded route chunk is in flight.
 * Kept dependency-free so it lives in the entry chunk.
 */
export default function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-900" role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="w-full max-w-3xl space-y-4 px-6">
        <div className="h-10 w-1/3 animate-pulse rounded-xl bg-white/5" />
        <div className="h-4 w-2/3 animate-pulse rounded-lg bg-white/5" />
        <div className="grid gap-4 pt-6 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
