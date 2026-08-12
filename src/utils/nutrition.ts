import type { Food, NutritionPer100g } from '@/types/food';

/**
 * Scale nutrition values from per-100g to an arbitrary portion.
 * nutritionForPortion = nutritionPer100g × grams / 100
 */
export function nutritionForPortion(
  nutritionPer100g: number | null | undefined,
  grams: number,
): number | null {
  if (nutritionPer100g == null || Number.isNaN(nutritionPer100g)) {
    return null;
  }
  if (!Number.isFinite(grams) || grams < 0) {
    return null;
  }
  return (nutritionPer100g * grams) / 100;
}

export function scaleFoodNutrition(
  food: Pick<Food, 'calories' | 'protein' | 'fat' | 'carbohydrates'>,
  grams: number,
): NutritionPer100g {
  return {
    calories: nutritionForPortion(food.calories, grams),
    protein: nutritionForPortion(food.protein, grams),
    fat: nutritionForPortion(food.fat, grams),
    carbohydrates: nutritionForPortion(food.carbohydrates, grams),
  };
}

export function formatNutrient(
  value: number | null | undefined,
  unit: string,
  digits = 1,
): string {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) {
    return 'Нет данных';
  }
  const rounded =
    unit === 'ккал'
      ? Math.round(value)
      : Math.round(value * 10 ** digits) / 10 ** digits;
  const text =
    unit === 'ккал'
      ? String(rounded)
      : Number.isInteger(rounded)
        ? String(rounded)
        : rounded.toFixed(digits).replace(/\.0$/, '');
  return `${text} ${unit}`;
}

export function sanitizeNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n)) return null;
  return n;
}

export function hasAnyNutrition(
  food: Pick<Food, 'calories' | 'protein' | 'fat' | 'carbohydrates'>,
): boolean {
  return (
    food.calories != null ||
    food.protein != null ||
    food.fat != null ||
    food.carbohydrates != null
  );
}
