<?php

namespace App\Repositories;

use Illuminate\Support\Collection;
use App\Models\Comment;
use App\Models\BoxingMatch;
use App\Repositories\Interfaces\CommentRepositoryInterface;

class CommentRepository implements CommentRepositoryInterface
{

  /**
   * 試合に紐づいたコメント一覧を取得
   * @param int $matchId
   * @return Collection
   */
  public function getCommentsOnMatchByMatchId(int $matchId)
  {
    return BoxingMatch::findOrFail($matchId)->comments()->orderBy('created_at', 'desc')->get();
  }

  /**
   * コメント投稿
   * @param string $userId
   * @param int $matchId
   * @param string $comment
   *
   * @return Comment|null
   */
  public function postComment(string $userId, int $matchId, string $comment)
  {
    $commentInstance = new Comment;
    $commentInstance->fill([
      "user_id" => $userId,
      "match_id" => $matchId,
      "comment" => $comment,
    ]);
    return $commentInstance->save();
  }

  /**
   * 試合に紐づいているコメントをすべて削除
   * @param int $matchId
   *
   * @return int
   */
  public function deleteAllCommentOnMatch(int $matchId)
  {
    return Comment::where("match_id", $matchId)->delete();
  }

  /**
   * コメント削除
   * @param int $commentId
   *
   * @return bool
   */
  public function deleteComment(int $commentId)
  {
    $result = Comment::destroy($commentId);
    return (bool) $result;
  }
}
