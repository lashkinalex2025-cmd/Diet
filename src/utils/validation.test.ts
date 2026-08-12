import { describe, expect, it } from 'vitest';
import { sanitizeQuery, searchQuerySchema } from './validation';

describe('searchQuerySchema', () => {
  it('accepts valid queries', () => {
    expect(searchQuerySchema.safeParse('яблоко').success).toBe(true);
    expect(searchQuerySchema.safeParse('chicken breast').success).toBe(true);
  });

  it('rejects too short queries', () => {
    expect(searchQuerySchema.safeParse('а').success).toBe(false);
  });

  it('rejects dangerous characters', () => {
    expect(searchQuerySchema.safeParse('<script>').success).toBe(false);
  });
});

describe('sanitizeQuery', () => {
  it('strips angle brackets and trims', () => {
    expect(sanitizeQuery('  <яблоко>  ')).toBe('яблоко');
  });
});
