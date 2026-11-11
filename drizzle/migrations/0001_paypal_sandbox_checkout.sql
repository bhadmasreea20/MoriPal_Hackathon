ALTER TABLE public.transactions
  ADD COLUMN paypal_order_id text,
  ADD COLUMN currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN checkout_eligible boolean NOT NULL DEFAULT false,
  ADD COLUMN paid_at timestamptz;

COMMENT ON COLUMN public.transactions.paypal_transaction_id IS
  'PayPal Sandbox capture ID; written by server only after PayPal verification';

CREATE UNIQUE INDEX transactions_paypal_order_id_key
  ON public.transactions (paypal_order_id) WHERE paypal_order_id IS NOT NULL;
CREATE UNIQUE INDEX transactions_paypal_transaction_id_key
  ON public.transactions (paypal_transaction_id) WHERE paypal_transaction_id IS NOT NULL;

DROP POLICY "Authenticated users manage transactions" ON public.transactions;
REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM anon, authenticated;

GRANT SELECT ON public.transactions TO anon, authenticated;
GRANT ALL ON public.transactions TO service_role;