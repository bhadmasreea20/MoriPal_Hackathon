-- SreeCapital core schema

CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  location text,
  annual_revenue numeric(14, 2) DEFAULT 0,
  available_capital numeric(14, 2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  vendor text,
  amount numeric(14, 2) NOT NULL DEFAULT 0,
  frequency text,
  status text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.investment_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  investment_name text NOT NULL,
  category text,
  initial_cost numeric(14, 2) NOT NULL DEFAULT 0,
  expected_annual_benefit numeric(14, 2) NOT NULL DEFAULT 0,
  expected_roi numeric(8, 2),
  payback_period numeric(6, 1),
  risk_level text,
  description text,
  status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  description text,
  amount numeric(14, 2) NOT NULL DEFAULT 0,
  payment_status text,
  payment_provider text,
  paypal_transaction_id text,
  transaction_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  recommendation_text text NOT NULL,
  related_scenario_id uuid REFERENCES public.investment_scenarios(id) ON DELETE SET NULL,
  estimated_impact text,
  risk_level text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common lookups
CREATE INDEX idx_expenses_business ON public.expenses(business_id);
CREATE INDEX idx_investment_scenarios_business ON public.investment_scenarios(business_id);
CREATE INDEX idx_transactions_business ON public.transactions(business_id);
CREATE INDEX idx_ai_recommendations_business ON public.ai_recommendations(business_id);

-- Grants (Data API access)
GRANT SELECT ON public.businesses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investment_scenarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_recommendations TO authenticated;
GRANT ALL ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;
GRANT ALL ON public.expenses TO service_role;
GRANT ALL ON public.investment_scenarios TO service_role;
GRANT ALL ON public.transactions TO service_role;
GRANT ALL ON public.ai_recommendations TO service_role;

-- Row Level Security
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Demo data is publicly readable; signed-in users get full CRUD
CREATE POLICY "Businesses are publicly readable" ON public.businesses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Expenses are publicly readable" ON public.expenses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Scenarios are publicly readable" ON public.investment_scenarios FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Transactions are publicly readable" ON public.transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Recommendations are publicly readable" ON public.ai_recommendations FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated users manage expenses" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users manage scenarios" ON public.investment_scenarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users manage transactions" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users manage recommendations" ON public.ai_recommendations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users manage businesses" ON public.businesses FOR ALL TO authenticated USING (true) WITH CHECK (true);