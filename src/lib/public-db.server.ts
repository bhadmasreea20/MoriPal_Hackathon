import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Read-only client for public fictional demo records; respects existing anon SELECT policies.
export function publicDb() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['SUPABASE_ANON_KEY'];
  if (!url || !key) throw new Error('Saved business data is unavailable.');
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
}

export async function loadOverview() {
  const db = publicDb();
  const { data: b, error } = await db.from('businesses').select('id, name, industry, location, annual_revenue, available_capital').eq('name', 'NovaCare Clinics').limit(1).maybeSingle();
  if (error) throw new Error('Unable to load saved business data.');
  if (!b) return null;
  const [exp, sc] = await Promise.all([
    db.from('expenses').select('amount').eq('business_id', b.id),
    db.from('investment_scenarios').select('investment_name, category, initial_cost, expected_annual_benefit, expected_roi, payback_period, risk_level, status, description').eq('business_id', b.id).order('initial_cost'),
  ]);
  if (exp.error || sc.error) throw new Error('Unable to load saved financial records.');
  const annualRevenue = Number(b.annual_revenue ?? 0);
  const monthlyRevenue = annualRevenue / 12;
  const monthlyExpenses = (exp.data ?? []).reduce((s, e) => s + Number(e.amount), 0);
  return {
    business: { id: b.id, name: b.name, industry: b.industry, location: b.location, annualRevenue, availableCapital: Number(b.available_capital ?? 0) },
    monthlyRevenue, monthlyExpenses, cashFlow: monthlyRevenue - monthlyExpenses,
    margin: monthlyRevenue ? ((monthlyRevenue - monthlyExpenses) / monthlyRevenue) * 100 : null,
    scenarios: (sc.data ?? []).map(s => ({ ...s, initial_cost: Number(s.initial_cost), expected_annual_benefit: Number(s.expected_annual_benefit), expected_roi: s.expected_roi == null ? null : Number(s.expected_roi), payback_period: s.payback_period == null ? null : Number(s.payback_period) })),
  };
}
