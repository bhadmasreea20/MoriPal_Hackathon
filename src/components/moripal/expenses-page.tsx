import { useMemo } from 'react';
import { ClientOnly, getRouteApi, useRouter } from '@tanstack/react-router';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef } from 'ag-grid-community';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircle, Download, LoaderCircle, ReceiptText, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { expenseUsd, filterExpenses, summarizeExpenses, type ExpenseRecord } from '@/lib/expenses';
import { expensesQueryOptions } from '@/lib/expenses-query';
import { exportCsv } from '@/lib/finance';
import { useTheme, type Theme } from '@/lib/theme';

ModuleRegistry.registerModules([AllCommunityModule]);
const routeApi = getRouteApi('/expenses');
const makeGridTheme = (mode: Theme) => themeQuartz.withParams({
  browserColorScheme: mode, fontFamily: 'var(--font-sans)', fontSize: 12,
  backgroundColor: 'var(--card)', foregroundColor: 'var(--foreground)',
  borderColor: 'var(--border)', headerBackgroundColor: 'var(--background)',
  headerTextColor: 'var(--muted-foreground)', accentColor: 'var(--primary)',
  rowHeight: 48, headerHeight: 46, wrapperBorderRadius: 0,
});
const columns: ColDef<ExpenseRecord>[] = [
  { field: 'expense_date', headerName: 'Date', width: 135, valueFormatter: ({ value }) => value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : '—' },
  { field: 'category', headerName: 'Category', minWidth: 180, flex: 1 },
  { field: 'vendor', headerName: 'Vendor', minWidth: 250, flex: 2, tooltipField: 'vendor', valueFormatter: ({ value }) => value ?? '—' },
  { field: 'amount', headerName: 'Amount (USD)', width: 160, type: 'numericColumn', valueFormatter: ({ value }) => expenseUsd(Number(value ?? 0)), cellClass: 'expense-grid-amount' },
  { field: 'frequency', headerName: 'Frequency', width: 120, valueFormatter: ({ value }) => value ?? '—' },
  { field: 'status', headerName: 'Status', width: 130, cellRenderer: ({ value }: { value: string | null }) => <span className={`expense-status ${value === 'Paid' ? 'expense-status-paid' : value === 'Failed' ? 'expense-status-failed' : value === 'Pending' || value === 'Unpaid' ? 'expense-status-pending' : ''}`}>{value ?? 'Unspecified'}</span> },
];
function ExpenseHeading({ name = 'NovaCare Clinics' }: { name?: string }) {
  return <div className="page-heading"><div><div className="heading-eyebrow">{name.toUpperCase()}</div><h1>Expenses</h1><p>A clear view of where your business spends.</p></div><span className="demo-badge"><span />Saved demo records · USD</span></div>;
}
export function ExpensesLoading() {
  return <><ExpenseHeading /><div className="expenses-state" role="status"><LoaderCircle className="animate-spin text-primary" /><h2>Loading saved expenses…</h2></div></>;
}
export function ExpensesError() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return <><ExpenseHeading /><div className="expenses-state" role="alert"><AlertCircle className="text-destructive" /><h2>Expenses couldn’t be loaded</h2><p>Your saved records haven’t changed. Please try again.</p><Button variant="outline" onClick={async () => { queryClient.removeQueries({ queryKey: expensesQueryOptions.queryKey }); await router.invalidate(); }}><RefreshCw />Try again</Button></div></>;
}
export function ExpensesPage() {
  const mode = useTheme();
  const gridTheme = useMemo(() => makeGridTheme(mode), [mode]);
  const { data, isFetching, refetch, error } = useSuspenseQuery(expensesQueryOptions);
  const filters = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const rows = useMemo(() => filterExpenses(data.expenses, filters), [data.expenses, filters]);
  const summary = useMemo(() => summarizeExpenses(rows), [rows]);
  const categories = [...new Set(data.expenses.map(row => row.category))].sort();
  const statuses = [...new Set(data.expenses.map(row => row.status ?? 'Unspecified'))].sort();
  const filtered = Boolean(filters.search || filters.category !== 'all' || filters.status !== 'all');
  const setFilter = (key: 'search' | 'category' | 'status', value: string) => { void navigate({ search: previous => ({ ...previous, [key]: value }), replace: true }); };
  const clear = () => { void navigate({ search: { search: '', category: 'all', status: 'all' }, replace: true }); };
  return <div className="expenses-page">
    <ExpenseHeading name={data.business?.name ?? 'NovaCare Clinics'} />
    <div className="expenses-toolbar">
      <div className="search-field"><Search size={16} /><Input aria-label="Search expenses" placeholder="Search expenses…" value={filters.search} onChange={event => setFilter('search', event.target.value)} /></div>
      <Select value={filters.category} onValueChange={value => setFilter('category', value)}><SelectTrigger aria-label="Filter by category"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select>
      <Select value={filters.status} onValueChange={value => setFilter('status', value)}><SelectTrigger aria-label="Filter by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select>
      {filtered && <Button variant="ghost" size="icon" aria-label="Clear expense filters" title="Clear filters" onClick={clear}><X /></Button>}
      <Button variant="outline" size="icon" aria-label="Refresh expenses" title="Refresh expenses" disabled={isFetching} onClick={() => { void refetch(); }}><RefreshCw className={isFetching ? 'animate-spin' : ''} /></Button>
      <Button variant="outline" aria-label="Export expenses" disabled={!rows.length} onClick={() => exportCsv('MoriPal-expenses.csv', [['Date', 'Category', 'Vendor', 'Amount (USD)', 'Frequency', 'Status'], ...rows.map(row => [row.expense_date, row.category, row.vendor ?? '', row.amount, row.frequency ?? '', row.status ?? ''])])}><Download />Export</Button>
    </div>
    {error && <p className="mb-4 text-destructive" role="alert">Refresh failed. Showing the last successfully loaded records.</p>}
    <div className="summary-grid expense-summary" aria-live="polite">
      <div className="metric-card" aria-label="Total expenses"><span className="text-muted-foreground">Total expenses</span><div className="metric-value">{expenseUsd(summary.total)}</div><small>{filtered ? 'Filtered records' : 'All saved expenses'} · USD</small></div>
      <div className="metric-card" aria-label="Expense records"><span className="text-muted-foreground">Expense records</span><div className="metric-value">{summary.count}</div><small>Of {data.expenses.length} saved records</small></div>
      <div className="metric-card" aria-label="Largest expense"><span className="text-muted-foreground">Largest expense</span><div className="metric-value">{summary.largest ? expenseUsd(summary.largest.amount) : '—'}</div><small title={summary.largest?.vendor ?? undefined}>{summary.largest?.vendor ?? (summary.largest ? summary.largest.category : 'No matching records')}</small></div>
    </div>
    <section className="panel expense-ledger" aria-label="Expense ledger"><div className="panel-heading"><div><h2>Expense ledger</h2><p>{data.business?.name ?? 'Business not found'} · {rows.length} matching records</p></div><ReceiptText size={19} className="text-muted-foreground" /></div>
      <div className="expense-grid"><ClientOnly fallback={<div className="expenses-state" role="status">Loading expense grid…</div>}><AgGridReact<ExpenseRecord> theme={gridTheme} rowData={rows} columnDefs={columns} defaultColDef={{ sortable: true, resizable: true, suppressMovable: true }} getRowId={({ data: row }) => row.id} animateRows={false} overlayNoRowsTemplate={data.expenses.length ? '<span>No expenses match your filters.</span>' : '<span>No saved expenses yet.</span>'} /></ClientOnly></div>
      <div className="table-footer"><span>Showing {rows.length} of {data.expenses.length} expenses</span><span>All amounts in USD</span></div>
      {!rows.length && <div className="expense-empty"><p>{data.expenses.length ? 'No expenses match your filters.' : data.business ? 'No saved expenses for this business yet.' : 'NovaCare Clinics has no saved business record.'}</p>{filtered && <Button variant="outline" onClick={clear}><X />Clear filters</Button>}</div>}
    </section>
    <section className="panel expense-chart-section" aria-label="Expenses by category"><div className="panel-heading"><div><h2>Expenses by category</h2><p>{filtered ? 'Filtered expenses' : 'All saved expenses'} · USD</p></div><span className="count-badge">{summary.categories.length} categories</span></div>
      {summary.categories.length ? <><div className="expense-chart" role="img" aria-label={summary.categories.map(category => `${category.category}: ${expenseUsd(category.amount)}`).join('; ')}><ClientOnly><ResponsiveContainer width="100%" height="100%"><BarChart data={summary.categories} layout="vertical" margin={{ left: 0, right: 32, top: 12, bottom: 8 }}><XAxis type="number" tickFormatter={value => expenseUsd(Number(value))} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="category" width={155} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: 'var(--muted)' }} formatter={value => [expenseUsd(Number(value)), 'Expenses']} contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 6, color: 'var(--foreground)', fontSize: 12 }} /><Bar dataKey="amount" fill="var(--primary)" radius={[0, 3, 3, 0]} maxBarSize={24} isAnimationActive={false} /></BarChart></ResponsiveContainer></ClientOnly></div><div className="expense-category-totals">{summary.categories.map(category => <div key={category.category}><span>{category.category}</span><strong>{expenseUsd(category.amount)}</strong></div>)}</div></> : <div className="expenses-state"><p>No expense totals to display.</p></div>}
    </section>
  </div>;
}