import { createFileRoute } from '@tanstack/react-router';
import { CapitalPage } from '@/components/moripal/workspace-pages';
import { pageHead } from '@/lib/finance';
export const Route = createFileRoute('/capital-decisions')({ head: () => pageHead('Capital Decisions', 'Compare capital allocation and investment scenarios for NovaCare Clinics.'), component: CapitalPage });
