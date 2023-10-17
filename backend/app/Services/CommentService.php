<?php

namespace App\Services;

use Exception;
use App\Services\AuthService;
use App\Repositories\Interfaces\MatchRepositoryInterface;
use App\Repositories\Interfaces\CommentRepositoryInterface;


class CommentService
{

  protected $matchRepository;
  protected $commentRepository;
  public function __construct(AuthService $authService, MatchRepositoryInterface $matchRepository, CommentRepositoryInterface $commentRepository)
  {
    $this->authService = $authService;
    $this->matchRepository = $matchRepository;
    $this->commentRepository = $commentRepository;
  }

  /**
   * 各試合のコメントの取得
   *
   * @param int $matchId
   * @return array 試合へのコメント一覧
   */
  public function getComments(int $matchId)
  {
    try {
      $match = $this->matchRepository->getMatchById($matchId);
      $commentsOnMatch = $match->comments()->orderBy('created_at', 'desc')->get();
    } catch (Exception $e) {
      return response()->json(["message" => $e->getMessage()], $e->getCode() ?: 500);
    }

    return $commentsOnMatch;
  }

  /**
   * コメントのフォーマットと保存
   *
   * @param string $userId
   * @param int $matchId
   * @param string $comment
   *
   * @return void
   */
  public function postCommentExecute(string $userId, int $matchId, string $comment)
  {
    $formattedComment = preg_replace('/(\n{4,})/', "\n\n\n", $comment);
    $postComment = $this->commentRepository->postComment($userId, $matchId, $formattedComment);
    if ((bool) !$postComment) {
      throw new \Exception("Comment post failed");
    }
  }
}
