import { APP_AUTHOR, APP_NAME, APP_RIGHTS, APP_YEAR } from '@/constants';

export function AppFooter() {
  return (
    <footer className="mt-auto px-4 pb-[5.75rem] pt-3 text-center lg:pb-6">
      <p className="text-xs font-semibold tracking-tight text-slate-500 dark:text-slate-400">
        {APP_NAME}
      </p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
        Разработчик: {APP_AUTHOR}
        <span className="mx-1.5 text-slate-300 dark:text-slate-600" aria-hidden>
          ·
        </span>
        {APP_YEAR}
      </p>
      <p className="text-[11px] text-slate-400 dark:text-slate-500">{APP_RIGHTS}.</p>
    </footer>
  );
}
