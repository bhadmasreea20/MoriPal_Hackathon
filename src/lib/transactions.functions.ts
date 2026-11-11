import { createServerFn } from '@tanstack/react-start';
import { queryOptions } from '@tanstack/react-query';

export type SavedTransaction = { id: string; transaction_type: string; description: string | null; amount: number; currency: string; payment_status: string | null; payment_provider: string | null; transaction_date: string; checkout_eligible: boolean; paid: boolean; paypal_order_id: string | null; paypal_transaction_id: string | null; paid_at: string | null };

export const getTransactions = createServerFn({ method: 'GET' }).handler(async () => {
  const { publicDb } = await import('./public-db.server');
  const db = publicDb();
  const { data: b } = await db.from('businesses').select('id').eq('name', 'NovaCare Clinics').order('created_at').limit(1).maybeSingle();
  if (!b) return [] as SavedTransaction[];
  const { data, error } = await db.from('transactions').select('id, transaction_type, description, amount, currency, payment_status, payment_provider, transaction_date, checkout_eligible, paypal_order_id, paypal_transaction_id, paid_at').eq('business_id', b.id).order('transaction_date', { ascending: false });
  if (error) throw new Error('Unable to load saved transactions.');
  return (data ?? []).map(t => ({ ...t, amount: Number(t.amount), paid: !!t.paypal_transaction_id })) as SavedTransaction[];
});

export const transactionsQueryOptions = queryOptions({ queryKey: ['novacare-transactions'], queryFn: () => getTransactions(), retry: false });
