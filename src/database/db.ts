import Dexie, { type Table } from 'dexie';
import type { CachedSearch, FavoriteFood, HistoryEntry } from '@/types/food';

export class DietDatabase extends Dexie {
  favorites!: Table<FavoriteFood, string>;
  history!: Table<HistoryEntry, string>;
  searchCache!: Table<CachedSearch, string>;

  constructor() {
    super('diet-db');
    this.version(1).stores({
      favorites: 'id, name, savedAt',
      history: 'id, createdAt, query',
      searchCache: 'query, cachedAt',
    });
  }
}

export const db = new DietDatabase();
