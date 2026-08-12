import { z } from 'zod';
import { MAX_QUERY_LENGTH, MIN_QUERY_LENGTH } from '@/constants';

export const searchQuerySchema = z
  .string()
  .trim()
  .min(MIN_QUERY_LENGTH, `Введите не менее ${MIN_QUERY_LENGTH} символов`)
  .max(MAX_QUERY_LENGTH, `Не более ${MAX_QUERY_LENGTH} символов`)
  .refine((v) => !/[<>{}]/.test(v), 'Недопустимые символы в запросе');

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export function sanitizeQuery(raw: string): string {
  return raw
    .replace(/[<>{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH);
}

export const portionSchema = z
  .number({ invalid_type_error: 'Введите число' })
  .positive('Количество должно быть больше 0')
  .max(10_000, 'Слишком большое значение');
