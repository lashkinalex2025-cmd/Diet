import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, WifiOff } from 'lucide-react';
import { SearchForm } from '@/features/food-search/SearchForm';
import { SearchResults } from '@/features/food-search/SearchResults';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { searchFoods } from '@/services/food/foodService';
import { useHistoryActions } from '@/hooks/useHistory';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { FoodApiError } from '@/types/food';
import { QUERY_GC_TIME_MS, QUERY_STALE_TIME_MS } from '@/constants';

export function HomePage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const online = useOnlineStatus();
  const { add } = useHistoryActions();

  const search = useQuery({
    queryKey: ['food-search', submitted],
    queryFn: () => searchFoods(submitted),
    enabled: submitted.length >= 2,
    staleTime: QUERY_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
    retry: (count, error) => {
      if (error instanceof FoodApiError && error.code === 'invalid_query') return false;
      return count < 2;
    },
  });

  const onSearch = useCallback(
    (q: string) => {
      setQuery(q);
      setSubmitted(q);
      add.mutate({ query: q });
    },
    [add],
  );

  const error = search.error;
  const isNetworkError =
    error instanceof FoodApiError &&
    (error.code === 'network' || error.code === 'timeout');

  return (
    <div className="page space-y-6">
      <SearchForm defaultQuery={query} isLoading={search.isFetching} onSearch={onSearch} />

      {!online && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            Нет подключения к интернету. Поиск новых продуктов недоступен — можно открыть
            избранное и историю.
          </p>
        </div>
      )}

      {!submitted && !search.isFetching && (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Введите название продукта, чтобы узнать его КБЖУ"
          description="Например: яблоко, банан, куриная грудка, рис, овсянка, творог, яйцо, хлеб"
        />
      )}

      {search.isFetching && <LoadingSkeleton />}

      {search.isError && !search.isFetching && (
        <EmptyState
          title={
            isNetworkError
              ? 'Не удалось подключиться к базе продуктов'
              : error instanceof FoodApiError
                ? error.message
                : 'Произошла ошибка'
          }
          description={
            isNetworkError
              ? 'Проверьте соединение и попробуйте снова.'
              : 'Измените запрос или повторите попытку.'
          }
          action={
            <button type="button" className="btn-primary" onClick={() => search.refetch()}>
              Повторить
            </button>
          }
        />
      )}

      {search.isSuccess && !search.isFetching && search.data.items.length === 0 && (
        <EmptyState
          title="Продукт не найден"
          description="Попробуйте изменить запрос: другое название, бренд или язык."
        />
      )}

      {search.isSuccess && !search.isFetching && search.data.items.length > 0 && (
        <>
          {search.data.source.includes('кеш') && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Нет подключения к интернету. Показываем сохранённые данные.
            </p>
          )}
          <SearchResults items={search.data.items} query={search.data.query} />
        </>
      )}
    </div>
  );
}
