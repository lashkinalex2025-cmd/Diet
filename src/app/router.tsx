import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage })),
);
const FoodPage = lazy(() =>
  import('@/pages/FoodPage').then((m) => ({ default: m.FoodPage })),
);
const FavoritesPage = lazy(() =>
  import('@/pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })),
);
const HistoryPage = lazy(() =>
  import('@/pages/HistoryPage').then((m) => ({ default: m.HistoryPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

function SuspensePage({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="page">
          <LoadingSkeleton label="Загрузка…" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: (
            <SuspensePage>
              <HomePage />
            </SuspensePage>
          ),
        },
        {
          path: 'food/:id',
          element: (
            <SuspensePage>
              <FoodPage />
            </SuspensePage>
          ),
        },
        {
          path: 'favorites',
          element: (
            <SuspensePage>
              <FavoritesPage />
            </SuspensePage>
          ),
        },
        {
          path: 'history',
          element: (
            <SuspensePage>
              <HistoryPage />
            </SuspensePage>
          ),
        },
        {
          path: 'settings',
          element: (
            <SuspensePage>
              <SettingsPage />
            </SuspensePage>
          ),
        },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ],
  { basename },
);
