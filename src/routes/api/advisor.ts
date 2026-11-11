import { createFileRoute } from '@tanstack/react-router';
import { handleAdvisorChat } from '@/lib/ai/advisor.server';

export const Route = createFileRoute('/api/advisor')({
  server: { handlers: { POST: ({ request }) => handleAdvisorChat(request) } },
});
