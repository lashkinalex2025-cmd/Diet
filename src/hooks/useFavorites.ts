import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Food } from '@/types/food';
import {
  addToFavorites,
  clearFavorites,
  isFavorite,
  listFavorites,
  removeFromFavorites,
} from '@/services/food/foodService';

export function useFavoritesList() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: listFavorites,
  });
}

export function useIsFavorite(id: string | undefined) {
  return useQuery({
    queryKey: ['favorites', 'is', id],
    queryFn: () => (id ? isFavorite(id) : Promise.resolve(false)),
    enabled: !!id,
  });
}

export function useFavoriteActions() {
  const qc = useQueryClient();

  const toggle = useMutation({
    mutationFn: async ({ food, favorite }: { food: Food; favorite: boolean }) => {
      if (favorite) await removeFromFavorites(food.id);
      else await addToFavorites(food);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const clear = useMutation({
    mutationFn: clearFavorites,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return { toggle, clear };
}
