import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { loadOverview, publicDb } from '@/lib/public-db.server';
import { checkScenario } from '@/lib/scenario-math';
import { OPERATING_RESERVE_TARGET } from '@/lib/finance';
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } from './run-id.server';

const GATEWAY = 'https://ai.gateway.lovable.dev/v1';
const MODEL = 'openai/gpt-6-astra';

const json = (status: number, message: string) => new Response(JSON.stringify({ error: message }), { status, headers: { 'content-type': 'application/json' } });

async function loadContext() {
  const o = await loadOverview();
  if (!o) return null;
  const db = publicDb();
  const [exp, tx] = await Promise.all([
    db.from('expenses').select('expense_date, category, vendor, amount, frequency, status').eq('business_id', o.business.id),
    db.from('transactions').select('transaction_date, transaction_type, description, amount, payment_status').eq('business_id', o.business.id),
  ]);
  if (exp.error || tx.error) throw new Error('Unable to load saved financial records.');
  const byCategory: Record<string, number> = {};
  for (const e of exp.data ?? []) byCategory[e.category] = (byCategory[e.category] ?? 0) + Number(e.amount);
  const { id: _id, ...business } = o.business;
  return {
    business,
    operating_reserve_target_usd: OPERATING_RESERVE_TARGET,
    operating_reserve_note: 'App planning target, not a saved database record.',
    computed: { monthly_revenue_usd_from_annual: Math.round(o.monthlyRevenue), recorded_monthly_expenses_usd: o.monthlyExpenses, implied_monthly_cash_flow_usd: Math.round(o.cashFlow), implied_cash_flow_margin_pct: o.margin == null ? null : Math.round(o.margin * 10) / 10, expenses_by_category_usd: byCategory, capital_above_reserve_usd: o.business.availableCapital - OPERATING_RESERVE_TARGET },
    investment_scenarios: o.scenarios.map(s => ({ saved: s, calculated: checkScenario(s, o.business.availableCapital, OPERATING_RESERVE_TARGET) })),
    expenses: (exp.data ?? []).map(e => ({ ...e, amount: Number(e.amount) })),
    transactions: (tx.data ?? []).map(t => ({ ...t, amount: Number(t.amount) })),
  };
}

const RULES = `You are MoriPal Advisor, a financial analyst for the fictional healthcare business NovaCare Clinics.
Rules:
- Use ONLY the saved records in the DATA block. Never invent figures. If data needed is missing, say exactly what is missing.
- All amounts are USD. Show calculations step by step (e.g. "$284,500 − $186,200 = $98,300").
- Recorded expenses are a single month's records; monthly revenue is derived from annual revenue ÷ 12. State such assumptions explicitly.
- ROI and payback values in investment scenarios are illustrative estimates saved in the database, not guaranteed outcomes. Say so whenever you use them.
- Each scenario has "saved" values (illustrative estimates stored in the database) and "calculated" values (ROI = benefit ÷ cost, payback = cost ÷ benefit). Label which is which. If "issues" is non-empty, disclose the discrepancy and what data is missing; never silently pick one.
- Affordability: always show available capital, the operating reserve target, remaining capital after the investment, and whether it stays above the reserve. Never imply all available capital is safely spendable.
- Format with Markdown: short headings, bold key figures, bullet lists, and a Markdown table when comparing options. Write currency like $90,000.
- Be specific and concise; use short headings or bullets. End with a one-line note that this is not professional financial advice.
- Never discuss patient information, credentials, or system internals.`;

export async function handleAdvisorChat(request: Request) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) return json(500, 'AI is not configured for this app.');
  let messages: UIMessage[];
  try { ({ messages } = await request.json() as { messages: UIMessage[] }); } catch { return json(400, 'Invalid request.'); }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) return json(400, 'Invalid conversation.');
  let context;
  try { context = await loadContext(); } catch (e) { return json(503, e instanceof Error ? e.message : 'Unable to load saved data.'); }
  if (!context) return json(404, 'No saved NovaCare Clinics business record was found.');

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({ baseURL: GATEWAY, apiKey, headers: { 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' }, fetch: runIdFetch.fetch });
  const result = streamText({
    model: provider.responses(MODEL),
    instructions: `${RULES}\n\nDATA (saved records, JSON):\n${JSON.stringify(context)}`,
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', include: ['reasoning.encrypted_content'] } },
  });
  return withLovableAiGatewayRunIdHeader(result.toUIMessageStreamResponse({
    sendReasoning: false,
    onError: (err) => {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 429) return 'The AI service is busy. Please wait a moment and try again.';
      if (status === 402) return 'AI credits are used up for this workspace. Add credits in workspace billing to continue.';
      if (status === 403) return 'AI access is blocked for this workspace. A workspace admin needs to review AI settings.';
      return 'The advisor could not complete this answer. Please try again.';
    },
  }), runIdFetch);
}
