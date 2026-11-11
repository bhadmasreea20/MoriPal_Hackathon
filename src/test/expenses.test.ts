import { describe, expect, it } from 'vitest';
import { expenseUsd, filterExpenses, summarizeExpenses, type ExpenseRecord } from '@/lib/expenses';
const rows: ExpenseRecord[] = [
  { id: '1', business_id: 'b', expense_date: '2026-10-02', category: 'Staff', vendor: 'Clinical payroll', amount: 78000, frequency: 'Monthly', status: 'Paid' },
  { id: '2', business_id: 'b', expense_date: '2026-10-03', category: 'Rent', vendor: 'Clinic lease', amount: 18500, frequency: 'Monthly', status: 'Pending' },
  { id: '3', business_id: 'b', expense_date: '2026-10-04', category: 'Staff', vendor: 'Benefits', amount: 6000, frequency: 'Monthly', status: 'Paid' },
];
describe('Database expense calculations', () => {
  it('calculates totals, count and largest from supplied records', () => { const result = summarizeExpenses(rows); expect(result.total).toBe(102500); expect(result.count).toBe(3); expect(result.largest?.id).toBe('1'); });
  it('updates all calculations and chart categories with category filters', () => { const result = summarizeExpenses(filterExpenses(rows, { search: '', category: 'Staff', status: 'all' })); expect(result.total).toBe(84000); expect(result.count).toBe(2); expect(result.categories).toEqual([{ category: 'Staff', amount: 84000 }]); });
  it('combines search, category and status filters', () => { expect(filterExpenses(rows, { search: 'LEASE', category: 'Rent', status: 'Pending' }).map(row => row.id)).toEqual(['2']); expect(filterExpenses(rows, { search: 'lease', category: 'Rent', status: 'Paid' })).toEqual([]); });
  it('handles empty filtered records without retaining previous totals', () => { expect(summarizeExpenses([])).toEqual({ total: 0, count: 0, largest: null, categories: [] }); });
  it('preserves USD cents in totals and formatting', () => { expect(expenseUsd(1234.56)).toBe('$1,234.56'); expect(summarizeExpenses([{ ...rows[0], amount: 0.1 } as ExpenseRecord, { ...rows[1], amount: 0.2 } as ExpenseRecord]).total).toBe(0.3); });
});