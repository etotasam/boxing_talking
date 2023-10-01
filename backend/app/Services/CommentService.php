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

class CommentService
{

  public function __construct(UserService $userService, MatchService $matchService, AuthService $authService)
  {
    $this->userService = $userService;
    $this->matchService = $matchService;
    $this->authService = $authService;
  }

  /**
   * コントローラーのpost
   */
  public function postComment(int $matchId, string $comment): JsonResponse
  {
    try {
      $userId = $this->authService->getUserIdOrGuestUserId();
      $match = $this->matchService->getSingleMatch($matchId);
      $this->storeCommentAndFormat($userId, $match['id'], $comment);
      return response()->json(["message" => "posted comment successfully"], 200);
    } catch (Exception $e) {
      if ($e->getCode()) {
        return response()->json(["message" => $e->getMessage()], $e->getCode());
      }
      return response()->json(["message" => $e->getMessage()], 500);
    }
  }

  /**
   * コントローラーのfetch
   */
  public function getComments(int $matchId): JsonResponse
  {
    try {
      if (!$matchId) {
        throw new Exception('Failed fetch comments', 400);
      }
      $match = $this->matchService->getSingleMatch($matchId);
      $commentsOfMatch = $this->getCommentsOnMatch($match);
      return response()->json($commentsOfMatch, 200);
    } catch (Exception $e) {
      if ($e->getCode()) {
        return response()->json(["message" => $e->getMessage()], $e->getCode());
      }
      return response()->json(["message" => $e->getMessage()], 500);
    }
  }



  /**
   * @return array (key-value)
   */
  private function getCommentsOnMatch(BoxingMatch $match): array
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


  public function storeCommentAndFormat(string $userId, int $matchId, string $comment): void
  {
    $formattedComment = preg_replace('/(\n{4,})/', "\n\n\n", $comment);
    CommentRepository::store($userId, $matchId, $formattedComment);
  }
}
