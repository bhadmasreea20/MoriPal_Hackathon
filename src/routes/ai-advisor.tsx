import { createFileRoute } from '@tanstack/react-router';
import { AdvisorPage } from '@/components/moripal/workspace-pages';
import { pageHead } from '@/lib/finance';
export const Route = createFileRoute('/ai-advisor')({ head: () => pageHead('AI Advisor', 'Ask the MoriPal AI-powered advisor questions answered from NovaCare Clinics saved financial records.'), component: AdvisorPage });
