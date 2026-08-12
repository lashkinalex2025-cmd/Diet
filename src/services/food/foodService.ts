import { OpenFoodFactsService } from '@/services/api/openFoodFacts';
import { UsdaFoodDataService } from '@/services/api/usda';
import type { FoodApiService } from '@/services/api/types';
import type { Food, FoodSearchResult } from '@/types/food';
import { FoodApiError } from '@/types/food';
import { sanitizeQuery, searchQuerySchema } from '@/utils/validation';
import { db } from '@/database/db';
import { MAX_HISTORY_ITEMS } from '@/constants';

function createProvider(): FoodApiService {
  const provider = (import.meta.env.VITE_FOOD_PROVIDER || 'openfoodfacts').toLowerCase();
  const usdaKey = import.meta.env.VITE_USDA_API_KEY || import.meta.env.VITE_FOOD_API_KEY;

  if (provider === 'usda' && usdaKey) {
    return new UsdaFoodDataService(usdaKey);
  }

  return new OpenFoodFactsService();
}

export const foodApi: FoodApiService = createProvider();

export async function searchFoods(rawQuery: string): Promise<FoodSearchResult> {
  const query = sanitizeQuery(rawQuery);
  const parsed = searchQuerySchema.safeParse(query);

  if (!parsed.success) {
    throw new FoodApiError(
      'invalid_query',
      parsed.error.errors[0]?.message ?? 'Некорректный запрос',
    );
  }

  // Serve from local cache when offline
  if (!navigator.onLine) {
    const cached = await db.searchCache.get(query.toLowerCase());
    if (cached?.results?.length) {
      return {
        items: cached.results,
        query,
        total: cached.results.length,
        source: `${cached.source} (кеш)`,
      };
    }
    throw new FoodApiError(
      'network',
      'Нет подключения к интернету. Сохранённых данных для этого запроса нет.',
    );
  }

  try {
    const result = await foodApi.search(query);

    await db.searchCache.put({
      query: query.toLowerCase(),
      results: result.items,
      source: result.source,
      cachedAt: Date.now(),
    });

    return result;
  } catch (error) {
    // Fallback to cache on network failure
    const cached = await db.searchCache.get(query.toLowerCase());
    if (cached?.results?.length) {
      return {
        items: cached.results,
        query,
        total: cached.results.length,
        source: `${cached.source} (кеш)`,
      };
    }
    throw error;
  }
}

export async function getFoodById(id: string): Promise<Food | null> {
  const favorite = await db.favorites.get(id);
  if (favorite) return favorite;

  const historyHit = await db.history
    .orderBy('createdAt')
    .reverse()
    .filter((h) => h.foodId === id && !!h.food)
    .first();
  if (historyHit?.food) return historyHit.food;

  if (foodApi.getById && navigator.onLine) {
    return foodApi.getById(id);
  }

  return null;
}

export async function addToFavorites(food: Food): Promise<void> {
  await db.favorites.put({ ...food, savedAt: Date.now() });
}

export async function removeFromFavorites(id: string): Promise<void> {
  await db.favorites.delete(id);
}

export async function isFavorite(id: string): Promise<boolean> {
  return (await db.favorites.get(id)) != null;
}

export async function listFavorites() {
  return db.favorites.orderBy('savedAt').reverse().toArray();
}

export async function clearFavorites(): Promise<void> {
  await db.favorites.clear();
}

export async function addHistory(entry: {
  query: string;
  food?: Food;
}): Promise<void> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await db.history.put({
    id,
    query: entry.query,
    foodId: entry.food?.id,
    foodName: entry.food?.name,
    food: entry.food,
    createdAt: Date.now(),
  });

  const all = await db.history.orderBy('createdAt').reverse().toArray();
  if (all.length > MAX_HISTORY_ITEMS) {
    const toDelete = all.slice(MAX_HISTORY_ITEMS).map((h) => h.id);
    await db.history.bulkDelete(toDelete);
  }
}

export async function listHistory() {
  return db.history.orderBy('createdAt').reverse().limit(MAX_HISTORY_ITEMS).toArray();
}

export async function clearHistory(): Promise<void> {
  await db.history.clear();
}

export async function clearSearchCache(): Promise<void> {
  await db.searchCache.clear();
}
