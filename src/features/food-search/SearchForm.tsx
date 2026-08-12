import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search } from 'lucide-react';
import { searchQuerySchema } from '@/utils/validation';

const formSchema = z.object({
  query: searchQuerySchema,
});

type FormValues = z.infer<typeof formSchema>;

interface SearchFormProps {
  defaultQuery?: string;
  isLoading?: boolean;
  onSearch: (query: string) => void;
}

export function SearchForm({ defaultQuery = '', isLoading, onSearch }: SearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: defaultQuery },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => onSearch(values.query))}
      className="space-y-2"
      noValidate
    >
      <label htmlFor="product-query" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Продукт
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="product-query"
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Введите название продукта"
          className="input"
          aria-invalid={!!errors.query}
          aria-describedby={errors.query ? 'query-error' : undefined}
          {...register('query')}
        />
        <button type="submit" className="btn-primary shrink-0 sm:min-w-[120px]" disabled={isLoading}>
          <Search className="h-4 w-4" aria-hidden />
          {isLoading ? 'Поиск…' : 'Найти'}
        </button>
      </div>
      {errors.query && (
        <p id="query-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
          {errors.query.message}
        </p>
      )}
    </form>
  );
}
