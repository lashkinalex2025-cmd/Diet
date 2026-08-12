/** Nutrition values per 100 g. Missing fields stay null — never invent values. */
export interface NutritionPer100g {
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbohydrates: number | null;
}

export interface Food {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbohydrates: number | null;
  servingSize?: number;
  servingUnit?: string;
  imageUrl?: string;
  source: string;
  barcode?: string;
  rawPortionGrams?: number;
}

export interface FoodSearchResult {
  items: Food[];
  query: string;
  total: number;
  source: string;
}

export interface FavoriteFood extends Food {
  savedAt: number;
}

export interface HistoryEntry {
  id: string;
  query: string;
  foodId?: string;
  foodName?: string;
  food?: Food;
  createdAt: number;
}

export interface CachedSearch {
  query: string;
  results: Food[];
  source: string;
  cachedAt: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type FoodApiErrorCode =
  | 'network'
  | 'timeout'
  | 'http'
  | 'parse'
  | 'not_found'
  | 'invalid_query'
  | 'unknown';

export class FoodApiError extends Error {
  readonly code: FoodApiErrorCode;
  readonly status?: number;

  constructor(code: FoodApiErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'FoodApiError';
    this.code = code;
    this.status = status;
  }
}
