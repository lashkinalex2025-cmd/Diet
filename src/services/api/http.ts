import { API_TIMEOUT_MS } from '@/constants';
import { FoodApiError } from '@/types/food';

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
        Accept: 'application/json',
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
    const text = await response.text();

    // OFF rate-limit / error pages are often HTML with a 200/503 status
    if (
      contentType.includes('text/html') ||
      text.trimStart().startsWith('<!DOCTYPE') ||
      text.trimStart().startsWith('<html')
    ) {
      throw new FoodApiError(
        'http',
        'Не удалось подключиться к базе продуктов',
        response.status,
      );
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new FoodApiError('parse', 'Не удалось обработать ответ API');
    }
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
