import { useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import type { Food } from '@/types/food';
import { DEFAULT_PORTION_GRAMS, DISCLAIMER, PORTION_PRESETS, SOURCE_NOTE } from '@/constants';
import { formatNutrient, scaleFoodNutrition } from '@/utils/nutrition';
import { cn } from '@/utils/cn';
import { useFavoriteActions, useIsFavorite } from '@/hooks/useFavorites';

interface FoodCardProps {
  food: Food;
}

export function FoodCard({ food }: FoodCardProps) {
  const [grams, setGrams] = useState(DEFAULT_PORTION_GRAMS);
  const { data: favorite } = useIsFavorite(food.id);
  const { toggle } = useFavoriteActions();

  const scaled = useMemo(() => scaleFoodNutrition(food, grams), [food, grams]);

  const rows = [
    { label: 'Калории', value: formatNutrient(scaled.calories, 'ккал') },
    { label: 'Белки', value: formatNutrient(scaled.protein, 'г') },
    { label: 'Жиры', value: formatNutrient(scaled.fat, 'г') },
    { label: 'Углеводы', value: formatNutrient(scaled.carbohydrates, 'г') },
  ];

  return (
    <article className="card space-y-5">
      <div className="flex items-start gap-3">
        {food.imageUrl ? (
          <img
            src={food.imageUrl}
            alt=""
            className="h-20 w-20 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold leading-snug text-slate-900 dark:text-slate-50">
              {food.name}
            </h2>
            <button
              type="button"
              className="btn-ghost shrink-0 !px-2"
              aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
              onClick={() => toggle.mutate({ food, favorite: !!favorite })}
            >
              <Heart
                className={cn(
                  'h-6 w-6',
                  favorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-slate-400 dark:text-slate-500',
                )}
              />
            </button>
          </div>
          <div className="mt-1 space-y-0.5 text-sm text-slate-500 dark:text-slate-400">
            {food.brand && <p>Бренд: {food.brand}</p>}
            {food.category && <p>Категория: {food.category}</p>}
            <p>Источник: {food.source}</p>
            {food.servingSize != null && (
              <p>
                Порция на упаковке: {food.servingSize}
                {food.servingUnit ? ` ${food.servingUnit}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="portion" className="mb-2 block text-sm font-medium">
          Количество
        </label>
        <div className="flex items-center gap-2">
          <input
            id="portion"
            type="number"
            min={1}
            max={10000}
            step={1}
            value={grams}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) setGrams(Math.min(10000, Math.max(0, n)));
            }}
            className="input max-w-[140px]"
          />
          <span className="text-sm text-slate-500">г</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PORTION_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setGrams(p)}
              className={cn(
                'min-h-touch rounded-full border px-3 py-1.5 text-sm font-medium transition',
                grams === p
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
              )}
            >
              {p} г
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          На {grams} г
        </h3>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-300">
                  Показатель
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">
                  Значение
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {rows.map((row) => (
            <div
              key={`chip-${row.label}`}
              className="rounded-xl bg-brand-50 px-3 py-2 text-center dark:bg-brand-950/50"
            >
              <p className="text-[11px] uppercase tracking-wide text-brand-700 dark:text-brand-300">
                {row.label}
              </p>
              <p className="text-sm font-bold text-brand-900 dark:text-brand-100">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">{SOURCE_NOTE}</p>
      <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">
        {DISCLAIMER}
      </p>
    </article>
  );
}
