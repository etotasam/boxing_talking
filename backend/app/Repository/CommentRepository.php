<?php

namespace App\Repository;

use App\Models\Comment;

class CommentRepository
{


  /**
   * @param int matchId
   * @return void
   */
  public static function deleteCommentByMatchId($matchId): void
  {
    Comment::where("match_id", $matchId)->delete();
  }
}
