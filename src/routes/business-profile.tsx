import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/components/moripal/workspace-pages';
import { pageHead } from '@/lib/finance';
export const Route = createFileRoute('/business-profile')({ head: () => pageHead('Business Profile', 'View NovaCare Clinics organization details, reporting currency, and clinic locations.'), component: ProfilePage });
