import { ROUTE_PATH } from './routePath';

export const ADMIN_PAGE_LINKS = [
  { id: 'boxerRegister', name: 'ボクサー登録', path: ROUTE_PATH.BOXER_REGISTER },
  { id: 'boxerEdit', name: 'ボクサー編集', path: ROUTE_PATH.BOXER_EDIT },
  { id: 'matchRegister', name: '試合登録', path: ROUTE_PATH.MATCH_REGISTER },
  { id: 'matchEdit', name: '試合編集', path: ROUTE_PATH.MATCH_EDIT },
] as const;

export type AdminPageLink = (typeof ADMIN_PAGE_LINKS)[number];
