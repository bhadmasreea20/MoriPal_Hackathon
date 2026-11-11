// Pure, client-safe payment rules shared by server functions and tests.
export type PayableRow = {
  id: string;
  amount: number | string;
  currency: string;
  payment_status: string | null;
  checkout_eligible: boolean;
  paypal_order_id: string | null;
};

export function checkEligibility(row: PayableRow | null): { ok: true; amount: string } | { ok: false; reason: string } {
  if (!row) return { ok: false, reason: 'Transaction not found.' };
  if (!row.checkout_eligible) return { ok: false, reason: 'This transaction is not eligible for checkout.' };
  if (row.payment_status !== 'Pending') return { ok: false, reason: 'Only pending transactions can be paid.' };
  if (row.currency !== 'USD') return { ok: false, reason: 'Only USD payments are supported.' };
  const n = Number(row.amount);
  if (!Number.isFinite(n) || n <= 0) return { ok: false, reason: 'Saved amount is invalid.' };
  return { ok: true, amount: n.toFixed(2) };
}

export type CaptureSummary = { orderId: string; status: string; captureId: string | null; captureStatus: string | null; amount: string | null; currency: string | null };

export function summarizeCapture(body: any): CaptureSummary {
  const cap = body?.purchase_units?.[0]?.payments?.captures?.[0];
  return { orderId: String(body?.id ?? ''), status: String(body?.status ?? ''), captureId: cap?.id ?? null, captureStatus: cap?.status ?? null, amount: cap?.amount?.value ?? null, currency: cap?.amount?.currency_code ?? null };
}

/** Decide the outcome strictly from PayPal's result compared with the saved record. */
export function verifyCapture(saved: { amount: number | string; currency: string; paypal_order_id: string | null }, c: CaptureSummary): 'completed' | 'failed' | 'mismatch' {
  if (c.orderId !== saved.paypal_order_id) return 'mismatch';
  if (c.status === 'COMPLETED' && c.captureStatus === 'COMPLETED' && c.captureId) {
    return c.amount === Number(saved.amount).toFixed(2) && c.currency === saved.currency ? 'completed' : 'mismatch';
  }
  if (c.captureStatus === 'DECLINED' || c.captureStatus === 'FAILED') return 'failed';
  return 'mismatch';
}
