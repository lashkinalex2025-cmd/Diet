import type { Food, FoodSearchResult } from '@/types/food';

/** Pluggable food data provider contract. */
export interface FoodApiService {
  readonly name: string;
  search(query: string): Promise<FoodSearchResult>;
  getById?(id: string): Promise<Food | null>;
}
