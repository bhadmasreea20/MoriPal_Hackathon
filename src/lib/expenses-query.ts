import { queryOptions } from '@tanstack/react-query';
import { getExpenses } from './expenses.functions';
export const expensesQueryOptions = queryOptions({ queryKey: ['novacare-expenses'], queryFn: () => getExpenses(), staleTime: 30_000, retry: false });