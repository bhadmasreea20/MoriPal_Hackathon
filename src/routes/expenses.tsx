import { createFileRoute } from '@tanstack/react-router';
import { ExpensesPage, ExpensesLoading, ExpensesError } from '@/components/moripal/expenses-page';
import { expensesQueryOptions } from '@/lib/expenses-query';
import { pageHead } from '@/lib/finance';
export const Route = createFileRoute('/expenses')({
  validateSearch: (search: Record<string, unknown>) => ({ search: typeof search['search'] === 'string' ? search['search'] : '', category: typeof search['category'] === 'string' ? search['category'] : 'all', status: typeof search['status'] === 'string' ? search['status'] : 'all' }),
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(expensesQueryOptions); },
  pendingMs: 100,
  pendingComponent: ExpensesLoading,
  errorComponent: ExpensesError,
  notFoundComponent: () => <div className="expenses-state">Expense records not found.</div>,
  head: () => pageHead('Expenses', 'Monitor saved healthcare operating expenses, vendors, payment statuses and category totals for NovaCare Clinics.'),
  component: ExpensesPage,
});
