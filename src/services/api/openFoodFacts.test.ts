import { describe, expect, it } from 'vitest';
import { mapOffProduct, mapOffSearchResponse } from './openFoodFacts';

describe('mapOffProduct', () => {
  it('maps Open Food Facts product to Food', () => {
    const food = mapOffProduct({
      code: '123',
      product_name_ru: 'Яблоко',
      brands: 'Garden, Other',
      categories: 'Fruits, Snacks',
      nutriments: {
        'energy-kcal_100g': 52,
        proteins_100g: 0.3,
        fat_100g: 0.2,
        carbohydrates_100g: 14,
      },
    });

    expect(food).toMatchObject({
      id: '123',
      name: 'Яблоко',
      brand: 'Garden',
      category: 'Fruits',
      calories: 52,
      protein: 0.3,
      fat: 0.2,
      carbohydrates: 14,
      source: 'Open Food Facts',
    });
  });

  it('does not invent missing nutrition values', () => {
    const food = mapOffProduct({
      code: '456',
      product_name: 'Mystery',
      nutriments: {},
    });
    expect(food?.calories).toBeNull();
    expect(food?.protein).toBeNull();
  });

  it('returns null without id', () => {
    expect(mapOffProduct({ product_name: 'X' })).toBeNull();
  });
});

describe('mapOffSearchResponse', () => {
  it('filters and sorts by nutrition completeness', () => {
    const result = mapOffSearchResponse(
      {
        count: 2,
        products: [
          { code: '1', product_name: 'A', nutriments: {} },
          {
            code: '2',
            product_name: 'B',
            nutriments: {
              'energy-kcal_100g': 100,
              proteins_100g: 10,
              fat_100g: 1,
              carbohydrates_100g: 5,
            },
          },
        ],
      },
      'test',
    );

    expect(result.items[0]?.id).toBe('2');
    expect(result.query).toBe('test');
    expect(result.source).toBe('Open Food Facts');
  });
});
