import { describe, expect, it } from 'vitest';
import { usd, demoBusiness, demoExpenses, demoInvestmentScenarios, financials } from '@/lib/finance';
describe('Application currency', () => {
 it('formats all financial values in USD', () => { expect(usd(284500)).toBe('$284,500'); expect(usd(-8420)).toBe('-$8,420'); });
});
describe('Fictional healthcare database demo', () => {
 it('keeps NovaCare Clinics as the only demo business', () => { expect(demoBusiness.name).toBe('NovaCare Clinics'); });
 it('provides at least 12 expenses across all requested categories', () => {
  expect(demoExpenses.length).toBeGreaterThanOrEqual(12);
  for (const category of ['Staff', 'Rent', 'Medical supplies', 'Utilities', 'Software', 'Equipment maintenance', 'Marketing']) expect(demoExpenses.some(e => e.category === category)).toBe(true);
 });
 it('reconciles monthly expenses and annualized revenue to the existing dashboard', () => {
  expect(demoExpenses.reduce((sum, e) => sum + e.amount, 0)).toBe(186200);
  expect(demoBusiness.annual_revenue).toBe((financials.at(-1)?.revenue ?? 0) * 12);
  expect(demoBusiness.available_capital).toBe(450000);
 });
 it('provides the four requested investment opportunities', () => {
  expect(demoInvestmentScenarios.map(s => s.investment_name)).toEqual(['Purchasing diagnostic equipment', 'Opening a new clinic branch', 'Upgrading IT infrastructure', 'Acquiring a small clinic']);
 });
 it('uses consistent annual ROI and payback figures', () => {
  for (const scenario of demoInvestmentScenarios) {
   expect(scenario.expected_roi).toBeCloseTo(scenario.expected_annual_benefit / scenario.initial_cost * 100, 2);
   expect(scenario.payback_period).toBeCloseTo(scenario.initial_cost / scenario.expected_annual_benefit, 2);
  }
 });
});
