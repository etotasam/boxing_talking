export const COMMENT_POST_SUCCESSFULLY = "コメントを投稿しました"
export const COMMENT_POST_FAILED = `コメント投稿に失敗しました \n お手数ですが、時間を空けて再度投稿してください`
export const COMMENT_POST_NULL = `コメントを入力してください`

export const VOTE_FAILD = `投票はできません \n すでに投票しています`
export const voteSuccessfully = (fighterName: string) => {
  return `${fighterName}に投票しました`
}

export const COMMENT_DELETING = `削除中です.... \n そのままお待ち下さい`
export const COMMENT_DELETE_CONFIRM = "※コメントを削除します"

export const COMMENT_DELETED = "コメントを削除しました"
export const COMMENT_DELETE_FAILED = `コメントの削除に失敗しました \n 一度更新して、再度削除を実行してください`
