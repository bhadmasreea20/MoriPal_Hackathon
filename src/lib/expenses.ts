export type ExpenseRecord = {
  id: string; business_id: string; expense_date: string; category: string;
  vendor: string | null; amount: number; frequency: string | null; status: string | null;
};
export type ExpenseFilters = { search: string; category: string; status: string };
export const expenseUsd = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
export function filterExpenses(rows: ExpenseRecord[], filters: ExpenseFilters) {
  const search = filters.search.trim().toLowerCase();
  return rows.filter(row => (filters.category === 'all' || row.category === filters.category)
    && (filters.status === 'all' || (row.status ?? 'Unspecified') === filters.status)
    && [row.expense_date, row.category, row.vendor, row.amount, expenseUsd(row.amount), row.frequency, row.status].join(' ').toLowerCase().includes(search));
}
export function summarizeExpenses(rows: ExpenseRecord[]) {
  const totalCents = rows.reduce((sum, row) => sum + Math.round(row.amount * 100), 0);
  const largest = rows.reduce<ExpenseRecord | null>((max, row) => !max || row.amount > max.amount ? row : max, null);
  const categories = new Map<string, number>();
  for (const row of rows) categories.set(row.category, (categories.get(row.category) ?? 0) + Math.round(row.amount * 100));
  return { total: totalCents / 100, count: rows.length, largest,
    categories: [...categories].map(([category, cents]) => ({ category, amount: cents / 100 })).sort((a, b) => b.amount - a.amount) };
}