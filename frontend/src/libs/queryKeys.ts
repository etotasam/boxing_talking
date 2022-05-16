export const queryKeys = {
  fighter: "api/fighter",
  search: "api/fighter/search",
  countFighter: "api/fighter/count",

  vote: "api/vote",

  match: "api/match",

  comments: "api/comment",

  auth: "/api/user",
  login: "api/login",

  fighterPaginate: "q/paginate",
  isSelectedFighter: "q/isSelectedFighter",
  fighterEditData: "q/fighterEditData",
  registerMatchData: "q/registerMatchData",
  deleteMatchSub: "q/deleteMatchSub",
} as const