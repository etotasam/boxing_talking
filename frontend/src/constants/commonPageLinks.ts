import { ROUTE_PATH } from './routePath';

export const COMMON_PAGE_LINKS = [
  { id: 'schedule', name: 'Schedule', path: ROUTE_PATH.HOME },
  { id: 'matchResult', name: 'Match Result', path: ROUTE_PATH.PAST_MATCHES },
] as const;

export type CommonPageLink = (typeof COMMON_PAGE_LINKS)[number];
