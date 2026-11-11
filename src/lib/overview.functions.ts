import { createServerFn } from '@tanstack/react-start';
import { queryOptions } from '@tanstack/react-query';

export const getOverview = createServerFn({ method: 'GET' }).handler(async () => {
  const { loadOverview } = await import('./public-db.server');
  const o = await loadOverview();
  if (!o) return null;
  const { id: _id, ...business } = o.business;
  return { ...o, business };
});

export const overviewQueryOptions = queryOptions({ queryKey: ['novacare-overview'], queryFn: () => getOverview(), staleTime: 30_000, retry: false });
