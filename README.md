# Diet

Современное веб-приложение для определения пищевой ценности продуктов (**КБЖУ**: калории, белки, жиры, углеводы).

- **Mobile First** + адаптив (телефон, планшет, desktop)
- **PWA** (офлайн, установка на домашний экран)
- **Android** через Capacitor
- Реальный поиск через **Open Food Facts** (без API-ключа)
- Локальное хранение избранного и истории в **IndexedDB (Dexie)**
- Тёмная / светлая / системная тема
- Интерфейс на **русском языке**

Демо (GitHub Pages): после публикации — `https://lashkinalex2025-cmd.github.io/Diet/`

Репозиторий: https://github.com/lashkinalex2025-cmd/Diet

---

## Стек

React · TypeScript · Vite · Tailwind CSS · React Router · TanStack Query · Zod · React Hook Form · Lucide · Dexie · vite-plugin-pwa · Capacitor · Vitest

---

## Запуск

```bash
npm install
npm run dev
```

Откройте адрес, который покажет Vite (обычно `http://localhost:5173/Diet/`).

> Базовый путь по умолчанию: `/Diet/` (для GitHub Pages).  
> Для локальной разработки с корня можно задать:  
> `VITE_BASE_PATH=/ npm run dev`

---

## Production

```bash
npm run build
npm run preview
```

---

## PWA

После `npm run build` и деплоя (или `npm run preview` по HTTPS/localhost):

1. **Chrome / Edge (desktop)** — в адресной строке или в меню: «Установить приложение».
2. **Chrome Android** — «Установить приложение» / «Добавить на главный экран».
3. **Safari iOS** — «Поделиться» → «На экран «Домой»».

В разделе **Настройки** кнопка «Установить приложение» появляется, если браузер поддерживает `beforeinstallprompt`.

Офлайн:

- открывается установленное PWA;
- доступны **избранное** и **история**;
- повторный поиск из кеша IndexedDB, если запрос уже искали.

---

## Android (Capacitor)

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Если папка `android/` уже есть:

```bash
npm run build
npx cap sync android
npx cap open android
```

В Android Studio:

- **Build → Build Bundle(s) / APK(s) → Build APK(s)** — отладочный APK  
- **Build → Generate Signed Bundle / APK** — release **APK** или **AAB** для Google Play

Package ID: `com.diet.app`  
Имя приложения: `Diet`

---

## GitHub Pages

Сайт: https://lashkinalex2025-cmd.github.io/Diet/

Workflow `.github/workflows/deploy.yml` на каждый push в `main`:

1. собирает production (`VITE_BASE_PATH=/Diet/`);
2. публикует папку `dist` в ветку **`gh-pages`**.

В репозитории: **Settings → Pages → Build and deployment**:

- Source: **Deploy from a branch**
- Branch: **`gh-pages`** / folder **`/` (root)**

Либо Source: **GitHub Actions** (если включён deploy-pages).

> Важно: не публикуйте корень ветки `main` — там исходный `index.html` с `/src/main.tsx`, приложение из него **не запустится**. Нужна именно production-сборка (`dist`).

Локальная проверка:

```bash
npm run build:pages
npm run preview
```

---

## API

### По умолчанию: Open Food Facts

- Основной: `https://world.openfoodfacts.net` (CORS `*`, стабильнее для браузера)
- Fallback: `world` / `ru` / `ssl-api` openfoodfacts.org
- Доп. fallback: `https://search.openfoodfacts.org`
- **API-ключ не требуется**
- Адаптер: `src/services/api/openFoodFacts.ts`

### Опционально: USDA FoodData Central

1. Получите ключ на https://fdc.nal.usda.gov/api-key-signup.html  
2. Создайте `.env` (не коммитьте):

```env
VITE_FOOD_PROVIDER=usda
VITE_USDA_API_KEY=your_key_here
```

3. Адаптер: `src/services/api/usda.ts`

### Переменные окружения

Скопируйте `.env.example` → `.env`:

```env
VITE_BASE_PATH=/Diet/
VITE_FOOD_API_URL=https://search.openfoodfacts.org
VITE_FOOD_API_KEY=
VITE_FOOD_PROVIDER=openfoodfacts
VITE_USDA_API_KEY=
```

**Секретные ключи никогда не коммитьте в GitHub.**

Источник данных легко заменить: реализуйте интерфейс `FoodApiService` в `src/services/api/types.ts`.

---

## Скрипты

| Команда | Описание |
|--------|----------|
| `npm run dev` | dev-сервер |
| `npm run build` | production-сборка |
| `npm run preview` | просмотр сборки |
| `npm run typecheck` | проверка TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run cap:sync` | build + `cap sync android` |
| `npm run cap:open` | открыть Android Studio |

---

## Архитектура

```text
src/
├── app/           # Router, providers
├── components/    # UI shell
├── pages/         # Экраны
├── features/      # Поиск, карточка, избранное, история
├── services/      # API + food domain
├── database/      # Dexie / IndexedDB
├── hooks/
├── types/
├── utils/
└── constants/
```

КБЖУ для порции считается локально:

```text
nutritionForPortion = nutritionPer100g × grams / 100
```

Если API не вернул значение — показывается **«Нет данных»** (значения не выдумываются).

---

## Лицензия

MIT — см. [LICENSE](./LICENSE).

---

## Дисклеймер

Информация о пищевой ценности предоставляется справочно и может отличаться в зависимости от продукта, бренда, приготовления и размера порции. Приложение не заменяет консультацию врача или диетолога.
