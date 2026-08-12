import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useFavoriteActions, useFavoritesList } from '@/hooks/useFavorites';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { formatNutrient } from '@/utils/nutrition';

export function FavoritesPage() {
  const { data, isLoading } = useFavoritesList();
  const { clear, toggle } = useFavoriteActions();

  return (
    <div className="page space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Избранное</h2>
        {!!data?.length && (
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => {
              if (confirm('Очистить избранное?')) clear.mutate();
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Очистить
          </button>
        )}
      </div>

      {isLoading && <LoadingSkeleton label="Загружаем избранное…" />}

      {!isLoading && (!data || data.length === 0) && (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="Пока пусто"
          description="Добавляйте продукты в избранное кнопкой ♥ на карточке — они будут доступны офлайн."
        />
      )}

      <ul className="space-y-2">
        {data?.map((food) => (
          <li key={food.id} className="card flex items-center gap-3">
            <Link
              to={`/food/${encodeURIComponent(food.id)}`}
              state={{ food }}
              className="min-w-0 flex-1"
            >
              <p className="truncate font-medium">{food.name}</p>
              <p className="text-xs text-slate-500">
                {formatNutrient(food.calories, 'ккал')} / 100 г
              </p>
            </Link>
            <button
              type="button"
              className="btn-ghost !px-2"
              aria-label="Убрать из избранного"
              onClick={() => toggle.mutate({ food, favorite: true })}
            >
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
