<?php

namespace App\Services;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use App\Models\BoxingMatch;
use App\Services\UserService;
use App\Services\AuthService;
use App\Services\MatchService;
use App\Repository\CommentRepository;
use App\Repository\MatchRepository;
use App\Repository\UserRepository;


class CommentService
{

  public function __construct(MatchService $matchService, AuthService $authService)
  {
    $this->matchService = $matchService;
    $this->authService = $authService;
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
      $match = $this->matchService->getSingleMatch($matchId);
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
  public function postComment(string $userId, int $matchId, string $comment)
  {
    $formattedComment = preg_replace('/(\n{4,})/', "\n\n\n", $comment);
    CommentRepository::store($userId, $matchId, $formattedComment);
  }
}
