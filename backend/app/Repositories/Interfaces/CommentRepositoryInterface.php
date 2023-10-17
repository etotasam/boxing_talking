<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;
use App\Models\Comment;

interface CommentRepositoryInterface
{
  /**
   * @param int $matchId
   */
  public function getCommentsOnMatchByMatchId(int $matchId);

  /**
   * @param string $userId
   * @param int $matchId
   * @param string $comment
   *
   * @return Comment|null
   */
  public function postComment(string $userId, int $matchId, string $comment);


  /**
   * 試合に紐づいているコメントをすべて削除
   * @param int $matchId
   *
   * @return int
   */
  public function deleteAllCommentOnMatch(int $matchId);

  /**
   * コメント削除
   * @param int $commentId
   *
   * @return bool
   */
  public function deleteComment(int $commentId);
}
