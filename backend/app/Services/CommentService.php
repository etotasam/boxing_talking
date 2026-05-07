<?php

namespace App\Services;

use Exception;
use Symfony\Component\HttpKernel\Exception\HttpException;
use App\Repositories\Interfaces\CommentRepositoryInterface;
use App\Models\Comment;
use App\Models\BoxingMatch;
use Illuminate\Contracts\Pagination\CursorPaginator;

class CommentService
{
  private const FETCH_COMMENTS_LIMIT_COUNT = 10;

  public function __construct(
    protected CommentRepositoryInterface $commentRepository
  ) {}

  /**
   * コメントの取得
   * @param int $matchId
   * @param string|null $cursor
   *
   * @return CursorPaginator
   */
  public function fetchComments(int $matchId, ?string $cursor = null): CursorPaginator
  {

    $match = BoxingMatch::find($matchId);
    if (!$match) {
      return throw new HttpException(404, 'Match not found');
    }

    $comments = Comment::where('match_id', $matchId)
      ->orderBy('created_at', 'desc')
      ->orderBy('id', 'desc')
      ->cursorPaginate(self::FETCH_COMMENTS_LIMIT_COUNT, ['*'], 'cursor', $cursor);

    return $comments;
  }


  /**
   * 新しいコメントの取得
   * @param int $matchId
   * @param string $createdAt
   *
   * @return Comment[]
   */
  public function fetchNewComments(int $matchId, string $createdAt)
  {

    $timestamp = strtotime($createdAt);
    $formattedCreatedAt = date('Y-m-d H:i:s', $timestamp);

    $comments = Comment::where(function ($q) use ($matchId, $formattedCreatedAt) {
      $q->where('match_id', $matchId);
      $q->where('created_at', ">", $formattedCreatedAt);
    })->orderBy('created_at', 'desc')->get();

    return $comments;
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
