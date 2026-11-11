export const usd = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
export const months = ['May 2026', 'June 2026', 'July 2026', 'August 2026', 'September 2026', 'October 2026'];
export const financials = [
  { month: 'May', revenue: 218000, expenses: 157000 },
  { month: 'Jun', revenue: 234000, expenses: 162000 },
  { month: 'Jul', revenue: 228000, expenses: 169000 },
  { month: 'Aug', revenue: 256000, expenses: 174000 },
  { month: 'Sep', revenue: 271000, expenses: 179000 },
  { month: 'Oct', revenue: 284500, expenses: 186200 },
];
export const allocations = [
  { name: 'Operating reserves', amount: 180000, share: 40, color: 'allocation-reserves' },
  { name: 'Growth & expansion', amount: 135000, share: 30, color: 'allocation-growth' },
  { name: 'Equipment & technology', amount: 90000, share: 20, color: 'allocation-equipment' },
  { name: 'Strategic investments', amount: 45000, share: 10, color: 'allocation-investments' },
];
export const transactions = [
  { id: 'TX-1048', name: 'Insurance reimbursements', detail: 'HarborPoint Benefits (fictional)', category: 'Patient revenue', date: 'Oct 8, 2026', amount: 24850, status: 'Completed' },
  { id: 'TX-1047', name: 'Medical supplies', detail: 'Clearwell Medical Supply (fictional)', category: 'Medical supplies', date: 'Oct 7, 2026', amount: -8420, status: 'Completed' },
  { id: 'TX-1046', name: 'Patient payments', detail: 'Direct patient collections', category: 'Patient revenue', date: 'Oct 7, 2026', amount: 12340, status: 'Completed' },
  { id: 'TX-1045', name: 'Facility lease', detail: 'Westside Medical Plaza', category: 'Facilities', date: 'Oct 6, 2026', amount: -18500, status: 'Completed' },
  { id: 'TX-1044', name: 'Diagnostic equipment', detail: 'LumaPath Diagnostics (fictional)', category: 'Equipment', date: 'Oct 5, 2026', amount: -15750, status: 'Pending' },
  { id: 'TX-1043', name: 'Clinical team payroll', detail: 'NovaCare Clinics', category: 'Payroll', date: 'Oct 2, 2026', amount: -98500, status: 'Completed' },
];
export function exportCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url);
}
export const pageHead = (title: string, description: string) => ({ meta: [ { title: `${title} | MoriPal` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} | MoriPal` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' } ] });

// Database demo fixture: annual revenue is October revenue annualized;
// October operating expenses reconcile to the dashboard's $186,200.
export const demoBusiness = { name: 'NovaCare Clinics', industry: 'Healthcare · Outpatient services', location: 'Austin, Texas, United States', annual_revenue: 3414000, available_capital: 450000 };
export const demoExpenses = [
  { category: 'Staff', vendor: 'NovaCare clinical payroll', amount: 78000 },
  { category: 'Staff', vendor: 'NovaCare administrative payroll', amount: 14500 },
  { category: 'Staff', vendor: 'WillowBridge Benefits (fictional)', amount: 6000 },
  { category: 'Rent', vendor: 'Westside Medical Plaza (fictional)', amount: 18500 },
  { category: 'Rent', vendor: 'Cedar Grove Properties (fictional)', amount: 9500 },
  { category: 'Utilities', vendor: 'Oakline Utilities (fictional)', amount: 4500 },
  { category: 'Medical supplies', vendor: 'Clearwell Medical Supply (fictional)', amount: 8420 },
  { category: 'Medical supplies', vendor: 'Juniper Clinical Supply (fictional)', amount: 20030 },
  { category: 'Software', vendor: 'CareLedger Systems (fictional)', amount: 6000 },
  { category: 'Equipment maintenance', vendor: 'LumaPath Service (fictional)', amount: 5750 },
  { category: 'Equipment maintenance', vendor: 'BrightBench Biomedical (fictional)', amount: 4000 },
  { category: 'Marketing', vendor: 'Northleaf Creative (fictional)', amount: 5000 },
  { category: 'Administration', vendor: 'MapleStone Business Services (fictional)', amount: 4000 },
  { category: 'Administration', vendor: 'SilverBrook Office Supply (fictional)', amount: 2000 },
];
// ROI is annual benefit / initial cost × 100; payback is measured in years.
export const demoInvestmentScenarios = [
  { investment_name: 'Purchasing diagnostic equipment', category: 'Equipment & technology', initial_cost: 90000, expected_annual_benefit: 17100, expected_roi: 19, payback_period: 5.26, risk_level: 'Medium', description: 'Fictional in-house diagnostic equipment purchase. Annual net operating benefit after service and staffing costs; leaves $360,000 in capital.', status: 'Under review' },
  { investment_name: 'Opening a new clinic branch', category: 'Growth & expansion', initial_cost: 135000, expected_annual_benefit: 32400, expected_roi: 24, payback_period: 4.17, risk_level: 'Medium', description: 'Fictional leased fourth clinic fit-out and launch. Annual net operating benefit after recurring costs; leaves $315,000 in capital.', status: 'Proposed' },
  { investment_name: 'Upgrading IT infrastructure', category: 'Equipment & technology', initial_cost: 45000, expected_annual_benefit: 18000, expected_roi: 40, payback_period: 2.5, risk_level: 'Low', description: 'Fictional network, security and scheduling infrastructure upgrade across three locations. Annual savings net of subscriptions; leaves $405,000 in capital.', status: 'Approved' },
  { investment_name: 'Acquiring a small clinic', category: 'Strategic investments', initial_cost: 650000, expected_annual_benefit: 130000, expected_roi: 20, payback_period: 5, risk_level: 'High', description: 'Fictional acquisition of Willow Bend Family Clinic (invented). Annual net benefit after operating costs. Requires $380,000 additional funding to preserve the $180,000 reserve; no financing is connected.', status: 'Needs financing' },
];
/** App-level planning target (not a saved database record); shown wherever affordability is discussed. */
export const OPERATING_RESERVE_TARGET = allocations.find(a => a.name === 'Operating reserves')?.amount ?? 0;
