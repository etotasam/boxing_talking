<?php

namespace App\Repository;

use App\Models\Comment;

class CommentRepository
{


  /**
   * @param int matchId
   * @return void
   */
  public static function delete($matchId): void
  {
    Comment::where("match_id", $matchId)->delete();
  }


  public static function store(string $userId, int $matchId, string $comment): void
  {
    Comment::create([
      "user_id" => $userId,
      "match_id" => $matchId,
      "comment" => $comment,
    ]);
  }
}
