import { fetchJson } from './http';
import type { FoodApiService } from './types';
import type { Food, FoodSearchResult } from '@/types/food';
import { FoodApiError } from '@/types/food';
import { sanitizeNumber } from '@/utils/nutrition';

/**
 * Host order (browser-safe = Access-Control-Allow-Origin: *):
 * 1. world.openfoodfacts.net — staging/public, most reliable for anonymous browser clients
 * 2. world / ru production mirrors
 * 3. search.openfoodfacts.org — good data, but often no ACAO (CORS fail in browser)
 */
const SEARCH_HOSTS = [
  'https://world.openfoodfacts.net',
  'https://world.openfoodfacts.org',
  'https://ru.openfoodfacts.org',
  'https://ssl-api.openfoodfacts.org',
] as const;

const SEARCH_SERVICE =
  import.meta.env.VITE_FOOD_API_URL?.replace(/\/$/, '') ||
  'https://search.openfoodfacts.org';

interface OffNutriments {
  'energy-kcal_100g'?: number | string;
  energy_kcal_100g?: number | string;
  'energy-kcal'?: number | string;
  proteins_100g?: number | string;
  fat_100g?: number | string;
  carbohydrates_100g?: number | string;
}

interface OffProduct {
  code?: string;
  _id?: string;
  product_name?: string;
  product_name_ru?: string;
  product_name_en?: string;
  product_name_fr?: string;
  generic_name?: string;
  generic_name_ru?: string;
  brands?: string;
  categories?: string;
  categories_tags?: string[];
  image_front_small_url?: string;
  image_small_url?: string;
  image_url?: string;
  nutriments?: OffNutriments;
  serving_size?: string;
  serving_quantity?: number | string;
}

interface OffSearchHitsResponse {
  count?: number;
  hits?: OffProduct[];
}

interface OffLegacySearchResponse {
  count?: number;
  products?: OffProduct[];
}

function pickName(product: OffProduct): string {
  return (
    product.product_name_ru ||
    product.product_name ||
    product.product_name_en ||
    product.product_name_fr ||
    product.generic_name_ru ||
    product.generic_name ||
    'Без названия'
  );
}

function pickCategory(product: OffProduct): string | undefined {
  if (product.categories) {
    const first = product.categories.split(',')[0]?.trim();
    if (first) return first;
  }
  const tag = product.categories_tags?.[0];
  if (tag) return tag.replace(/^en:|^ru:/, '').replace(/-/g, ' ');
  return undefined;
}

function energyKcal(n?: OffNutriments): number | null {
  if (!n) return null;
  return (
    sanitizeNumber(n['energy-kcal_100g']) ??
    sanitizeNumber(n.energy_kcal_100g) ??
    sanitizeNumber(n['energy-kcal'])
  );
}

export function mapOffProduct(product: OffProduct): Food | null {
  const id = product.code || product._id;
  if (!id) return null;

  const nutriments = product.nutriments ?? {};
  const food: Food = {
    id: String(id),
    name: pickName(product),
    brand: product.brands?.split(',')[0]?.trim() || undefined,
    category: pickCategory(product),
    calories: energyKcal(nutriments),
    protein: sanitizeNumber(nutriments.proteins_100g),
    fat: sanitizeNumber(nutriments.fat_100g),
    carbohydrates: sanitizeNumber(nutriments.carbohydrates_100g),
    servingSize: sanitizeNumber(product.serving_quantity) ?? undefined,
    servingUnit: product.serving_size || 'г',
    imageUrl:
      product.image_front_small_url ||
      product.image_small_url ||
      product.image_url ||
      undefined,
    source: 'Open Food Facts',
    barcode: product.code,
  };

  if (
    food.name === 'Без названия' &&
    food.calories == null &&
    food.protein == null &&
    food.fat == null &&
    food.carbohydrates == null
  ) {
    return null;
  }

  return food;
}

function sortByNutrition(items: Food[]): Food[] {
  return [...items].sort((a, b) => {
    const score = (f: Food) =>
      (f.calories != null ? 2 : 0) +
      (f.protein != null ? 1 : 0) +
      (f.fat != null ? 1 : 0) +
      (f.carbohydrates != null ? 1 : 0);
    return score(b) - score(a);
  });
}

export function mapOffSearchResponse(
  data: OffLegacySearchResponse | OffSearchHitsResponse,
  query: string,
): FoodSearchResult {
  const products =
    'hits' in data && data.hits
      ? data.hits
      : 'products' in data && data.products
        ? data.products
        : [];

  const items = sortByNutrition(
    products.map(mapOffProduct).filter((f): f is Food => f != null),
  );

  return {
    items,
    query,
    total: data.count ?? items.length,
    source: 'Open Food Facts',
  };
}

function buildCgiUrl(host: string, query: string): string {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '24',
    fields:
      'code,_id,product_name,product_name_ru,product_name_en,generic_name,generic_name_ru,brands,categories,categories_tags,image_front_small_url,image_small_url,image_url,nutriments,serving_size,serving_quantity',
  });
  return `${host}/cgi/search.pl?${params.toString()}`;
}

export class OpenFoodFactsService implements FoodApiService {
  readonly name = 'Open Food Facts';

  async search(query: string): Promise<FoodSearchResult> {
    let lastError: unknown;
    let emptyResult: FoodSearchResult | null = null;

    for (const host of SEARCH_HOSTS) {
      try {
        const data = await fetchJson<OffLegacySearchResponse>(buildCgiUrl(host, query));
        const result = mapOffSearchResponse(data, query);
        if (result.items.length > 0) return result;
        emptyResult = result;
      } catch (error) {
        lastError = error;
      }
    }

    // Search service (may be blocked by CORS in browsers)
    try {
      const searchUrl = `${SEARCH_SERVICE}/search?${new URLSearchParams({
        q: query,
        page_size: '24',
      }).toString()}`;
      const data = await fetchJson<OffSearchHitsResponse>(searchUrl);
      const result = mapOffSearchResponse(data, query);
      if (result.items.length > 0) return result;
      emptyResult = result;
    } catch (error) {
      lastError = error;
    }

    if (emptyResult) return emptyResult;
    if (lastError instanceof FoodApiError) throw lastError;
    throw new FoodApiError('network', 'Не удалось подключиться к базе продуктов');
  }

  async getById(id: string): Promise<Food | null> {
    for (const host of SEARCH_HOSTS) {
      const url = `${host}/api/v2/product/${encodeURIComponent(id)}.json`;
      try {
        const data = await fetchJson<{ status?: number; product?: OffProduct }>(url);
        if (data.status === 1 && data.product) {
          return mapOffProduct(data.product);
        }
      } catch {
        // try next host
      }
    }
    return null;
  }
}
