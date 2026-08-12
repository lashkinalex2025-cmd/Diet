import { describe, expect, it } from 'vitest';
import {
  formatNutrient,
  nutritionForPortion,
  sanitizeNumber,
  scaleFoodNutrition,
} from './nutrition';

describe('nutritionForPortion', () => {
  it('scales per-100g value: nutritionPer100g × grams / 100', () => {
    expect(nutritionForPortion(165, 100)).toBe(165);
    expect(nutritionForPortion(165, 200)).toBe(330);
    expect(nutritionForPortion(31, 50)).toBe(15.5);
    expect(nutritionForPortion(3.6, 250)).toBeCloseTo(9);
  });

  it('returns null for missing or invalid values', () => {
    expect(nutritionForPortion(null, 100)).toBeNull();
    expect(nutritionForPortion(undefined, 100)).toBeNull();
    expect(nutritionForPortion(NaN, 100)).toBeNull();
    expect(nutritionForPortion(100, -1)).toBeNull();
  });
});

describe('scaleFoodNutrition', () => {
  it('scales all macros', () => {
    const result = scaleFoodNutrition(
      { calories: 100, protein: 10, fat: 5, carbohydrates: 20 },
      200,
    );
    expect(result).toEqual({
      calories: 200,
      protein: 20,
      fat: 10,
      carbohydrates: 40,
    });
  });

  it('keeps nulls as null', () => {
    const result = scaleFoodNutrition(
      { calories: null, protein: 10, fat: null, carbohydrates: null },
      50,
    );
    expect(result.calories).toBeNull();
    expect(result.protein).toBe(5);
  });
});

describe('formatNutrient', () => {
  it('shows «Нет данных» for missing values', () => {
    expect(formatNutrient(null, 'г')).toBe('Нет данных');
    expect(formatNutrient(undefined, 'ккал')).toBe('Нет данных');
    expect(formatNutrient(NaN, 'г')).toBe('Нет данных');
  });

  it('formats calories as integers', () => {
    expect(formatNutrient(165.4, 'ккал')).toBe('165 ккал');
  });
});

describe('sanitizeNumber', () => {
  it('parses valid numbers', () => {
    expect(sanitizeNumber(12)).toBe(12);
    expect(sanitizeNumber('3.5')).toBe(3.5);
  });

  it('rejects invalid input', () => {
    expect(sanitizeNumber(null)).toBeNull();
    expect(sanitizeNumber('abc')).toBeNull();
    expect(sanitizeNumber(Infinity)).toBeNull();
  });
});
