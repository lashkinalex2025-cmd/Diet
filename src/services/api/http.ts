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

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof FoodApiError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new FoodApiError('timeout', 'Превышено время ожидания ответа');
    }

    if (!navigator.onLine) {
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
