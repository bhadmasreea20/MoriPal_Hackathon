import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import type { ExpenseRecord } from './expenses';

// Public fictional demo records only; the publishable client respects existing anon SELECT policies.
export const getExpenses = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['SUPABASE_ANON_KEY'];
  if (!url || !key) throw new Error('Expense connection is unavailable. Please try again later.');
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data: business, error: businessError } = await client.from('businesses').select('id, name').eq('name', 'NovaCare Clinics').order('created_at').limit(1).maybeSingle();
  if (businessError) throw new Error('Unable to load business records. Please try again.');
  if (!business) return { business: null, expenses: [] as ExpenseRecord[] };
  const expenses: ExpenseRecord[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.from('expenses').select('id, business_id, expense_date, category, vendor, amount, frequency, status').eq('business_id', business.id).order('expense_date', { ascending: false }).order('id').range(offset, offset + 999);
    if (error) throw new Error('Unable to load saved expenses. Please try again.');
    expenses.push(...(data ?? []).map(row => ({ ...row, amount: Number(row.amount) })));
    if (!data || data.length < 1000) break;
  }
  return { business, expenses };
});