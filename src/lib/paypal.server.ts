// PayPal Sandbox only. The base URL is fixed so live mode cannot be enabled by configuration.
const PAYPAL_BASE = 'https://api-m.sandbox.paypal.com';
const PAYPAL_CHECKOUT_BASE = 'https://www.sandbox.paypal.com';

async function token(): Promise<string> {
  const id = process.env['PAYPAL_CLIENT_ID'];
  const secret = process.env['PAYPAL_CLIENT_SECRET'];
  if (!id || !secret) throw new Error('PayPal Sandbox is not configured.');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${id}:${secret}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) { console.error('PayPal Sandbox auth failed', res.status); throw new Error('PayPal Sandbox authentication failed. Check that Sandbox credentials are saved.'); }
  return ((await res.json()) as { access_token: string }).access_token;
}

export type CreatedOrder = { orderId: string; approveUrl: string };

/** Approval URL for an existing order (used when an order was already created for a transaction). */
export function approvalUrl(orderId: string) {
  return `${PAYPAL_CHECKOUT_BASE}/checkoutnow?token=${encodeURIComponent(orderId)}`;
}

/** Status of a stored order at PayPal, or null if PayPal no longer knows it (expired/unknown). */
export async function getOrderStatus(orderId: string): Promise<string | null> {
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: `Bearer ${await token()}` } });
  if (!res.ok) { console.warn('Stored PayPal order not usable', res.status); return null; }
  return ((await res.json()) as { status?: string }).status ?? null;
}

export async function createOrder(transactionId: string, amount: string, description: string, returnUrl: string, cancelUrl: string): Promise<CreatedOrder> {
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': `create-${transactionId}-${crypto.randomUUID()}` },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{ reference_id: transactionId, custom_id: transactionId, description: description.slice(0, 120), amount: { currency_code: 'USD', value: amount } }],
      payment_source: { paypal: { experience_context: { brand_name: 'MoriPal (Sandbox)', user_action: 'PAY_NOW', return_url: returnUrl, cancel_url: cancelUrl } } },
    }),
  });
  const body = await res.json().catch(() => null) as { id?: string; links?: { rel?: string; href?: string }[] } | null;
  if (!res.ok || !body?.id) { console.error('PayPal create order failed', res.status); throw new Error('Unable to start PayPal Sandbox checkout.'); }
  const approveUrl = body.links?.find(l => l.rel === 'payer-action' || l.rel === 'approve')?.href ?? approvalUrl(body.id);
  return { orderId: body.id, approveUrl };
}

export async function captureOrder(orderId: string) {
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': `capture-${orderId}` },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) console.error('PayPal capture returned', res.status, (body as any)?.name);
  return { ok: res.ok, body };
}
