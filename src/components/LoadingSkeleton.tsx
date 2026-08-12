export function LoadingSkeleton({ label = 'Ищем продукт…' }: { label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite" aria-busy="true">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card animate-pulse space-y-3">
          <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="flex gap-2">
            <div className="h-8 flex-1 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-8 flex-1 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-8 flex-1 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-8 flex-1 rounded-lg bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
