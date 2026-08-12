import { Download, Info, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useHistoryActions } from '@/hooks/useHistory';
import { useFavoriteActions } from '@/hooks/useFavorites';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { clearSearchCache } from '@/services/food/foodService';
import {
  APP_AUTHOR,
  APP_NAME,
  APP_RIGHTS,
  APP_VERSION,
  APP_YEAR,
  DATA_SOURCE_LABEL,
  DISCLAIMER,
} from '@/constants';
import type { ThemeMode } from '@/types/food';
import { cn } from '@/utils/cn';

const themes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Светлая тема', icon: Sun },
  { id: 'dark', label: 'Тёмная тема', icon: Moon },
  { id: 'system', label: 'Системная тема', icon: Monitor },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { clear: clearHistory } = useHistoryActions();
  const { clear: clearFavorites } = useFavoriteActions();
  const { canInstall, promptInstall, installed } = useInstallPrompt();

  return (
    <div className="page space-y-6">
      <h2 className="text-lg font-bold">Настройки</h2>

      <section className="card space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Тема</h3>
        <div className="grid gap-2">
          {themes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTheme(id)}
              className={cn(
                'flex min-h-touch items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm font-medium transition',
                theme === id
                  ? 'border-brand-600 bg-brand-50 text-brand-900 dark:border-brand-500 dark:bg-brand-950 dark:text-brand-100'
                  : 'border-slate-200 dark:border-slate-700',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Данные
        </h3>
        <p className="text-sm text-slate-500">
          Единицы измерения: граммы (г), килокалории (ккал) на 100 г продукта.
        </p>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => {
            if (confirm('Очистить историю поиска?')) clearHistory.mutate();
          }}
        >
          Очистить историю
        </button>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => {
            if (confirm('Очистить избранное?')) clearFavorites.mutate();
          }}
        >
          Очистить избранное
        </button>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={async () => {
            if (confirm('Очистить кеш поиска?')) {
              await clearSearchCache();
              alert('Кеш очищен');
            }
          }}
        >
          Очистить кеш
        </button>
      </section>

      {(canInstall || installed) && (
        <section className="card space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Установка
          </h3>
          {installed ? (
            <p className="text-sm text-slate-500">Приложение уже установлено.</p>
          ) : (
            <button type="button" className="btn-primary w-full" onClick={() => promptInstall()}>
              <Download className="h-4 w-4" aria-hidden />
              Установить приложение
            </button>
          )}
        </section>
      )}

      <section className="card space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Info className="h-4 w-4" aria-hidden />
          О приложении
        </h3>
        <p className="text-sm">
          <span className="font-medium">{APP_NAME}</span> · версия {APP_VERSION}
        </p>
        <p className="text-sm text-slate-500">
          Разработчик: {APP_AUTHOR}
        </p>
        <p className="text-sm text-slate-500">Год разработки: {APP_YEAR}</p>
        <p className="text-sm text-slate-500">{APP_RIGHTS}.</p>
        <p className="text-sm text-slate-500">
          Источник данных: {DATA_SOURCE_LABEL}
          {import.meta.env.VITE_FOOD_PROVIDER === 'usda' ? ' / USDA' : ''}
        </p>
        <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">
          {DISCLAIMER}
        </p>
      </section>
    </div>
  );
}
