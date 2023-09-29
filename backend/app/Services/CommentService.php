<?php

namespace App\Services;

use Illuminate\Http\Response;
use App\Models\BoxingMatch;
use App\Models\Comment;
use App\Services\UserService;

class CommentService
{

  public function __construct(Comment $comment, UserService $userService)
  {
    $this->comment = $comment;
    $this->userService = $userService;
  }



  /**
   * @param BoxingMatch match
   * @return array (key-value)
   */
  public function getCommentsOfMatch($match)
  {
    $commentsArray = [];
    $thisMatchComments = $match->comments;
    foreach ($thisMatchComments as $commentData) {
      $userID = $commentData->user_id;
      $createdAt = $commentData->created_at;

      $user = $this->userService->getUser($userID);
      $postUserName = isset($user) ? $user->name : null;

      $formattedComment = nl2br(htmlspecialchars($commentData->comment));
      array_unshift($commentsArray, ['id' => $commentData->id, "post_user_name" => $postUserName, "comment" => $formattedComment, "created_at" => $createdAt]);
    }

    return $commentsArray;
  }

  /**
   * @param int userID
   * @param int matchID
   * @param string comment
   *
   * @return void
   */
  public function postCommentAndFormat($userID, $matchID, $comment): void
  {
    $formattedComment = preg_replace('/(\n{4,})/', "\n\n\n", $comment);
    $this->comment->create([
      "user_id" => $userID,
      "match_id" => $matchID,
      "comment" => $formattedComment,
    ]);
  }
}
