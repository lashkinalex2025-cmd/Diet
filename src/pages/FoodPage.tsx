import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { FoodCard } from '@/features/food-details/FoodCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { getFoodById } from '@/services/food/foodService';
import { useHistoryActions } from '@/hooks/useHistory';
import type { Food } from '@/types/food';

export function FoodPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const stateFood = (location.state as { food?: Food } | null)?.food;
  const { add } = useHistoryActions();

  const query = useQuery({
    queryKey: ['food', id],
    queryFn: async () => {
      if (stateFood && stateFood.id === id) return stateFood;
      return getFoodById(id);
    },
    enabled: !!id,
    initialData: stateFood && stateFood.id === id ? stateFood : undefined,
  });

  useEffect(() => {
    if (query.data) {
      add.mutate({ query: query.data.name, food: query.data });
    }
    // only when food id resolves
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data?.id]);

  return (
    <div className="page space-y-4">
      <Link
        to="/"
        className="inline-flex min-h-touch items-center gap-1 text-sm font-medium text-brand-700 dark:text-brand-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Назад к поиску
      </Link>

      {query.isLoading && <LoadingSkeleton label="Загружаем продукт…" />}

      {query.isError && (
        <EmptyState
          title="Не удалось загрузить продукт"
          action={
            <button type="button" className="btn-primary" onClick={() => query.refetch()}>
              Повторить
            </button>
          }
        />
      )}

      {query.isSuccess && !query.data && (
        <EmptyState
          title="Продукт не найден"
          description="Возможно, данные недоступны офлайн. Подключитесь к интернету и повторите поиск."
        />
      )}

      {query.data && <FoodCard food={query.data} />}
    </div>
  );
}
