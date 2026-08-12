import { Link } from 'react-router-dom';
import type { Food } from '@/types/food';
import { formatNutrient } from '@/utils/nutrition';
import { ChevronRight } from 'lucide-react';

interface SearchResultsProps {
  items: Food[];
  query: string;
}

export function SearchResults({ items, query }: SearchResultsProps) {
  if (items.length === 0) return null;

  return (
    <section aria-label="Результаты поиска" className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Найдено: {items.length}
        <span className="ml-1 font-normal text-slate-500">по запросу «{query}»</span>
      </h2>
      <ul className="space-y-2">
        {items.map((food) => (
          <li key={food.id}>
            <Link
              to={`/food/${encodeURIComponent(food.id)}`}
              state={{ food }}
              className="card flex items-center gap-3 transition hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700"
            >
              {food.imageUrl ? (
                <img
                  src={food.imageUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {food.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                  {food.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {[food.brand, food.category].filter(Boolean).join(' · ') || food.source}
                </p>
                <p className="mt-1 text-xs font-medium text-brand-700 dark:text-brand-400">
                  {formatNutrient(food.calories, 'ккал')} / 100 г
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
