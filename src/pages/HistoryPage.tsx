import { Link } from 'react-router-dom';
import { Clock, Trash2 } from 'lucide-react';
import { useHistoryActions, useHistoryList } from '@/hooks/useHistory';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export function HistoryPage() {
  const { data, isLoading } = useHistoryList();
  const { clear } = useHistoryActions();

  return (
    <div className="page space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">История</h2>
        {!!data?.length && (
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => {
              if (confirm('Очистить историю?')) clear.mutate();
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Очистить историю
          </button>
        )}
      </div>

      {isLoading && <LoadingSkeleton label="Загружаем историю…" />}

      {!isLoading && (!data || data.length === 0) && (
        <EmptyState
          icon={<Clock className="h-6 w-6" />}
          title="История пуста"
          description="Здесь появятся ваши поисковые запросы и выбранные продукты."
        />
      )}

      <ul className="space-y-2">
        {data?.map((item) => {
          const to = item.food
            ? `/food/${encodeURIComponent(item.food.id)}`
            : `/?q=${encodeURIComponent(item.query)}`;
          return (
            <li key={item.id}>
              <Link
                to={to}
                state={item.food ? { food: item.food } : undefined}
                className="card block transition hover:border-brand-300 dark:hover:border-brand-700"
              >
                <p className="font-medium">{item.foodName || item.query}</p>
                <p className="text-xs text-slate-500">
                  {item.foodName ? `Запрос: ${item.query} · ` : ''}
                  {new Date(item.createdAt).toLocaleString('ru-RU')}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
