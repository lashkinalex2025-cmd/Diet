import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/database/db';
import {
  addHistory,
  addToFavorites,
  clearHistory,
  listFavorites,
  listHistory,
  removeFromFavorites,
  searchFoods,
} from './foodService';
import type { Food } from '@/types/food';

const sample: Food = {
  id: 'f1',
  name: 'Творог',
  calories: 120,
  protein: 16,
  fat: 5,
  carbohydrates: 3,
  source: 'Open Food Facts',
};

describe('favorites & history storage', () => {
  beforeEach(async () => {
    await db.favorites.clear();
    await db.history.clear();
    await db.searchCache.clear();
  });

  it('saves and removes favorites', async () => {
    await addToFavorites(sample);
    expect(await listFavorites()).toHaveLength(1);
    await removeFromFavorites(sample.id);
    expect(await listFavorites()).toHaveLength(0);
  });

  it('stores history and enforces limit logic', async () => {
    await addHistory({ query: 'яблоко', food: sample });
    await addHistory({ query: 'банан' });
    const items = await listHistory();
    expect(items.length).toBe(2);
    await clearHistory();
    expect(await listHistory()).toHaveLength(0);
  });
});

describe('searchFoods offline', () => {
  beforeEach(async () => {
    await db.searchCache.clear();
    vi.stubGlobal('navigator', { ...navigator, onLine: false });
  });

  it('throws when offline without cache', async () => {
    await expect(searchFoods('яблоко')).rejects.toMatchObject({
      code: 'network',
    });
  });

  it('returns cached results when offline', async () => {
    await db.searchCache.put({
      query: 'яблоко',
      results: [sample],
      source: 'Open Food Facts',
      cachedAt: Date.now(),
    });
    const result = await searchFoods('яблоко');
    expect(result.items).toHaveLength(1);
    expect(result.source).toContain('кеш');
  });
});
