<?php

namespace App\Services;

use Exception;
use Symfony\Component\HttpKernel\Exception\HttpException;
use App\Repositories\Interfaces\CommentRepositoryInterface;
use App\Models\Comment;
use App\Models\BoxingMatch;

class CommentService
{

  public function __construct(
    protected CommentRepositoryInterface $commentRepository
  ) {}


  public function fetchComments($matchId, $page, $limit, $createdAt)
  {

    $match = BoxingMatch::find($matchId);
    if (!$match) {
      return throw new HttpException(404, 'Match not found');
    }
    $timestamp = strtotime($createdAt);
    $formattedCreatedAt = date('Y-m-d H:i:s', $timestamp);
    $offset = ($page - 1) * $limit;

    $comments = Comment::where(function ($q) use ($matchId, $formattedCreatedAt) {
      $q->where('match_id', $matchId);
      $q->where('created_at', "<=", $formattedCreatedAt);
    })->orderBy('created_at', 'desc')->offset($offset)->limit($limit)->get();

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
