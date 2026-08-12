import { NavLink, Outlet } from 'react-router-dom';
import { Heart, History, Home, Settings } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/utils/cn';

const nav: Array<{
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}> = [
  { to: '/', label: 'Главная', icon: Home, end: true },
  { to: '/history', label: 'История', icon: History },
  { to: '/favorites', label: 'Избранное', icon: Heart },
  { to: '/settings', label: 'Настройки', icon: Settings },
];

export function Layout() {
  const online = useOnlineStatus();

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="safe-top sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-brand-700 dark:text-brand-400">
              Diet
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Узнай КБЖУ любого продукта
            </p>
          </div>
          {!online && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              Офлайн
            </span>
          )}
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl gap-6 lg:px-6">
        <aside className="hidden w-52 shrink-0 py-6 lg:block">
          <nav className="sticky top-24 space-y-1">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-touch items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900',
                  )
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden"
        aria-label="Основная навигация"
      >
        <ul className="mx-auto grid max-w-content grid-cols-4">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-500 dark:text-slate-400',
                  )
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
