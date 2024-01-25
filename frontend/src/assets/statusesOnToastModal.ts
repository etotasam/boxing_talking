
export const STATUS = {
  COMMENT_NULL: "COMMENT_NULL",
  SUCCESS: 200,
  NOT_ACCEPTABLE: 406,
} as const

export const BG_COLOR_ON_TOAST_MODAL = {
  ERROR: "red",
  SUCCESS: "green",
  DELETE: "gray",
  NOTICE: "blue",
  NULL: "null",
  GRAY: "stone"
} as const




export const MESSAGE = {

  //? user登録
  SIGNUP_LACK_INPUT: "入力情報が不足しています",
  NAME_IS_REQUIRED: "登録には名前が必要です",
  EMAIL_IS_REQUIRED: "メールアドレスが正しくありません",
  USER_REGISTER_SUCCESSFULLY: "登録が完了しました",
  USER_REGISTER_FAILED: "登録に失敗しました。\n 入力情報に誤りがないかご確認ください",
  EMAIL_HAS_ALREADY_EXIST: "すでに登録されているEmailです",
  USER_NAME_ALREADY_USE: "すでに使われている名前です \n 別の名前を検討してください",
  NAME_CHAR_LIMIT_OVER: "名前の文字数がオーバーしています \n 30文字までです",

  // ! login form
  EMAIL_OR_PASSWORD_NO_INPUT: "Email・Passwordの入力が必要です",
  EMAIL_FAILED_VALIDATE: "Emailが正しくありません",
  // ! ログイン系
  LOGOUT_SUCCESS: "ログアウトしました",
  LOGOUT_FAILED: "ログアウト中にエラーが発生しました \n 再度ログアウトの実行を行ってください",
  LOGIN_SUCCESS: "ログインしました",
  LOGIN_FAILED: "ログインに失敗しました \n Email,Passwordに誤りがある可能性があります",
  NOT_AUTHORIZED: 'ログインが必要です',
  NOT_CREATE_GUEST_BY_LIMIT: '1日に生成できるゲストユーザー数の制限に達した為作成できません \n お手数ですが日付が変わってから再度お試しください',
  NULL: "",

  //? 試合の登録・試合の編集
  MATCH_IS_NOT_MODIFIED: "試合情報の変更がありません",
  MATCH_IS_NOT_SELECTED: "対象の試合を選択してください",
  MATCH_UPDATE_FAILED: "試合情報の更新に失敗しました",
  MATCH_UPDATE_SUCCESS: "試合情報を更新しました",
  MATCH_DELETED: "試合情報を削除しました",
  MATCH_DELETE_FAILED: "試合情報の削除に失敗しました \n 一度画面を更新し、再度削除の実行を行ってください",

  MATCH_HAS_NOT_ENTRIES: "未入力・未選択の項目があります",
  MATCH_NOT_SELECTED: "対象の試合を選択してください",
  MATCH_NOT_SELECTED_BOXER: "試合を組む選手を選択してください",
  MATCH_NOT_ALTER: "試合情報に変更がありません",
  MATCH_REGISTER_SUCCESS: "試合情報の登録が完了しました",
  MATCH_REGISTER_FAILED: "試合情報の登録に失敗しました \n 再度登録してください",

  MATCH_RESULT_STORED: "試合結果を登録しました",
  MATCH_RESULT_STORE_FAILED: "試合結果を登録出来ませんでした",

  INVALID_COUNTRY: "国の選択がありません",

  FIGHTER_NOT_ABLE_TO_REGISTER: "すでに登録されている選手です",
  FIGHTER_REGISTER_PENDING: "選手登録を実行中...",
  FIGHTER_REGISTER_SUCCESS: "選手を登録しました",
  FIGHTER_REGISTER_FAILED: "選手の登録に失敗しました",
  //? 選手編/選手登録
  BOXER_DELETED: "選手を削除しました",
  BOXER_COUNTRY_IS_REQUIRED: "国籍の選択は必須です",
  BOXER_NOT_EDIT: "選手データに変更がありません",
  BOXER_NO_SELECTED: "対象選手を選択してください",
  BOXER_NAME_UNDEFINED: "名前の入力が必要です",
  BOXER_IS_ALREADY_EXISTS: "同じ名前の選手がすでに存在しています",
  BOXER_IS_ALREADY_SETUP_MATCH: "選手は試合が組まれています。削除出来ません",
  ILLEGAL_DATA: "不正なデータです",

  FIGHTER_EDIT_SUCCESS: "選手情報が更新されました",
  FIGHTER_EDIT_FAILED: "選手情報の編集に失敗しました \n 再度行ってください",
  FAILED_DELETE_BOXER: "選手の削除に失敗しました \n 再度行ってください",
  FIGHTER_DELETING: "選手情報を削除中...",
  COMMENT_IS_NOT_ENTER: 'コメントの入力がありません',
  COMMENT_IS_TOO_LONG: 'コメントが長すぎます。\n 投稿は1000文字までです',
  FAILED_POST_COMMENT_WITHOUT_AUTH: 'コメント投稿にはログインが必要です',
  COMMENT_IS_EMPTY: 'コメントを入力してください',
  COMMENT_POST_SUCCESS: 'コメントを投稿しました',
  COMMENT_DELETE_FAILED: `コメントの削除に失敗しました \n 一度更新して、再度削除を実行してください`,
  COMMENT_DELETED: 'コメントを削除しました',
  // COMMENT_DELETING: `削除中です.... \n そのままお待ち下さい`,
  COMMENT_DELETE_CONFIRM: "※コメントを削除します",
  COMMENT_POST_FAILED: `コメント投稿に失敗しました \n お手数ですが、時間を空けて再度投稿してください`,
  COMMENT_POST_NULL: `コメントを入力してください`,

  //? 投票
  SUCCESSFUL_VOTE_WIN_LOSS_PREDICTION: '投票が完了しました',
  FAILED_VOTE_WIN_LOSS_PREDICTION: '投票に失敗しました。\n ページの更新後再度実行してください',
  ALREADY_HAVE_DONE_VOTE: "勝敗予想はすでに投票しています",
  MATCH_IS_ALREADY_DONE: "投票期日が過ぎています。\n 投票は試合の前日までです",

  //?セッション切れ
  SESSION_EXPIRED: 'セッションが無効です \n ページを更新してから再度実行してください'
} as const


// export type MessageType = typeof MESSAGE[keyof typeof MESSAGE]
// export type BgColorType = typeof BG_COLOR_ON_TOAST_MODAL[keyof typeof BG_COLOR_ON_TOAST_MODAL]