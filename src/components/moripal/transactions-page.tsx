import { useEffect, useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, CircleCheck, CircleX, Clock3, Download, LoaderCircle, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { capturePayPalOrder, createPayPalOrder } from '@/lib/payments.functions';
import { transactionsQueryOptions, type SavedTransaction } from '@/lib/transactions.functions';
import { exportCsv, usd } from '@/lib/finance';
import { PageHeading } from './workspace-pages';

const routeApi = getRouteApi('/transactions');

type PayState =
  | { kind: 'idle' }
  | { kind: 'starting' }
  | { kind: 'capturing' }
  | { kind: 'paid'; amount: string; currency: string; captureId: string | null; description: string | null; alreadyRecorded: boolean }
  | { kind: 'pending'; amount: string; currency: string }
  | { kind: 'failed'; message: string }
  | { kind: 'cancelled' };

function statusOf(t: SavedTransaction): { label: string; className: string; icon: 'paid' | 'pending' | 'failed' | 'unpaid' } {
  if (t.payment_status === 'Completed' || t.paid) return { label: 'Paid', className: 'status', icon: 'paid' };
  if (t.payment_status === 'Failed') return { label: 'Payment failed', className: 'status status-failed', icon: 'failed' };
  if (t.payment_status === 'Pending' && t.payment_provider === 'PayPal Sandbox') return { label: 'Payment pending', className: 'status status-pending', icon: 'pending' };
  if (t.payment_status === 'Pending') return { label: 'Unpaid', className: 'status status-pending', icon: 'unpaid' };
  return { label: t.payment_status ?? 'Recorded', className: 'status', icon: 'paid' };
}

function StatusIcon({ kind }: { kind: 'paid' | 'pending' | 'failed' | 'unpaid' }) {
  if (kind === 'failed') return <CircleX size={12} />;
  if (kind === 'pending' || kind === 'unpaid') return <Clock3 size={12} />;
  return <CircleCheck size={12} />;
}

const fmtDate = (iso: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso));

