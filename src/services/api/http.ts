import { API_TIMEOUT_MS } from '@/constants';
import { FoodApiError } from '@/types/food';

const DEFAULT_HEADERS: HeadersInit = {
  Accept: 'application/json',
  // Open Food Facts asks clients to identify themselves
  'User-Agent': 'Diet/1.0 (https://github.com/lashkinalex2025-cmd/Diet)',
};

export async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = API_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...DEFAULT_HEADERS,
        ...(options.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new FoodApiError(
        'http',
        `Ошибка сервера: ${response.status}`,
        response.status,
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      // OFF sometimes returns HTML rate-limit pages with 200/503
      throw new FoodApiError(
        'http',
        'Не удалось подключиться к базе продуктов',
        response.status,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof FoodApiError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new FoodApiError('timeout', 'Превышено время ожидания ответа');
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new FoodApiError('network', 'Нет подключения к интернету');
    }

    throw new FoodApiError(
      'network',
      'Не удалось подключиться к базе продуктов',
    );
  } finally {
    window.clearTimeout(timer);
  }
}
