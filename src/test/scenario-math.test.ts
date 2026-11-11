import { describe, it, expect } from 'vitest';
import { checkScenario } from '@/lib/scenario-math';
const base = { investment_name: 'x', category: null, risk_level: null, status: null, description: null };
describe('checkScenario', () => {
  it('calculates payback as cost ÷ benefit', () => { expect(checkScenario({ ...base, initial_cost: 90000, expected_annual_benefit: 17100, expected_roi: 19, payback_period: 5.3 }, 450000, 180000).calcPayback).toBe(5.3); });
  it('flags a saved payback that disagrees with the calculation', () => { expect(checkScenario({ ...base, initial_cost: 135000, expected_annual_benefit: 32400, expected_roi: 24, payback_period: 1.5 }, 450000, 180000).issues.length).toBe(1); });
  it('reports a reserve shortfall for the $650,000 acquisition', () => { const c = checkScenario({ ...base, initial_cost: 650000, expected_annual_benefit: 130000, expected_roi: 20, payback_period: 5 }, 450000, 180000); expect(c.preservesReserve).toBe(false); expect(c.aboveReserve).toBe(-380000); });
});
