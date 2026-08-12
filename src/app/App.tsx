import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useTheme } from '@/hooks/useTheme';

export function App() {
  // Initialize theme on app mount
  useTheme();
  return <RouterProvider router={router} />;
}
