import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Food } from '@/types/food';
import {
  addHistory,
  clearHistory,
  listHistory,
} from '@/services/food/foodService';

export function useHistoryList() {
  return useQuery({
    queryKey: ['history'],
    queryFn: listHistory,
  });
}

export function useHistoryActions() {
  const qc = useQueryClient();

  const add = useMutation({
    mutationFn: (payload: { query: string; food?: Food }) => addHistory(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const clear = useMutation({
    mutationFn: clearHistory,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['history'] });
    },
  });

  return { add, clear };
}
