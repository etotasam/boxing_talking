export const API_PATH = {
  //?auth
  ADMIN: '/api/admin',
  GUEST: '/api/guest/user',
  GUEST_LOGIN: '/api/guest/login',
  GUEST_LOGOUT: '/api/guest/logout',
  USER: '/api/user',
  USER_PRE_CREATE: '/api/user/pre_create',
  USER_CREATE: '/api/user/create',
  USER_LOGIN: '/api/login',
  USER_LOGOUT: '/api/logout',
  //?boxer
  BOXER: '/api/boxer',
  //?prediction
  PREDICTION: '/api/prediction',
  //?comment
  COMMENT: '/api/comment',
  //?match
  MATCH: '/api/match',
} as const;