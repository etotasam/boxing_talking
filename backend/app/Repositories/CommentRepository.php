<?php

namespace App\Repositories;

use App\Models\Comment;
use App\Repositories\Interfaces\CommentRepositoryInterface;

class CommentRepository implements CommentRepositoryInterface
{
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
