import { describe, expect, it } from 'vitest';
import { checkEligibility, summarizeCapture, verifyCapture, type PayableRow } from '@/lib/payments';

const eligibleRow: PayableRow = {
  id: '7a1c0b52-4f0e-4c4b-9f2a-5a0d6e1b2501',
  amount: 250,
  currency: 'USD',
  payment_status: 'Pending',
  checkout_eligible: true,
  paypal_order_id: null,
};

describe('checkEligibility', () => {
  it('accepts a pending, eligible USD transaction and formats the saved amount', () => {
    const result = checkEligibility(eligibleRow);
    expect(result).toEqual({ ok: true, amount: '250.00' });
  });

  it('rejects a missing transaction', () => {
    expect(checkEligibility(null)).toEqual({ ok: false, reason: 'Transaction not found.' });
  });

  it('rejects transactions that are not eligible for checkout', () => {
    const result = checkEligibility({ ...eligibleRow, checkout_eligible: false });
    expect(result.ok).toBe(false);
  });

  it('rejects transactions that are already paid or failed', () => {
    expect(checkEligibility({ ...eligibleRow, payment_status: 'Completed' }).ok).toBe(false);
    expect(checkEligibility({ ...eligibleRow, payment_status: 'Failed' }).ok).toBe(false);
  });

  it('rejects non-USD transactions', () => {
    expect(checkEligibility({ ...eligibleRow, currency: 'EUR' }).ok).toBe(false);
  });

  it('rejects zero, negative, or non-numeric saved amounts', () => {
    expect(checkEligibility({ ...eligibleRow, amount: 0 }).ok).toBe(false);
    expect(checkEligibility({ ...eligibleRow, amount: -5 }).ok).toBe(false);
    expect(checkEligibility({ ...eligibleRow, amount: 'abc' }).ok).toBe(false);
  });
});

const completedBody = {
  id: 'ORDER123',
  status: 'COMPLETED',
  purchase_units: [{ payments: { captures: [{ id: 'CAPTURE456', status: 'COMPLETED', amount: { value: '250.00', currency_code: 'USD' } }] } }],
};

describe('verifyCapture', () => {
  const saved = { amount: 250, currency: 'USD', paypal_order_id: 'ORDER123' };

  it('accepts a completed capture whose amount and currency exactly match the saved record', () => {
    expect(verifyCapture(saved, summarizeCapture(completedBody))).toBe('completed');
  });

  it('rejects a capture for a different order', () => {
    expect(verifyCapture({ ...saved, paypal_order_id: 'OTHERORDER' }, summarizeCapture(completedBody))).toBe('mismatch');
  });

  it('rejects an amount mismatch', () => {
    const body = { ...completedBody, purchase_units: [{ payments: { captures: [{ id: 'CAPTURE456', status: 'COMPLETED', amount: { value: '249.99', currency_code: 'USD' } }] } }] };
    expect(verifyCapture(saved, summarizeCapture(body))).toBe('mismatch');
  });

  it('rejects a currency mismatch', () => {
    const body = { ...completedBody, purchase_units: [{ payments: { captures: [{ id: 'CAPTURE456', status: 'COMPLETED', amount: { value: '250.00', currency_code: 'EUR' } }] } }] };
    expect(verifyCapture(saved, summarizeCapture(body))).toBe('mismatch');
  });

  it('reports declined or failed captures as failed', () => {
    const body = { id: 'ORDER123', status: 'COMPLETED', purchase_units: [{ payments: { captures: [{ id: 'CAPTURE456', status: 'DECLINED', amount: { value: '250.00', currency_code: 'USD' } }] } }] };
    expect(verifyCapture(saved, summarizeCapture(body))).toBe('failed');
  });

  it('treats pending or unexpected PayPal results as mismatch, never as paid', () => {
    expect(verifyCapture(saved, summarizeCapture({ id: 'ORDER123', status: 'APPROVED' }))).toBe('mismatch');
    expect(verifyCapture(saved, summarizeCapture(null))).toBe('mismatch');
  });
});
