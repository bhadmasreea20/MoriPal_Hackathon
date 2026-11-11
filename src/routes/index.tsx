import { createFileRoute } from '@tanstack/react-router';
import { Dashboard } from '@/components/moripal/dashboard';
import { pageHead } from '@/lib/finance';
export const Route = createFileRoute('/')({ head: () => pageHead('Dashboard', 'NovaCare Clinics financial overview: revenue, expenses, cash flow, and capital intelligence with MoriPal.'), component: Dashboard });
