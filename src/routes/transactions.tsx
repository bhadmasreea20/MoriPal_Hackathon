import { createFileRoute } from '@tanstack/react-router';
import { TransactionsPage } from '@/components/moripal/transactions-page';
import { pageHead } from '@/lib/finance';

type TransactionsSearch = { paypal?: 'return' | 'cancelled' | undefined; token?: string | undefined };

export const Route = createFileRoute('/transactions')({
  validateSearch: (search: Record<string, unknown>): TransactionsSearch => ({
    paypal: search['paypal'] === 'return' || search['paypal'] === 'cancelled' ? search['paypal'] : undefined,
    token: typeof search['token'] === 'string' ? search['token'] : undefined,
  }),
  head: () => pageHead('Transactions', 'Review saved income and expense transactions for NovaCare Clinics and pay eligible invoices through PayPal Sandbox.'),
  component: TransactionsPage,
});
