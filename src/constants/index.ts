export const APP_NAME = 'Diet';
export const APP_VERSION = '1.0.0';

export const DEFAULT_PORTION_GRAMS = 100;

export const PORTION_PRESETS = [50, 100, 150, 200, 250, 500] as const;

export const MAX_HISTORY_ITEMS = 30;
export const MAX_QUERY_LENGTH = 120;
export const MIN_QUERY_LENGTH = 2;

export const API_TIMEOUT_MS = 12_000;
export const SEARCH_DEBOUNCE_MS = 350;

export const QUERY_STALE_TIME_MS = 5 * 60 * 1000;
export const QUERY_GC_TIME_MS = 30 * 60 * 1000;

export const DATA_SOURCE_LABEL = 'Open Food Facts (search.openfoodfacts.org)';

export const DISCLAIMER =
  'Информация о пищевой ценности предоставляется справочно и может отличаться в зависимости от продукта, бренда, приготовления и размера порции. Приложение не заменяет консультацию врача или диетолога.';

export const SOURCE_NOTE =
  'Пищевая ценность указана по данным выбранного источника.';

export const OFFLINE_SAVED_NOTE =
  'Нет подключения к интернету. Показываем сохранённые данные.';
