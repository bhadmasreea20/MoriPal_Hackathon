// Shared, pure calculations so Capital Decisions and the AI Advisor read saved scenarios the same way.
export type SavedScenario = {
  investment_name: string; category: string | null; initial_cost: number; expected_annual_benefit: number;
  expected_roi: number | null; payback_period: number | null; risk_level: string | null; status: string | null; description: string | null;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export function checkScenario(s: SavedScenario, availableCapital: number, reserveTarget: number) {
  const calcRoi = s.initial_cost > 0 ? round1((s.expected_annual_benefit / s.initial_cost) * 100) : null;
  const calcPayback = s.expected_annual_benefit > 0 ? round1(s.initial_cost / s.expected_annual_benefit) : null;
  const issues: string[] = [];
  if (s.expected_roi == null) issues.push('Saved ROI is missing.');
  else if (calcRoi != null && Math.abs(calcRoi - s.expected_roi) > 0.5) issues.push(`Saved ROI ${s.expected_roi}% differs from calculated ${calcRoi}%.`);
  if (s.payback_period == null) issues.push('Saved payback period is missing.');
  else if (calcPayback != null && Math.abs(calcPayback - s.payback_period) > 0.1) issues.push(`Saved payback ${s.payback_period} yrs differs from calculated ${calcPayback} yrs.`);
  if (calcPayback == null) issues.push('No expected annual benefit, so payback cannot be calculated.');
  const remaining = availableCapital - s.initial_cost;
  return { calcRoi, calcPayback, remainingCapital: remaining, aboveReserve: remaining - reserveTarget, preservesReserve: remaining >= reserveTarget, issues };
}
