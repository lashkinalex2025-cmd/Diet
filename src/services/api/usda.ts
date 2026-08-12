import { fetchJson } from './http';
import type { FoodApiService } from './types';
import type { Food, FoodSearchResult } from '@/types/food';
import { FoodApiError } from '@/types/food';
import { sanitizeNumber } from '@/utils/nutrition';

/**
 * Optional USDA FoodData Central adapter.
 * Requires VITE_USDA_API_KEY — never hardcode secrets.
 */
interface UsdaFood {
  fdcId: number;
  description?: string;
  brandOwner?: string;
  foodCategory?: string;
  foodNutrients?: Array<{
    nutrientId?: number;
    nutrientNumber?: string;
    nutrientName?: string;
    value?: number;
    unitName?: string;
  }>;
}

interface UsdaSearchResponse {
  foods?: UsdaFood[];
  totalHits?: number;
}

const NUTRIENT_MAP = {
  energy: ['Energy', '208'],
  protein: ['Protein', '203'],
  fat: ['Total lipid (fat)', '204'],
  carbs: ['Carbohydrate, by difference', '205'],
} as const;

function nutrientValue(
  food: UsdaFood,
  names: readonly string[],
): number | null {
  const list = food.foodNutrients ?? [];
  for (const n of list) {
    const name = n.nutrientName ?? '';
    const num = n.nutrientNumber ?? '';
    if (names.includes(name) || names.includes(num)) {
      return sanitizeNumber(n.value);
    }
  }
  return null;
}

export function mapUsdaFood(food: UsdaFood): Food {
  return {
    id: `usda-${food.fdcId}`,
    name: food.description || 'Без названия',
    brand: food.brandOwner || undefined,
    category: food.foodCategory || undefined,
    calories: nutrientValue(food, NUTRIENT_MAP.energy),
    protein: nutrientValue(food, NUTRIENT_MAP.protein),
    fat: nutrientValue(food, NUTRIENT_MAP.fat),
    carbohydrates: nutrientValue(food, NUTRIENT_MAP.carbs),
    servingUnit: 'г',
    source: 'USDA FoodData Central',
  };
}

export class UsdaFoodDataService implements FoodApiService {
  readonly name = 'USDA FoodData Central';
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.nal.usda.gov/fdc/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string): Promise<FoodSearchResult> {
    if (!this.apiKey) {
      throw new FoodApiError('invalid_query', 'Не задан ключ USDA API');
    }

    const url = `${this.baseUrl}/foods/search?api_key=${encodeURIComponent(this.apiKey)}`;
    const data = await fetchJson<UsdaSearchResponse>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        pageSize: 24,
        dataType: ['Foundation', 'SR Legacy', 'Survey (FNDDS)', 'Branded'],
      }),
    });

    const items = (data.foods ?? []).map(mapUsdaFood);
    return {
      items,
      query,
      total: data.totalHits ?? items.length,
      source: this.name,
    };
  }
}
