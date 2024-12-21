<?php

namespace App\Services;

use Exception;
use App\Repositories\Interfaces\CommentRepositoryInterface;
use App\Models\Comment;

class CommentService
{

  public function __construct(
    protected CommentRepositoryInterface $commentRepository
  ) {
  }

  /**
   * 指定の範囲のコメントを取得
   * 指定の試合のコメント $matchId
   * 何ページ目を取得するのか $page
   * 取得する件数 $limit
   * 指定の時間より前の時間のコメント $createdAt
   * @param int $matchId
   * @param int $page
   * @param int $limit
   * @param string $createAt
   *
   * @return Comment[]
   */
  public function fetchComments(int $matchId, int $page, int $limit, string $createdAt)
  {

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