export function TransactionsPage() {
  const { data, refetch } = useSuspenseQuery(transactionsQueryOptions);
  const queryClient = useQueryClient();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<'All transactions' | 'Income' | 'Expenses'>('All transactions');
  const [pay, setPay] = useState<PayState>({ kind: 'idle' });

  // Handle the return from the PayPal Sandbox approval page.
  useEffect(() => {
    if (search.paypal === 'cancelled') {
      setPay({ kind: 'cancelled' });
      void navigate({ search: {}, replace: true });
      return;
    }
    if (search.paypal !== 'return' || !search.token) return;
    const orderId = search.token;
    setPay({ kind: 'capturing' });
    void navigate({ search: {}, replace: true });
    capturePayPalOrder({ data: { orderId } })
      .then(async result => {
        await queryClient.invalidateQueries({ queryKey: transactionsQueryOptions.queryKey });
        if (result.status === 'Completed') setPay({ kind: 'paid', amount: result.amount, currency: result.currency, captureId: result.captureId, description: result.description, alreadyRecorded: result.alreadyRecorded });
        else if (result.status === 'Failed') setPay({ kind: 'failed', message: 'PayPal could not complete this payment. No money was moved.' });
        else setPay({ kind: 'pending', amount: result.amount, currency: result.currency });
      })
      .catch((e: unknown) => setPay({ kind: 'failed', message: e instanceof Error ? e.message : 'Payment verification failed. The transaction has not been marked as paid.' }));
  }, [search.paypal, search.token, navigate, queryClient]);

  const rows = data.filter(t => {
    const hay = `${t.description ?? ''} ${t.transaction_type} ${t.payment_provider ?? ''}`.toLowerCase();
    const matchesText = hay.includes(text.trim().toLowerCase());
    const matchesType = filter === 'All transactions' || (filter === 'Income' ? t.transaction_type === 'Income' : t.transaction_type === 'Expense');
    return matchesText && matchesType;
  });

  const startPayment = async (t: SavedTransaction) => {
    if (pay.kind === 'starting' || pay.kind === 'capturing') return;
    setPay({ kind: 'starting' });
    try {
      const base = `${window.location.origin}/transactions`;
      const { approveUrl } = await createPayPalOrder({ data: { transactionId: t.id, returnUrl: `${base}?paypal=return`, cancelUrl: `${base}?paypal=cancelled` } });
      window.location.assign(approveUrl);
    } catch (e) {
      setPay({ kind: 'failed', message: e instanceof Error ? e.message : 'Unable to start PayPal Sandbox checkout.' });
    }
  };

  return <>
    <PageHeading title="Transactions" subtitle="Every movement of money. One complete picture." />
    {pay.kind === 'paid' && <div role="status" className="pay-banner pay-banner-success"><CircleCheck size={18} /><div><strong>{pay.alreadyRecorded ? 'Payment already recorded.' : 'Payment completed.'}</strong><p>PayPal Sandbox verified {usd(Number(pay.amount))} {pay.currency}{pay.description ? ` for ${pay.description}` : ''}. Status: <strong>Paid</strong>{pay.captureId ? <> · Capture reference <strong>{pay.captureId}</strong></> : null}.{pay.alreadyRecorded ? ' No second capture was made.' : ''}</p></div><Button variant="ghost" size="sm" onClick={() => setPay({ kind: 'idle' })}>Dismiss</Button></div>}
    {pay.kind === 'failed' && <div role="alert" className="pay-banner pay-banner-failed"><CircleX size={18} /><div><strong>Payment not completed.</strong><p>{pay.message}</p></div><Button variant="ghost" size="sm" onClick={() => setPay({ kind: 'idle' })}>Dismiss</Button></div>}
    {pay.kind === 'pending' && <div role="status" className="pay-banner"><Clock3 size={18} /><div><strong>Payment still processing.</strong><p>PayPal has not confirmed the {usd(Number(pay.amount))} {pay.currency} payment yet, so it is not marked as paid. Refresh in a moment to check again.</p></div><Button variant="ghost" size="sm" onClick={() => setPay({ kind: 'idle' })}>Dismiss</Button></div>}
    {pay.kind === 'cancelled' && <div role="status" className="pay-banner"><Clock3 size={18} /><div><strong>Checkout cancelled.</strong><p>You left PayPal before approving. The transaction is unchanged and can be paid later.</p></div><Button variant="ghost" size="sm" onClick={() => setPay({ kind: 'idle' })}>Dismiss</Button></div>}
    {pay.kind === 'capturing' && <div role="status" className="pay-banner"><LoaderCircle size={18} className="animate-spin" /><div><strong>Verifying payment with PayPal…</strong><p>The transaction is only marked paid after PayPal confirms the capture.</p></div></div>}
    <section className="panel">
      <div className="transaction-toolbar">
        <div className="filter-tabs">{(['All transactions', 'Income', 'Expenses'] as const).map(f => <Button key={f} variant="ghost" className={filter === f ? 'filter-active' : ''} onClick={() => setFilter(f)}>{f}</Button>)}</div>
        <div className="flex gap-3">
          <div className="search-field"><Search size={16} /><Input aria-label="Search transactions" placeholder="Search transactions…" value={text} onChange={e => setText(e.target.value)} /></div>
          <Button variant="outline" size="icon" aria-label="Export transactions" onClick={() => exportCsv('MoriPal-transactions.csv', [['Description', 'Type', 'Date', 'Amount (USD)', 'Status'], ...rows.map(t => [t.description ?? '', t.transaction_type, fmtDate(t.transaction_date), t.amount, statusOf(t).label])])}><Download /></Button>
        </div>
      </div>
      <div className="table-scroll">
        <table className="finance-table transactions-table">
          <thead><tr><th>Transaction</th><th>Type</th><th>Date</th><th>Amount</th><th>Status</th><th>Payment</th></tr></thead>
          <tbody>{rows.map(t => {
            const s = statusOf(t); const isIncome = t.transaction_type === 'Income';
            const payable = t.checkout_eligible && t.payment_status === 'Pending' && !t.paid;
            return <tr key={t.id}>
              <td><div className="transaction-name"><span className={`transaction-icon ${isIncome ? 'income' : ''}`}>{isIncome ? <ArrowDownRight size={17} /> : <ArrowUpRight size={17} />}</span><span><strong>{t.description ?? t.transaction_type}</strong><small>{t.payment_provider ?? 'Demo ledger'}{t.checkout_eligible ? ' · Sandbox test' : ''}</small></span></div></td>
              <td className="text-muted-foreground">{t.transaction_type}</td>
              <td className="text-muted-foreground">{fmtDate(t.transaction_date)}</td>
              <td className={`amount ${isIncome ? 'text-success' : ''}`}>{isIncome ? '+' : '−'}{usd(Math.abs(t.amount))}</td>
              <td><span className={s.className}><StatusIcon kind={s.icon} />{s.label}</span>{!t.checkout_eligible && t.payment_status === 'Pending' && <small className="block text-muted-foreground">Payment unavailable</small>}</td>
              <td>
                {payable && <Button size="sm" onClick={() => void startPayment(t)} disabled={pay.kind === 'starting' || pay.kind === 'capturing'}>{pay.kind === 'starting' ? <LoaderCircle className="animate-spin" /> : <ShieldCheck />}Pay with PayPal (Sandbox)</Button>}
                {t.paypal_transaction_id && <small className="block text-muted-foreground">Capture {t.paypal_transaction_id}</small>}
                {!t.paypal_transaction_id && t.paypal_order_id && <small className="block text-muted-foreground">Order {t.paypal_order_id}</small>}
                {t.paid && t.paid_at && <small className="block text-muted-foreground">Paid {fmtDate(t.paid_at)}</small>}
              </td>
            </tr>;
          })}</tbody>
        </table>
        {rows.length === 0 && <p className="py-10 text-center text-muted-foreground">No transactions match your search.</p>}
      </div>
      <div className="table-footer"><span>Showing {rows.length} of {data.length} saved transactions</span><span>All amounts in USD · Sandbox payments only, no real money</span></div>
    </section>
  </>;
}
