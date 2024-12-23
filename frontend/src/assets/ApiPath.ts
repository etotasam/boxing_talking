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
  MATCH_PREDICTION: '/api/match/prediction',
  //?comment
  COMMENT_OLD: '/api/comment/old',
  COMMENT: '/api/comment',
  COMMENT_NEW: '/api/comment/new',
  COMMENT_STATE: '/api/comment/state',
  //?match
  MATCH: '/api/match',
  // MATCH_INFINITY: '/api/match/infinity',
  MATCH_RESULT: '/api/match/result',
} as const;