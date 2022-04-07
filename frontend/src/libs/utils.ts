
export const STATUS = {
  COMMENT_NULL: "COMMENT_NULL",
  SUCCESS: 200
} as const


export enum MESSAGE {
  COMMENT_POST_SUCCESSFULLY = "コメントを投稿しました",
  COMMENT_POST_FAILED = `コメント投稿に失敗しました \n お手数ですが、時間を空けて再度投稿してください`,
  COMMENT_POST_NULL = `コメントを入力してください`,
  VOTE_FAILD = `投票はできません \n すでに投票しています`,
  VOTE_SUCCESSFULLY = `投票しました`,
  COMMENT_DELETING = `削除中です.... \n そのままお待ち下さい`,
  COMMENT_DELETE_CONFIRM = "※コメントを削除します",
  COMMENT_DELETED = "コメントを削除しました",
  COMMENT_DELETE_FAILED = `コメントの削除に失敗しました \n 一度更新して、再度削除を実行してください`,
  MESSAGE_LOGOUT = "ログアウトしました",
  MESSAGE_LOGIN = "ログインしました",
  NULL = ""
}

// export const MESSAGE = {
//   COMMENT_POST_SUCCESSFULLY: "コメントを投稿しました",
//   COMMENT_POST_FAILED: `コメント投稿に失敗しました \n お手数ですが、時間を空けて再度投稿してください`,
//   COMMENT_POST_NULL: `コメントを入力してください`,
//   VOTE_FAILD: `投票はできません \n すでに投票しています`,
//   VOTE_SUCCESSFULLY: (fighterName: string) => {
//     return `${fighterName}に投票しました`
//   },
//   COMMENT_DELETING: `削除中です.... \n そのままお待ち下さい`,
//   COMMENT_DELETE_CONFIRM: "※コメントを削除します",
//   COMMENT_DELETED: "コメントを削除しました",
//   COMMENT_DELETE_FAILED: `コメントの削除に失敗しました \n 一度更新して、再度削除を実行してください`,
//   NULL: ""
// } as const
