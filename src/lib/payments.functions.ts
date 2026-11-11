import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { checkEligibility, summarizeCapture, verifyCapture } from './payments';

const COLS = 'id, amount, currency, payment_status, checkout_eligible, paypal_order_id, paypal_transaction_id, description';

// Return/cancel URLs come from the browser but only decide where PayPal sends the
// user back to; they never influence amount, currency, eligibility, or status.
const urlField = z.string().url().max(500).refine(u => u.startsWith('https://') || u.startsWith('http://localhost'), 'Return URL must be a secure application URL.');

// Browser sends only a transaction ID; amount and eligibility come from the saved record.
// Signed-in users only: anonymous visitors can never create or capture payments.
export const createPayPalOrder = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ transactionId: z.string().uuid(), returnUrl: urlField, cancelUrl: urlField }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { createOrder, getOrderStatus } = await import('./paypal.server');
    const { data: row, error } = await supabaseAdmin.from('transactions').select(COLS).eq('id', data.transactionId).maybeSingle();
    if (error) throw new Error('Unable to load the transaction.');
    // Idempotent: an in-progress order for the same transaction is reused, never duplicated.
    // A stored order that the buyer has not approved (or that PayPal has expired) is
    // replaced with a fresh one, so the return URL always matches the current site.
    // An approved/completed order is never replaced, so it can't be paid twice.
    const staleOrderId = row?.paypal_order_id ?? null;
    if (staleOrderId) {
      const status = await getOrderStatus(staleOrderId);
      if (status === 'APPROVED' || status === 'COMPLETED') throw new Error('This payment was already approved in PayPal. Refresh the page to finish recording it.');
    }
    const check = checkEligibility(row ? { ...row, paypal_order_id: null } : row);
    if (!check.ok) throw new Error(check.reason);
    const { orderId, approveUrl } = await createOrder(row!.id, check.amount, row!.description ?? 'MoriPal payment', data.returnUrl, data.cancelUrl);
    let claim = supabaseAdmin.from('transactions')
      .update({ paypal_order_id: orderId, payment_provider: 'PayPal Sandbox' })
      .eq('id', row!.id).eq('payment_status', 'Pending');
    claim = staleOrderId ? claim.eq('paypal_order_id', staleOrderId) : claim.is('paypal_order_id', null);
    const { data: claimed, error: upErr } = await claim.select('paypal_order_id').maybeSingle();
    if (upErr || !claimed) throw new Error('This transaction is already being paid.');
    return { orderId, approveUrl };
  });

export const capturePayPalOrder = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ orderId: z.string().min(5).max(64).regex(/^[A-Z0-9]+$/) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { captureOrder } = await import('./paypal.server');
    const { data: row, error } = await supabaseAdmin.from('transactions').select(COLS).eq('paypal_order_id', data.orderId).maybeSingle();
    if (error || !row) throw new Error('No saved transaction matches this PayPal order.');
    // Duplicate/replayed capture requests return the already-verified result.
    // Receipt values always come from the saved, server-verified record.
    const receipt = (captureId: string | null) => ({ amount: Number(row.amount).toFixed(2), currency: row.currency, captureId, description: row.description });
    if (row.payment_status === 'Completed') return { status: 'Completed' as const, alreadyRecorded: true, ...receipt(row.paypal_transaction_id) };
    const { ok, body } = await captureOrder(data.orderId);
    // PayPal rejected the capture request itself (not approved yet, expired, or an
    // API error). Nothing is marked paid; the buyer can return and try again.
    if (!ok) {
      console.error('PayPal capture request rejected', { orderId: data.orderId });
      return { status: 'Pending' as const, ...receipt(null) };
    }
    const summary = summarizeCapture(body);
    const outcome = verifyCapture(row, summary);
    if (outcome === 'completed') {
      const { error: e } = await supabaseAdmin.from('transactions')
        .update({ payment_status: 'Completed', paypal_transaction_id: summary.captureId, paid_at: new Date().toISOString() })
        .eq('paypal_order_id', data.orderId).neq('payment_status', 'Completed');
      if (e) { console.error('Failed to record capture', e.code); throw new Error('Payment captured but could not be recorded. Contact support.'); }
      return { status: 'Completed' as const, alreadyRecorded: false, ...receipt(summary.captureId) };
    }
    if (outcome === 'failed') {
      await supabaseAdmin.from('transactions').update({ payment_status: 'Failed' }).eq('paypal_order_id', data.orderId).eq('payment_status', 'Pending');
      return { status: 'Failed' as const, ...receipt(null) };
    }
    console.error('PayPal capture did not match saved record', { orderId: data.orderId, status: summary.status });
    return { status: 'Pending' as const, ...receipt(null) };
  });
