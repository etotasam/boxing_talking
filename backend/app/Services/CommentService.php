<?php

namespace App\Services;

use Exception;
use App\Repositories\Interfaces\CommentRepositoryInterface;


class CommentService
{

  public function __construct(
    protected CommentRepositoryInterface $commentRepository
  ) {
  }

  /**
   * コメントのフォーマットと保存
   * @param string $userId
   * @param int $matchId
   * @param string $comment
   *
   * @return void
   */
  public function postCommentExecute(string $userId, int $matchId, string $comment)
  {
    $formattedComment = preg_replace('/(\n{4,})/', "\n\n\n", $comment);
    $isSuccess = $this->commentRepository->postComment($userId, $matchId, $formattedComment);
    abort_if(!$isSuccess, 500);
  }
}
