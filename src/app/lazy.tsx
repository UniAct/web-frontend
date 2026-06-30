import { lazy, type ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

export function lazyNamed<T extends ComponentType<any>>(
  loader: () => Promise<Record<string, unknown>>,
  exportName: string,
) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[exportName] as T };
  });
}

export function RouteLoadingFallback({ label = 'Loading workspace' }: { label?: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-4">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
        <Loader2 className="size-4 animate-spin text-[var(--primary)]" />
        <span>{label}</span>
      </div>
    </div>
  );
}

